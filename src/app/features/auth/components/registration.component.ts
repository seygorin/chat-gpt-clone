import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from '../../../shared/services/firebase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
  private firebase = inject(FirebaseService);
  private router = inject(Router);

  async onSignUp(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

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
}
