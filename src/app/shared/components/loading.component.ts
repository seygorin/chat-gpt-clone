import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass()">
      <div class="flex flex-col items-center space-y-3">
        <div [class]="spinnerClass()"></div>
        @if (showText()) {
          <p [class]="textClass()">{{ text() }}</p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  readonly isLoading = input<boolean>(true);
  readonly text = input<string>('Loading...');
  readonly showText = input<boolean>(true);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly variant = input<'default' | 'overlay' | 'inline'>('default');

  readonly containerClass = () => {
    const baseClasses = 'flex items-center justify-center';
    const variantClasses = {
      default: 'p-8',
      overlay: 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50',
      inline: 'p-4',
    };
    return `${baseClasses} ${variantClasses[this.variant()]}`;
  };

  readonly spinnerClass = () => {
    const sizeClasses = {
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };
    return `animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100 ${sizeClasses[this.size()]}`;
  };

  readonly textClass = () => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };
    return `text-gray-600 dark:text-gray-400 ${sizeClasses[this.size()]}`;
  };
}
