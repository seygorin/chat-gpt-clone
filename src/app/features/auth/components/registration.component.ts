import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { FooterComponent } from '../../../shared/components';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent {
  private firebase = inject(FirebaseService);
  private router = inject(Router);

  private _emailError = signal<string>('');
  readonly emailError = this._emailError.asReadonly();

  async onSignUp(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (!this.isValidEmail(email)) {
      this._emailError.set('Please enter a valid email address');
      return;
    }

    this._emailError.set('');

    try {
      await this.firebase.signUpWithEmail(email, password);
      this.router.navigate(['/']);
    } catch (err) {
      console.error('Sign up failed', err);
      const unknownErr = err as unknown;
      const isErrorWithMessage = (v: unknown): v is { message?: string } =>
        typeof v === 'object' && v !== null && 'message' in v;
      const msg = isErrorWithMessage(unknownErr)
        ? (unknownErr.message ?? String(unknownErr))
        : String(unknownErr);
      alert('Sign up failed: ' + msg);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const email = input.value;

    if (email && !this.isValidEmail(email)) {
      this._emailError.set('Please enter a valid email address');
    } else {
      this._emailError.set('');
    }
  }
}
