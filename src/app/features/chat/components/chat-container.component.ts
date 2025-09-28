import { Component, inject, signal, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat.service';
import { MessageListComponent } from './message-list.component';
import { MessageInputComponent } from './message-input.component';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [CommonModule, MessageListComponent, MessageInputComponent],
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatContainerComponent {
  private chatService = inject(ChatService);

  readonly isSidebarCollapsed = input<boolean>(false);
  readonly isMobile = input<boolean>(false);
  readonly toggleSidebar = output<void>();

  readonly activeChat = this.chatService.activeChat;
  readonly activeMessages = this.chatService.activeMessages;
  readonly hasActiveChat = this.chatService.hasActiveChat;

  private readonly welcomePhrases = [
    "What's on the agenda today?",
    'Where should we begin?',
    'Ready when you are.',
    'What are you working on?',
    "What's on your mind today?",
    'How can I help, man?',
  ];

  readonly randomWelcomePhrase = signal(this.getRandomPhrase());

  private getRandomPhrase(): string {
    const randomIndex = Math.floor(Math.random() * this.welcomePhrases.length);
    return this.welcomePhrases[randomIndex];
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
