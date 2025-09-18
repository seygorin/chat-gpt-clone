import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from '../../../shared/services/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 lg:p-10">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Log in or sign up</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">You’ll get smarter responses and can upload files, images, and more.</p>

        <form (submit)="onSignIn($event)" class="mt-6">
          <label for="emailInput" class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Email address</label>
          <input id="emailInput" type="email" name="email" required autocomplete="email" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />

          <label for="passwordInput" class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 mt-4">Password</label>
          <div class="relative">
            <input id="passwordInput" type="password" name="password" required autocomplete="current-password" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your password" />
            <i class="fas fa-lock absolute right-3 top-3 text-gray-400" aria-hidden="true"></i>
          </div>

          <button type="submit" class="mt-4 w-full bg-black dark:bg-white text-white dark:text-black font-medium py-3 rounded-lg">Continue</button>
        </form>

        <div class="flex items-center my-6">
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <div class="px-3 text-sm text-gray-500 dark:text-gray-400">OR</div>
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        <button (click)="onGoogle()" class="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 bg-white dark:bg-gray-800 hover:shadow-sm">
          <i class="fab fa-google text-lg text-red-500" aria-hidden="true"></i>
          <span class="text-sm text-gray-700 dark:text-gray-200">Continue with Google</span>
        </button>
      </div>
    </div>
  `,
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
      const msg = isErrorWithMessage(unknownErr) ? unknownErr.message ?? String(unknownErr) : String(unknownErr);
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
      const msg = isErrorWithMessage(unknownErr) ? unknownErr.message ?? String(unknownErr) : String(unknownErr);
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
      const msg = isErrorWithMessage(unknownErr) ? unknownErr.message ?? String(unknownErr) : String(unknownErr);
      alert('Google sign in failed: ' + msg);
    }
  }
}
