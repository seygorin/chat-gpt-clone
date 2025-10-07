import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { inject } from '@angular/core';

export interface ErrorPageData {
  code: string;
  title: string;
  message: string;
  showRetry?: boolean;
}

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle fa-5x"></i>
        </div>

        <h1 class="error-code">{{ errorData().code }}</h1>
        <h2 class="error-title">{{ errorData().title }}</h2>
        <p class="error-message">{{ errorData().message }}</p>

        <div class="error-actions">
          @if (errorData().showRetry) {
            <button
              type="button"
              class="btn btn-primary"
              (click)="retry()"
              [attr.aria-label]="'Retry the action'"
            >
              <i class="fas fa-redo me-2"></i>
              Try Again
            </button>
          }

          <button
            type="button"
            class="btn btn-secondary"
            (click)="goHome()"
            [attr.aria-label]="'Go back to home page'"
          >
            <i class="fas fa-home me-2"></i>
            Go Home
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .error-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: var(--bg-primary);
        color: var(--text-primary);
      }

      .error-content {
        text-align: center;
        max-width: 500px;
        width: 100%;
      }

      .error-icon {
        color: var(--error-color, #ef4444);
        margin-bottom: 2rem;
        opacity: 0.8;
      }

      .error-code {
        font-size: 4rem;
        font-weight: 700;
        margin: 0;
        color: var(--error-color, #ef4444);
      }

      .error-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 1rem 0;
        color: var(--text-primary);
      }

      .error-message {
        font-size: 1.125rem;
        color: var(--text-secondary);
        margin: 2rem 0;
        line-height: 1.6;
      }

      .error-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin: 3rem 0;
        flex-wrap: wrap;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 500;
        text-decoration: none;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 1rem;
      }

      .btn-primary {
        background: var(--accent-primary);
        color: white;
      }

      .btn-primary:hover {
        background: var(--accent-primary-hover);
        transform: translateY(-1px);
      }

      .btn-secondary {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }

      .btn-secondary:hover {
        background: var(--bg-tertiary);
        transform: translateY(-1px);
      }

      @media (max-width: 640px) {
        .error-code {
          font-size: 3rem;
        }

        .error-actions {
          flex-direction: column;
          align-items: center;
        }

        .btn {
          width: 100%;
          max-width: 200px;
        }
      }
    `,
  ],
})
export class ErrorPageComponent {
  private router = inject(Router);

  errorData = input<ErrorPageData>({
    code: 'ERROR',
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again later.',
    showRetry: true,
  });

  goHome(): void {
    this.router.navigate(['/']);
  }

  retry(): void {
    window.location.reload();
  }
}
