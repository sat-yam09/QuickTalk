# QuickTalk — Minimalist Offline Nearby Messenger

A modern, private peer-to-peer messaging application inspired by the simplicity and device discovery experience of Google Quick Share.

QuickTalk allows two nearby Android users to discover each other, establish a direct wireless connection, and exchange text messages without:
- SIM cards
- Phone numbers
- Mobile data
- Internet connectivity
- Centralized messaging servers
- Cloud accounts

---

## Technical Architecture & Design System

- **Platform:** Native Android (Min SDK 28 / Android 9, Target SDK 35 / Android 15)
- **Language:** Kotlin 2.0+
- **UI Framework:** Jetpack Compose with Material 3 Design System
- **Design System:** Minimalist Black & White (monochrome, zero neon colors), geometric sans typography (Satoshi / General Sans)
- **Architecture:** Single Activity MVVM with Kotlin Coroutines & StateFlow
- **P2P Transport:** Google Play Services Nearby Connections API (`Strategy.P2P_POINT_TO_POINT`)
- **Lossless Offline Transfer:** `Payload.Type.FILE` & `Payload.Type.BYTES` for full-resolution raw photo/file streaming without compression
- **Fast QR Handshake:** Instant camera/QR optical pairing bypassing radio scan latency
- **Privacy & Security:** Disappearing self-destruct timers (30s, 1m, 5m, 1h, burn on disconnect) + in-person cryptographic authentication
- **Local Persistence:** AndroidX Room Database (`UserEntity`, `ConversationEntity`, `MessageEntity`)

---

## Project Structure

```
android/
├── build.gradle.kts
├── settings.gradle.kts
└── app/
    ├── build.gradle.kts
    └── src/main/
        ├── AndroidManifest.xml
        └── java/com/neartalk/
            ├── MainActivity.kt
            ├── ui/
            │   ├── theme/
            │   │   ├── Color.kt
            │   │   ├── Type.kt
            │   │   ├── Shape.kt
            │   │   └── Theme.kt
            │   ├── components/
            │   │   └── CommonComponents.kt
            │   └── screens/
            │       ├── WelcomeScreen.kt
            │       ├── HomeScreen.kt
            │       ├── ConnectionRequestDialog.kt
            │       ├── ChatScreen.kt
            │       └── SettingsScreen.kt
            ├── viewmodel/
            │   └── MainViewModel.kt
            ├── nearby/
            │   ├── NearbyConnectionsManager.kt
            │   └── NearbyPermissionHelper.kt
            └── data/
                ├── local/
                │   ├── Entities.kt
                │   ├── Daos.kt
                │   └── AppDatabase.kt
                └── repository/
                    ├── UserRepository.kt
                    └── ChatRepository.kt
```

---

## 15 Physical Device Verification Test Cases

Execute these test cases with two physical Android devices (Device A and Device B):

1. **Both devices open the application:** Verify clean entry on WelcomeScreen.
2. **Both devices create temporary identities:** Tap dice icon or input custom name; tap "Continue".
3. **Both devices enable discovery:** Tap "Start discovery" on both devices.
4. **Device A discovers Device B:** Device B appears in Device A's "Nearby devices" list.
5. **Device A sends a connection request:** Tap "Connect" next to Device B.
6. **Device B receives the request:** Verification card appears on Device B showing Device A's name.
7. **Connection authentication verification:** Check that the 28sp numeric code matches on both screens; tap "Accept" on both.
8. **Device A sends a text message:** Type message and tap circular send button.
9. **Device B receives the message:** Real-time arrival into chat stream with sound/vibration.
10. **Device B replies:** Real-time two-way dialogue without delay.
11. **Both devices display conversation correctly:** Message bubbles adhere to 18dp radius with 6dp corner nearest sender.
12. **Disable internet (Airplane Mode with Bluetooth & Wi-Fi active):** Toggle off cellular data and router internet.
13. **Messaging continues to work offline:** Transmit text payloads; confirm direct Wi-Fi Direct / BLE peer-to-peer delivery.
14. **Disconnect and reconnect:** Close app on one device; reopen and re-establish connection.
15. **Conversation history persists:** Verify Room Database preserves prior messages and timestamps across process restarts.
