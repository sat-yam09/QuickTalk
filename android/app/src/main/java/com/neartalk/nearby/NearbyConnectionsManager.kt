package com.neartalk.nearby

import android.content.Context
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import java.nio.charset.StandardCharsets

sealed class NearbyEvent {
    data class EndpointFound(val endpointId: String, val endpointInfo: DiscoveredEndpointInfo) : NearbyEvent()
    data class EndpointLost(val endpointId: String) : NearbyEvent()
    data class ConnectionInitiated(val endpointId: String, val connectionInfo: ConnectionInfo) : NearbyEvent()
    data class ConnectionResultReceived(val endpointId: String, val resolution: com.google.android.gms.common.api.Status) : NearbyEvent()
    data class Disconnected(val endpointId: String) : NearbyEvent()
    data class MessageReceived(val endpointId: String, val messageText: String) : NearbyEvent()
    data class Error(val message: String) : NearbyEvent()
}

class NearbyConnectionsManager(private val context: Context) {

    private val SERVICE_ID = "com.neartalk.offline.messenger"
    private val STRATEGY = Strategy.P2P_POINT_TO_POINT

    private val connectionsClient = Nearby.getConnectionsClient(context)

    private val _isAdvertising = MutableStateFlow(false)
    val isAdvertising: StateFlow<Boolean> = _isAdvertising

    private val _isDiscovering = MutableStateFlow(false)
    val isDiscovering: StateFlow<Boolean> = _isDiscovering

    private val _events = MutableSharedFlow<NearbyEvent>(extraBufferCapacity = 64)
    val events: SharedFlow<NearbyEvent> = _events

    val connectedEndpoints = mutableSetOf<String>()

    fun isGooglePlayServicesAvailable(): Boolean {
        val availability = GoogleApiAvailability.getInstance()
        val resultCode = availability.isGooglePlayServicesAvailable(context)
        return resultCode == ConnectionResult.SUCCESS
    }

    fun startAdvertising(localUserName: String) {
        if (!isGooglePlayServicesAvailable()) {
            _events.tryEmit(NearbyEvent.Error("Google Play Services is required for Nearby Connections."))
            return
        }

        val advertisingOptions = AdvertisingOptions.Builder()
            .setStrategy(STRATEGY)
            .build()

        connectionsClient.startAdvertising(
            localUserName,
            SERVICE_ID,
            connectionLifecycleCallback,
            advertisingOptions
        ).addOnSuccessListener {
            _isAdvertising.value = true
        }.addOnFailureListener { e ->
            _isAdvertising.value = false
            _events.tryEmit(NearbyEvent.Error("Failed to start advertising: ${e.localizedMessage}"))
        }
    }

    fun stopAdvertising() {
        connectionsClient.stopAdvertising()
        _isAdvertising.value = false
    }

    fun startDiscovery() {
        if (!isGooglePlayServicesAvailable()) {
            _events.tryEmit(NearbyEvent.Error("Google Play Services is required for Nearby Connections."))
            return
        }

        val discoveryOptions = DiscoveryOptions.Builder()
            .setStrategy(STRATEGY)
            .build()

        connectionsClient.startDiscovery(
            SERVICE_ID,
            endpointDiscoveryCallback,
            discoveryOptions
        ).addOnSuccessListener {
            _isDiscovering.value = true
        }.addOnFailureListener { e ->
            _isDiscovering.value = false
            _events.tryEmit(NearbyEvent.Error("Failed to start discovery: ${e.localizedMessage}"))
        }
    }

    fun stopDiscovery() {
        connectionsClient.stopDiscovery()
        _isDiscovering.value = false
    }

    fun requestConnection(localUserName: String, targetEndpointId: String) {
        connectionsClient.requestConnection(
            localUserName,
            targetEndpointId,
            connectionLifecycleCallback
        ).addOnFailureListener { e ->
            _events.tryEmit(NearbyEvent.Error("Connection request failed: ${e.localizedMessage}"))
        }
    }

    fun acceptConnection(endpointId: String) {
        connectionsClient.acceptConnection(endpointId, payloadCallback)
            .addOnFailureListener { e ->
                _events.tryEmit(NearbyEvent.Error("Accept connection failed: ${e.localizedMessage}"))
            }
    }

    fun rejectConnection(endpointId: String) {
        connectionsClient.rejectConnection(endpointId)
    }

    fun disconnect(endpointId: String) {
        connectionsClient.disconnectFromEndpoint(endpointId)
        connectedEndpoints.remove(endpointId)
        _events.tryEmit(NearbyEvent.Disconnected(endpointId))
    }

    fun stopAllEndpoints() {
        connectionsClient.stopAllEndpoints()
        connectedEndpoints.clear()
        stopAdvertising()
        stopDiscovery()
    }

    fun sendMessage(endpointId: String, text: String): Boolean {
        val bytes = text.toByteArray(StandardCharsets.UTF_8)
        val payload = Payload.fromBytes(bytes)
        connectionsClient.sendPayload(endpointId, payload)
        return true
    }

    // Callbacks
    private val endpointDiscoveryCallback = object : EndpointDiscoveryCallback() {
        override fun onEndpointFound(endpointId: String, info: DiscoveredEndpointInfo) {
            _events.tryEmit(NearbyEvent.EndpointFound(endpointId, info))
        }

        override fun onEndpointLost(endpointId: String) {
            _events.tryEmit(NearbyEvent.EndpointLost(endpointId))
        }
    }

    private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, info: ConnectionInfo) {
            // Authentication token (verification code) is provided in ConnectionInfo.authenticationDigits
            _events.tryEmit(NearbyEvent.ConnectionInitiated(endpointId, info))
        }

        override fun onConnectionResult(endpointId: String, resolution: ConnectionResolution) {
            if (resolution.status.isSuccess) {
                connectedEndpoints.add(endpointId)
            } else {
                connectedEndpoints.remove(endpointId)
            }
            _events.tryEmit(NearbyEvent.ConnectionResultReceived(endpointId, resolution.status))
        }

        override fun onDisconnected(endpointId: String) {
            connectedEndpoints.remove(endpointId)
            _events.tryEmit(NearbyEvent.Disconnected(endpointId))
        }
    }

    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            if (payload.type == Payload.Type.BYTES) {
                val bytes = payload.asBytes()
                if (bytes != null) {
                    val messageText = String(bytes, StandardCharsets.UTF_8)
                    _events.tryEmit(NearbyEvent.MessageReceived(endpointId, messageText))
                }
            }
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {
            // Can be used to track send/delivery progress
        }
    }
}
