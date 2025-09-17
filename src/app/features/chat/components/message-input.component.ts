import { Component, viewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { SettingsModalComponent } from '../../settings/components/settings-modal.component';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, SettingsModalComponent],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent {
  private chatService = inject(ChatService);

  readonly messageInput = viewChild<ElementRef<HTMLTextAreaElement>>('messageInput');

  messageText = '';
  readonly isLoading = signal(false);
  readonly isSettingsModalOpen = signal(false);

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

      await this.chatService.sendMessage(content);

      this.isLoading.set(false);
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

  openSettingsModal(): void {
    this.isSettingsModalOpen.set(true);
  }

  closeSettingsModal(): void {
    this.isSettingsModalOpen.set(false);
  }
}
