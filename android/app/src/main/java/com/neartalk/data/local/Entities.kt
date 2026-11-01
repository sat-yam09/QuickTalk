package com.neartalk.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val deviceId: String,
    val displayName: String,
    val avatarIdentifier: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "conversations")
data class ConversationEntity(
    @PrimaryKey val conversationId: String,
    val participantId: String,
    val participantName: String,
    val lastMessage: String,
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "messages")
data class MessageEntity(
    @PrimaryKey val messageId: String,
    val conversationId: String,
    val senderId: String,
    val messageContent: String,
    val timestamp: Long = System.currentTimeMillis(),
    val deliveryStatus: String = "sent", // "sending", "sent", "failed"
    val messageType: String = "text"
)
