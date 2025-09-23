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
  readonly textareaRows = signal(1);

  readonly canSend = () => this.messageText.trim().length > 0 && !this.isLoading();
  readonly maxRows = 20;

  private resizeTimeout: number | undefined;

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onInput(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.adjustTextareaHeight();
    }, 10);
  }

  private adjustTextareaHeight(): void {
    const textarea = this.messageInput()?.nativeElement;
    if (!textarea) return;

    if (!this.messageText.trim()) {
      this.textareaRows.set(1);
      return;
    }

    const tempTextarea = document.createElement('textarea');
    tempTextarea.style.cssText = textarea.style.cssText;
    tempTextarea.style.position = 'absolute';
    tempTextarea.style.visibility = 'hidden';
    tempTextarea.style.height = 'auto';
    tempTextarea.style.width = textarea.offsetWidth + 'px';
    tempTextarea.value = this.messageText;

    document.body.appendChild(tempTextarea);

    const scrollHeight = tempTextarea.scrollHeight;
    document.body.removeChild(tempTextarea);

    const lineHeight = 24;
    const paddingY = 24;
    const minHeight = 48;

    let rows = 1;

    if (scrollHeight > minHeight) {
      const contentHeight = scrollHeight - paddingY;
      rows = Math.ceil(contentHeight / lineHeight);
    }

    const explicitLines = (this.messageText.match(/\n/g) || []).length + 1;
    rows = Math.max(rows, explicitLines);

    const clampedRows = Math.max(1, Math.min(rows, this.maxRows));
    this.textareaRows.set(clampedRows);
  }

  async sendMessage(): Promise<void> {
    if (!this.canSend()) return;

    const content = this.messageText.trim();
    this.messageText = '';
    this.textareaRows.set(1);
    this.isLoading.set(true);

    try {
      if (!this.chatService.hasActiveChat()) {
        await this.chatService.createNewChat();
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
      return 'bg-black text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/90 z-10';
    } else {
      return 'bg-gray-400 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-not-allowed opacity-80 z-0';
    }
  }

  openSettingsModal(): void {
    this.isSettingsModalOpen.set(true);
  }

  closeSettingsModal(): void {
    this.isSettingsModalOpen.set(false);
  }
}
