import { Component, input, output, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="onBackdropClick($event)"
        tabindex="0"
        role="button"
        [attr.aria-label]="backdropAriaLabel()"
        (keydown.enter)="onBackdropClick($event)"
        (keydown.space)="onBackdropClick($event)"
        (keydown.escape)="onEscapeKey()"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4"
          [class]="modalClasses()"
          (click)="$event.stopPropagation()"
          tabindex="0"
          (keydown.enter)="$event.stopPropagation()"
          (keydown.space)="$event.stopPropagation()"
        >
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
})
export class BaseModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly backdropAriaLabel = input<string>('Close modal');
  readonly modalClasses = input<string>('p-6');

  readonly closeModal = output<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
