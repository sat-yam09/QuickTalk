import { UserProfile, Conversation, ChatMessage } from '../logic/nearTalkLogic.ts';

const USER_KEY = 'neartalk_user';
const CONVERSATIONS_KEY = 'neartalk_conversations';
const MESSAGES_KEY = 'neartalk_messages';

export const storageService = {
  getUser(): UserProfile | null {
    try {
      const isSecondPeer = typeof window !== 'undefined' && window.location.search.includes('peer=2');
      if (isSecondPeer) {
        const sessionData = sessionStorage.getItem(`${USER_KEY}_peer2`);
        return sessionData ? JSON.parse(sessionData) : null;
      }
      const sessionData = sessionStorage.getItem(USER_KEY);
      if (sessionData) return JSON.parse(sessionData);

      const localData = localStorage.getItem(USER_KEY);
      return localData ? JSON.parse(localData) : null;
    } catch {
      return null;
    }
  },

  saveUser(user: UserProfile): void {
    try {
      const isSecondPeer = typeof window !== 'undefined' && window.location.search.includes('peer=2');
      if (isSecondPeer) {
        sessionStorage.setItem(`${USER_KEY}_peer2`, JSON.stringify(user));
        return;
      }
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(CONVERSATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveConversation(convo: Conversation): void {
    try {
      const convos = this.getConversations();
      const index = convos.findIndex((c) => c.conversationId === convo.conversationId);
      if (index >= 0) {
        convos[index] = convo;
      } else {
        convos.unshift(convo);
      }
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convos));
    } catch (e) {
      console.error('Failed to save conversation', e);
    }
  },

  getMessages(conversationId: string): ChatMessage[] {
    try {
      const data = localStorage.getItem(`${MESSAGES_KEY}_${conversationId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMessage(message: ChatMessage): void {
    try {
      const list = this.getMessages(message.conversationId);
      const index = list.findIndex((m) => m.messageId === message.messageId);
      if (index >= 0) {
        list[index] = message;
      } else {
        list.push(message);
      }
      localStorage.setItem(`${MESSAGES_KEY}_${message.conversationId}`, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save message', e);
    }
  },

  clearAllData(): void {
    try {
      const convos = this.getConversations();
      convos.forEach((c) => localStorage.removeItem(`${MESSAGES_KEY}_${c.conversationId}`));
      localStorage.removeItem(CONVERSATIONS_KEY);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  },
};
