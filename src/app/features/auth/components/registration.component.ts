import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { FooterComponent } from '../../../shared/components';
import {
  strongPasswordValidator,
  confirmPasswordValidator,
  strictEmailValidator,
  uniqueEmailValidator,
  usernameValidator,
  getValidationErrorMessage,
} from '../../../core/validators/custom-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent {
  private firebase = inject(FirebaseService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  private _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private _showPassword = signal<boolean>(false);
  readonly showPassword = this._showPassword.asReadonly();

  private _showConfirmPassword = signal<boolean>(false);
  readonly showConfirmPassword = this._showConfirmPassword.asReadonly();

  registrationForm: FormGroup;

  constructor() {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required, usernameValidator()]],
      email: ['', [Validators.required, strictEmailValidator()], [uniqueEmailValidator()]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required, confirmPasswordValidator('password')]],
      agreeToTerms: [false, [Validators.requiredTrue]],
    });

    this.registrationForm.get('password')?.valueChanges.subscribe(() => {
      this.registrationForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  async onSubmit(): Promise<void> {
    if (this.registrationForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this._isLoading.set(true);

    try {
      const { email, password } = this.registrationForm.value;
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
    } finally {
      this._isLoading.set(false);
    }
  }

  togglePasswordVisibility(): void {
    this._showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this._showConfirmPassword.set(!this.showConfirmPassword());
  }

  getFieldError(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const firstErrorKey = Object.keys(field.errors)[0];
    const errorValue = field.errors[firstErrorKey];

    return getValidationErrorMessage(firstErrorKey, errorValue);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.valid && field.touched);
  }

  isFieldPending(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.pending);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  get usernameControl() {
    return this.registrationForm.get('username');
  }
  get emailControl() {
    return this.registrationForm.get('email');
  }
  get passwordControl() {
    return this.registrationForm.get('password');
  }
  get confirmPasswordControl() {
    return this.registrationForm.get('confirmPassword');
  }
  get agreeToTermsControl() {
    return this.registrationForm.get('agreeToTerms');
  }
}
