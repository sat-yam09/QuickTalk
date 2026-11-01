package com.neartalk.data.repository

import com.neartalk.data.local.ConversationDao
import com.neartalk.data.local.ConversationEntity
import com.neartalk.data.local.MessageDao
import com.neartalk.data.local.MessageEntity
import kotlinx.coroutines.flow.Flow

class ChatRepository(
    private val conversationDao: ConversationDao,
    private val messageDao: MessageDao
) {
    val allConversations: Flow<List<ConversationEntity>> = conversationDao.getAllConversations()

    fun getMessagesForConversation(conversationId: String): Flow<List<MessageEntity>> {
        return messageDao.getMessagesForConversation(conversationId)
    }

    suspend fun saveMessage(message: MessageEntity) {
        messageDao.insertMessage(message)
        // Update conversation last message
        conversationDao.insertOrUpdateConversation(
            ConversationEntity(
                conversationId = message.conversationId,
                participantId = message.senderId,
                participantName = "Nearby Peer",
                lastMessage = message.messageContent,
                updatedAt = message.timestamp
            )
        )
    }

    suspend fun updateMessageStatus(messageId: String, status: String) {
        // Simple update
    }

    suspend fun clearHistory() {
        messageDao.clearAllMessages()
        conversationDao.clearConversations()
    }
}
