import {
  Component,
  inject,
  Output,
  EventEmitter,
  HostListener,
  Input,
  signal,
  Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat.service';
import { SettingsService } from '../../../core/services/settings.service';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { Chat } from '../../../core/models';
import { DeleteChatModalComponent } from '../../chat/components/delete-chat-modal.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, DeleteChatModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private chatService = inject(ChatService);
  private settingsService = inject(SettingsService);
  private firebase = inject(FirebaseService);
  private router = inject(Router);

  @Input() isCollapsed: Signal<boolean> = signal(false);
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  private _isHoveringHome = signal(false);
  private _isDeleteModalOpen = signal(false);
  private _chatToDelete = signal<Chat | null>(null);

  readonly chats = this.chatService.chats;
  readonly activeChat = this.chatService.activeChat;
  readonly hasChats = this.chatService.hasChats;
  readonly isDarkMode = this.settingsService.isDarkMode;
  readonly isHoveringHome = this._isHoveringHome.asReadonly();
  readonly currentUser = this.firebase.user;
  readonly isDeleteModalOpen = this._isDeleteModalOpen.asReadonly();
  readonly chatToDelete = this._chatToDelete.asReadonly();

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.key === 'O') {
      event.preventDefault();
      this.createNewChat();
    }
  }

  async createNewChat(): Promise<void> {
    await this.chatService.createNewChat();
  }

  selectChat(chat: Chat): void {
    this.chatService.setActiveChat(chat);
  }

  deleteChat(chatId: string, event: Event): void {
    event.stopPropagation();
    const chat = this.chats().find(c => c.id === chatId);
    if (chat) {
      this._chatToDelete.set(chat);
      this._isDeleteModalOpen.set(true);
    }
  }

  async confirmDeleteChat(): Promise<void> {
    const chat = this._chatToDelete();
    if (chat) {
      try {
        await this.chatService.deleteChat(chat.id);
        this.closeDeleteModal();
      } catch (error) {
        console.error('Failed to delete chat:', error);
        alert('Failed to delete chat. Please try again.');
      }
    }
  }

  closeDeleteModal(): void {
    this._isDeleteModalOpen.set(false);
    this._chatToDelete.set(null);
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

  async signOut(): Promise<void> {
    try {
      await this.firebase.signOut();
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Sign out failed', err);
    }
  }

  getAvatarUrl(email?: string | null): string | null {
    if (!email) return null;
    const parts = email.split('@');
    const domain = parts.length > 1 ? parts[1] : null;
    if (!domain) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}`;
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

  onHomeMouseEnter(): void {
    if (this.isCollapsed()) {
      this._isHoveringHome.set(true);
    }
  }

  onHomeMouseLeave(): void {
    if (this.isCollapsed()) {
      this._isHoveringHome.set(false);
    }
  }

  shouldShowCollapseIcon(): boolean {
    return this.isCollapsed() && this.isHoveringHome();
  }

  shouldShowHomeIcon(): boolean {
    return !this.isCollapsed() || (this.isCollapsed() && !this.isHoveringHome());
  }
}
