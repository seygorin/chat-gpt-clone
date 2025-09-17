import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Chat, Message, MessageCreate } from '../models';
import { GeminiService, GeminiServiceConfig } from './gemini.service';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private geminiService = inject(GeminiService);
  private settingsService = inject(SettingsService);

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
    this.initializeAutoSave();
  }

  createChat(title = 'New Chat'): Chat {
    const newChat: Chat = {
      id: this.generateId(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this._chats.update(chats => [...chats, newChat]);
    this.setActiveChat(newChat);

    return newChat;
  }

  createNewChat(): Chat {
    return this.createChat('New Chat');
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

    const userMessage = this.addMessage({
      content,
      role: 'user',
    });

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
        },
        error: error => {
          console.error('Error generating AI response:', error);
          this.updateLastMessage(
            aiMessage.id,
            'Sorry, I encountered an error while generating a response. Please try again.'
          );
          this._isLoading.set(false);
          this._isTyping.set(false);
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

  updateChatTitle(chatId: string, title: string): void {
    this._chats.update(chats =>
      chats.map(chat => (chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat))
    );

    const activeChat = this._activeChat();
    if (activeChat?.id === chatId) {
      this._activeChat.set({ ...activeChat, title, updatedAt: new Date() });
    }
  }

  deleteChat(chatId: string): void {
    this._chats.update(chats => chats.filter(chat => chat.id !== chatId));

    const activeChat = this._activeChat();
    if (activeChat?.id === chatId) {
      this._activeChat.set(null);
    }
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

  private initializeAutoSave(): void {
    effect(() => {
      const chats = this._chats();
      if (chats.length > 0) {
        this.saveToLocalStorage(chats);
      }
    });
  }

  private saveToLocalStorage(chats: Chat[]): void {
    try {
      localStorage.setItem('chat-gpt-clone-chats', JSON.stringify(chats));
    } catch (error) {
      console.error('Failed to save chats to localStorage:', error);
    }
  }

  loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('chat-gpt-clone-chats');
      if (saved) {
        const chats = JSON.parse(saved);
        const parsedChats = chats.map((chat: Record<string, unknown>) => ({
          ...chat,
          createdAt: new Date(chat['createdAt'] as string),
          updatedAt: new Date(chat['updatedAt'] as string),
          messages: (chat['messages'] as Record<string, unknown>[]).map(
            (msg: Record<string, unknown>) => ({
              ...msg,
              timestamp: new Date(msg['timestamp'] as string),
            })
          ),
        }));
        this._chats.set(parsedChats);
      }
    } catch (error) {
      console.error('Failed to load chats from localStorage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
