import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { FooterComponent } from '../../../shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private firebase = inject(FirebaseService);
  private router = inject(Router);

  async onSignIn(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      await this.firebase.signInWithEmail(email, password);
      this.router.navigate(['/']);
    } catch (err) {
      console.error('Sign in failed', err);
      const unknownErr = err as unknown;
      const isErrorWithMessage = (v: unknown): v is { message?: string } =>
        typeof v === 'object' && v !== null && 'message' in v;
      const msg = isErrorWithMessage(unknownErr)
        ? (unknownErr.message ?? String(unknownErr))
        : String(unknownErr);
      alert('Sign in failed: ' + msg);
    }
  }

  async onSignUp(e: Event) {
    e.preventDefault();
    const container = (e.target as HTMLElement).closest('div')?.parentElement as HTMLElement;
    const email = container?.querySelector('input[name="email"]') as HTMLInputElement;
    const password = container?.querySelector('input[name="password"]') as HTMLInputElement;
    if (!email || !password) {
      return;
    }

    try {
      await this.firebase.signUpWithEmail(email.value, password.value);
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

  async onGoogle() {
    try {
      await this.firebase.signInWithGoogle();
      this.router.navigate(['/']);
    } catch (err) {
      console.error('Google sign in failed', err);
      const unknownErr = err as unknown;
      const isErrorWithMessage = (v: unknown): v is { message?: string } =>
        typeof v === 'object' && v !== null && 'message' in v;
      const msg = isErrorWithMessage(unknownErr)
        ? (unknownErr.message ?? String(unknownErr))
        : String(unknownErr);
      alert('Google sign in failed: ' + msg);
    }
  }
}
