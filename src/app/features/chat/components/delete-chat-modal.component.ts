import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../../../shared/components/base-modal.component';

@Component({
  selector: 'app-delete-chat-modal',
  standalone: true,
  imports: [CommonModule, BaseModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-base-modal
      [isOpen]="isOpen()"
      [backdropAriaLabel]="'Close delete chat modal'"
      [modalClasses]="'p-6'"
      (closeModal)="onClose()"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Chat</h3>
        <button
          (click)="onClose()"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close delete chat modal"
        >
          <i class="fas fa-times w-6 h-6" aria-hidden="true"></i>
        </button>
      </div>

      <div class="mb-6">
        <p class="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this chat? This action cannot be undone.
        </p>
        @if (chatTitle()) {
          <div class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-500 dark:text-gray-400">Chat title:</p>
            <p class="text-gray-900 dark:text-gray-100 font-medium truncate">
              {{ chatTitle() }}
            </p>
          </div>
        }
      </div>

      <div class="flex space-x-3">
        <button
          type="button"
          (click)="onClose()"
          class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          (click)="onConfirm()"
          class="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 rounded-md transition-colors"
        >
          Delete
        </button>
      </div>
    </app-base-modal>
  `,
})
export class DeleteChatModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly chatTitle = input<string>('');

  readonly closeModal = output<void>();
  readonly confirmDelete = output<void>();

  onClose(): void {
    this.closeModal.emit();
  }

  onConfirm(): void {
    this.confirmDelete.emit();
    this.onClose();
  }
}
