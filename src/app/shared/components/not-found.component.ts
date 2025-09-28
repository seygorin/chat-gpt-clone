import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle fa-5x"></i>
        </div>

        <h1 class="error-title">404</h1>
        <h2 class="error-subtitle">Page Not Found</h2>
        <p class="error-description">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>

        <div class="error-actions">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="goHome()"
            [attr.aria-label]="'Go back to home page'"
          >
            <i class="fas fa-home me-2"></i>
            Go Home
          </button>

          <button
            type="button"
            class="btn btn-secondary"
            (click)="goBack()"
            [attr.aria-label]="'Go back to previous page'"
          >
            <i class="fas fa-arrow-left me-2"></i>
            Go Back
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: var(--bg-primary);
        color: var(--text-primary);
      }

      .not-found-content {
        text-align: center;
        max-width: 500px;
        width: 100%;
      }

      .error-icon {
        color: var(--text-secondary);
        margin-bottom: 2rem;
        opacity: 0.6;
      }

      .error-title {
        font-size: 6rem;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .error-subtitle {
        font-size: 2rem;
        font-weight: 600;
        margin: 1rem 0;
        color: var(--text-primary);
      }

      .error-description {
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

      .help-links {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
        flex-wrap: wrap;
      }

      .help-link {
        color: var(--text-secondary);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
      }

      .help-link:hover {
        color: var(--accent-primary);
      }

      .separator {
        color: var(--text-tertiary);
        font-weight: 300;
      }

      @media (max-width: 640px) {
        .error-title {
          font-size: 4rem;
        }

        .error-subtitle {
          font-size: 1.5rem;
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
export class NotFoundComponent {
  private router = inject(Router);

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
