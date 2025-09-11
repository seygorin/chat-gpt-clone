import { Component, inject, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat.service';
import { SettingsService } from '../../../core/services/settings.service';
import { Chat } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private chatService = inject(ChatService);
  private settingsService = inject(SettingsService);

  @Output() closeSidebar = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  readonly chats = this.chatService.chats;
  readonly activeChat = this.chatService.activeChat;
  readonly hasChats = this.chatService.hasChats;
  readonly isDarkMode = this.settingsService.isDarkMode;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.key === 'O') {
      event.preventDefault();
      this.createNewChat();
    }
  }

  createNewChat(): void {
    this.chatService.createChat();
  }

  selectChat(chat: Chat): void {
    this.chatService.setActiveChat(chat);
  }

  deleteChat(chatId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      this.chatService.deleteChat(chatId);
    }
  }

  toggleTheme(): void {
    const currentTheme = this.settingsService.theme();
    this.settingsService.setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  getChatItemClasses(chat: Chat): string {
    const isActive = this.activeChat()?.id === chat.id;
    const baseClasses = 'border border-transparent';

    if (isActive) {
      return `${baseClasses} bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800`;
    } else {
      return `${baseClasses} hover:bg-gray-100 dark:hover:bg-gray-700`;
    }
  }

  closeSidebarHandler(): void {
    this.closeSidebar.emit();
  }

  toggleSidebarHandler(): void {
    this.toggleSidebar.emit();
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }
}
