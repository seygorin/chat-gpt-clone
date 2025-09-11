import { Component, viewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { GeminiService } from '../../../core/services/gemini.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent {
  private chatService = inject(ChatService);
  private geminiService = inject(GeminiService);
  private settingsService = inject(SettingsService);

  readonly messageInput = viewChild<ElementRef<HTMLTextAreaElement>>('messageInput');

  messageText = '';
  readonly isLoading = signal(false);

  readonly canSend = () => this.messageText.trim().length > 0 && !this.isLoading();

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage(): Promise<void> {
    if (!this.canSend()) return;

    const content = this.messageText.trim();
    this.messageText = '';
    this.isLoading.set(true);

    try {
      if (!this.chatService.hasActiveChat()) {
        this.chatService.createNewChat();
      }

      this.chatService.addMessage({
        content,
        role: 'user',
      });

      this.chatService.setTyping(true);

      const geminiConfig = this.settingsService.geminiConfig();
      const messages = this.chatService.activeMessages();

      const response$ = this.geminiService.generateStreamResponse(messages, geminiConfig);

      let assistantResponse = '';

      response$.subscribe({
        next: (chunk: string) => {
          assistantResponse += chunk;
        },
        complete: () => {
          this.chatService.addMessage({
            content: assistantResponse,
            role: 'assistant',
          });

          this.chatService.setTyping(false);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Error generating response:', error);
          this.chatService.setTyping(false);
          this.isLoading.set(false);
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      this.isLoading.set(false);
    }
  }

  getSendButtonClasses(): string {
    if (this.canSend()) {
      return 'bg-primary-600 hover:bg-primary-700 text-white';
    } else {
      return 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed';
    }
  }
}
