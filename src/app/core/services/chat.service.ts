import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Chat, Message, MessageCreate } from '../models';
import { GeminiService, GeminiServiceConfig } from './gemini.service';
import { SettingsService } from './settings.service';
import { FirebaseService } from '../../shared/services/firebase.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private geminiService = inject(GeminiService);
  private settingsService = inject(SettingsService);
  private firebaseService = inject(FirebaseService);

  private _chats = signal<Chat[]>([]);
  private _activeChat = signal<Chat | null>(null);
  private _isTyping = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);

  readonly chats = this._chats.asReadonly();
  readonly activeChat = this._activeChat.asReadonly();
  readonly isTyping = this._isTyping.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly activeMessages = computed(() => this._activeChat()?.messages || []);
  readonly chatCount = computed(() => this._chats().length);
  readonly hasChats = computed(() => this._chats().length > 0);
  readonly hasActiveChat = computed(() => this._activeChat() !== null);
  readonly lastMessage = computed(() => {
    const messages = this.activeMessages();
    return messages[messages.length - 1] || null;
  });

  constructor() {
    this.initializeFirebaseSync();
  }

  async createChat(title = 'New Chat'): Promise<Chat> {
    const newChat: Chat = {
      id: this.generateId(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const user = this.firebaseService.user();
      if (user) {
        const firebaseId = await this.firebaseService.createChat(newChat);
        newChat.id = firebaseId;
      }
    } catch (error) {
      console.warn('Failed to save chat to Firebase:', error);
    }

    this._chats.update(chats => [...chats, newChat]);
    this.setActiveChat(newChat);

    return newChat;
  }

  async createNewChat(): Promise<Chat> {
    return await this.createChat('New Chat');
  }

  setActiveChat(chat: Chat | null): void {
    this._activeChat.set(chat);
  }

  addMessage(messageData: MessageCreate): Message {
    const message: Message = {
      ...messageData,
      id: this.generateId(),
      timestamp: new Date(),
    };

    const activeChat = this._activeChat();
    if (!activeChat) {
      throw new Error('No active chat to add message to');
    }

    const updatedChat: Chat = {
      ...activeChat,
      messages: [...activeChat.messages, message],
      updatedAt: new Date(),
    };

    this._chats.update(chats =>
      chats.map(chat => (chat.id === activeChat.id ? updatedChat : chat))
    );
    this._activeChat.set(updatedChat);

    return message;
  }

  async sendMessage(content: string): Promise<void> {
    const activeChat = this._activeChat();
    if (!activeChat) {
      throw new Error('No active chat to send message to');
    }

    const isFirstMessage = activeChat.messages.length === 0;

    const userMessage = this.addMessage({
      content,
      role: 'user',
    });

    if (isFirstMessage) {
      const newTitle = this.generateChatTitle(content);
      await this.updateChatTitle(activeChat.id, newTitle);
    }

    this.saveCurrentChatToFirebase();

    this._isLoading.set(true);
    this._isTyping.set(true);

    try {
      const currentSettings = this.settingsService.getCurrentSettings();
      const geminiConfig: GeminiServiceConfig = {
        apiKey: '',
        model: currentSettings.gemini.model || 'gemini-2.0-flash-lite',
        temperature: currentSettings.gemini.temperature ?? 0.7,
        maxTokens: currentSettings.gemini.maxTokens ?? 2048,
        topP: currentSettings.gemini.topP ?? 0.8,
        topK: currentSettings.gemini.topK ?? 40,
      };

      const allMessages = [...activeChat.messages, userMessage];

      const aiMessage = this.addMessage({
        content: '',
        role: 'assistant',
      });

      let accumulatedText = '';
      this.geminiService.generateStreamResponse(allMessages, geminiConfig).subscribe({
        next: (chunk: string) => {
          accumulatedText += chunk;
          this.updateLastMessage(aiMessage.id, accumulatedText);
        },
        complete: () => {
          this._isLoading.set(false);
          this._isTyping.set(false);
          this.saveCurrentChatToFirebase();
        },
        error: error => {
          console.error('Error generating AI response:', error);
          this.updateLastMessage(
            aiMessage.id,
            'Sorry, I encountered an error while generating a response. Please try again.'
          );
          this._isLoading.set(false);
          this._isTyping.set(false);
          this.saveCurrentChatToFirebase();
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      this._isLoading.set(false);
      this._isTyping.set(false);
    }
  }

  private updateLastMessage(messageId: string, newContent: string): void {
    const activeChat = this._activeChat();
    if (!activeChat) return;

    const updatedMessages = activeChat.messages.map(msg =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );

    const updatedChat: Chat = {
      ...activeChat,
      messages: updatedMessages,
      updatedAt: new Date(),
    };

    this._chats.update(chats =>
      chats.map(chat => (chat.id === activeChat.id ? updatedChat : chat))
    );
    this._activeChat.set(updatedChat);
  }

  setTyping(isTyping: boolean): void {
    this._isTyping.set(isTyping);
  }

  setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  getChatById(id: string): Chat | undefined {
    return this._chats().find(chat => chat.id === id);
  }

  private initializeFirebaseSync(): void {
    effect(async () => {
      const user = this.firebaseService.user();
      const isAuthLoading = this.firebaseService.isAuthLoading();

      if (isAuthLoading) {
        return;
      }

      if (user) {
        await this.loadChatsFromFirebase();
      } else {
        this._chats.set([]);
        this._activeChat.set(null);
      }
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateChatTitle(firstMessage: string): string {
    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');

    const words = cleanMessage.split(' ');
    const maxWords = 4;
    const maxLength = 50;

    let title = words.slice(0, maxWords).join(' ');

    if (title.length > maxLength) {
      title = title.substring(0, maxLength).trim();
      const lastSpaceIndex = title.lastIndexOf(' ');
      if (lastSpaceIndex > 0) {
        title = title.substring(0, lastSpaceIndex);
      }
    }

    return title || 'New Chat';
  }

  private async loadChatsFromFirebase(): Promise<void> {
    try {
      const firebaseChats = await this.firebaseService.getUserChats();
      this._chats.set(firebaseChats);

      if (firebaseChats.length > 0 && !this._activeChat()) {
        this.setActiveChat(firebaseChats[0]);
      }
    } catch (error) {
      console.error('Failed to load chats from Firebase:', error);
    }
  }

  private async saveCurrentChatToFirebase(): Promise<void> {
    const activeChat = this._activeChat();
    const user = this.firebaseService.user();

    if (!activeChat || !user) return;

    try {
      await this.firebaseService.updateChat(activeChat.id, {
        title: activeChat.title,
        messages: activeChat.messages,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.warn('Failed to save chat to Firebase:', error);
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    try {
      const user = this.firebaseService.user();
      if (user) {
        await this.firebaseService.deleteChat(chatId);
      }

      this._chats.update(chats => chats.filter(chat => chat.id !== chatId));

      if (this._activeChat()?.id === chatId) {
        this._activeChat.set(null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      throw error;
    }
  }

  async updateChatTitle(chatId: string, newTitle: string): Promise<void> {
    try {
      const user = this.firebaseService.user();
      if (user) {
        await this.firebaseService.updateChat(chatId, {
          title: newTitle,
          updatedAt: new Date(),
        });
      }

      this._chats.update(chats =>
        chats.map(chat =>
          chat.id === chatId ? { ...chat, title: newTitle, updatedAt: new Date() } : chat
        )
      );

      const activeChat = this._activeChat();
      if (activeChat?.id === chatId) {
        this._activeChat.set({ ...activeChat, title: newTitle, updatedAt: new Date() });
      }
    } catch (error) {
      console.error('Failed to update chat title:', error);
      throw error;
    }
  }
}
