package com.neartalk.data.repository

import com.neartalk.data.local.UserDao
import com.neartalk.data.local.UserEntity
import kotlinx.coroutines.flow.Flow
import java.util.UUID

class UserRepository(
    private val userDao: UserDao
) {
    val currentUser: Flow<UserEntity?> = userDao.getUser()

    suspend fun getCurrentUserSync(): UserEntity? {
        return userDao.getUserSync()
    }

    suspend fun saveUser(displayName: String, avatarIdentifier: String): UserEntity {
        val existing = userDao.getUserSync()
        val user = existing?.copy(
            displayName = displayName,
            avatarIdentifier = avatarIdentifier
        ) ?: UserEntity(
            deviceId = "dev_" + UUID.randomUUID().toString().take(8),
            displayName = displayName,
            avatarIdentifier = avatarIdentifier,
            createdAt = System.currentTimeMillis()
        )
        userDao.insertUser(user)
        return user
    }
}
