import {
  Component,
  input,
  viewChild,
  ElementRef,
  AfterViewChecked,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../core/models';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
})
export class MessageListComponent implements AfterViewChecked {
  private settingsService = inject(SettingsService);

  readonly messages = input<Message[]>([]);
  readonly isTyping = input<boolean>(false);

  readonly messageContainer = viewChild<ElementRef>('messageContainer');

  readonly showTimestamps = computed(() => this.settingsService.settings().showTimestamps);

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  getMessageClasses(message: Message): string {
    const baseClasses = 'max-w-3xl mx-auto px-4 py-3 rounded-lg';

    if (message.role === 'user') {
      return `${baseClasses}  text-white ml-auto`;
    } else {
      return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100`;
    }
  }

  getAvatarClasses(role: 'user' | 'assistant'): string {
    if (role === 'user') {
      return 'bg-primary-600';
    } else {
      return 'bg-gray-600';
    }
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    const container = this.messageContainer()?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
