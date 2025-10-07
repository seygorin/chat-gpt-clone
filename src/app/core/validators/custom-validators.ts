import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const errors: ValidationErrors = {};

    if (password.length < 8) {
      errors['minLength'] = { actualLength: password.length, requiredLength: 8 };
    }

    if (password.length > 128) {
      errors['maxLength'] = { actualLength: password.length, maxLength: 128 };
    }

    if (!/[A-Z]/.test(password)) {
      errors['missingUppercase'] = true;
    }

    if (!/[a-z]/.test(password)) {
      errors['missingLowercase'] = true;
    }

    if (!/\d/.test(password)) {
      errors['missingNumber'] = true;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors['missingSpecialChar'] = true;
    }

    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors['commonPassword'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

export function confirmPasswordValidator(passwordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null;
    }

    const passwordControl = control.parent.get(passwordControlName);
    if (!passwordControl) {
      return null;
    }

    if (control.value !== passwordControl.value) {
      return { confirmPassword: true };
    }

    return null;
  };
}

export function strictEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(control.value)) {
      return { strictEmail: true };
    }

    const disposableEmailDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email',
    ];

    const domain = control.value.split('@')[1]?.toLowerCase();
    if (disposableEmailDomains.includes(domain)) {
      return { disposableEmail: true };
    }

    return null;
  };
}

export function uniqueEmailValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return timer(500).pipe(
      switchMap(() => {
        const existingEmails = ['admin@example.com', 'test@test.com', 'user@gmail.com'];

        if (existingEmails.includes(control.value.toLowerCase())) {
          return of({ uniqueEmail: true });
        }

        return of(null);
      }),
      catchError(() => of(null))
    );
  };
}

export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < minAge) {
        return { minAge: { actualAge, requiredAge: minAge } };
      }
    } else if (age < minAge) {
      return { minAge: { actualAge: age, requiredAge: minAge } };
    }

    return null;
  };
}

export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  };
}

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const username = control.value;
    const errors: ValidationErrors = {};

    if (username.length < 3) {
      errors['minLength'] = { actualLength: username.length, requiredLength: 3 };
    }

    if (username.length > 20) {
      errors['maxLength'] = { actualLength: username.length, maxLength: 20 };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors['invalidFormat'] = true;
    }

    if (/^[-_]|[-_]$/.test(username)) {
      errors['invalidStart'] = true;
    }

    const reservedNames = [
      'admin',
      'administrator',
      'root',
      'system',
      'api',
      'www',
      'mail',
      'email',
      'support',
      'help',
      'info',
      'contact',
    ];

    if (reservedNames.includes(username.toLowerCase())) {
      errors['reservedName'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const cleanPhone = control.value.replace(/[^\d+]/g, '');

    const internationalRegex = /^\+[1-9]\d{6,14}$/;

    const russianRegex = /^(\+7|8)\d{10}$/;

    if (!internationalRegex.test(cleanPhone) && !russianRegex.test(cleanPhone)) {
      return { invalidPhone: true };
    }

    return null;
  };
}

export function messageContentValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const content = control.value.trim();
    const errors: ValidationErrors = {};

    if (content.length < 1) {
      errors['required'] = true;
    }

    if (content.length > 4000) {
      errors['maxLength'] = { actualLength: content.length, maxLength: 4000 };
    }

    const spamPatterns = [
      /(.)\1{10,}/,
      /(http|https):\/\/[^\s]+/gi,
      /\b(buy now|click here|free money|win money)\b/gi,
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(content)) {
        errors['potentialSpam'] = true;
        break;
      }
    }

    const uppercaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (uppercaseRatio > 0.7 && content.length > 10) {
      errors['excessiveUppercase'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

export function getValidationErrorMessage(errorKey: string, errorValue?: unknown): string {
  const errorObj = errorValue as
    | { requiredLength?: number; requiredAge?: number; maxLength?: number; actualAge?: number }
    | undefined;

  const errorMessages: Record<string, string> = {
    required: 'This field is required',
    minLength: `Minimum length: ${errorObj?.requiredLength || errorObj?.requiredAge || 0} characters`,
    maxLength: `Maximum length: ${errorObj?.maxLength || 0} characters`,
    strictEmail: 'Please enter a valid email address',
    disposableEmail: 'Disposable email addresses are not allowed',
    uniqueEmail: 'This email is already registered',
    missingUppercase: 'Password must contain uppercase letters',
    missingLowercase: 'Password must contain lowercase letters',
    missingNumber: 'Password must contain numbers',
    missingSpecialChar: 'Password must contain special characters',
    commonPassword: 'This password is too common',
    confirmPassword: 'Passwords do not match',
    minAge: `Minimum age: ${errorObj?.requiredAge || 0} years`,
    invalidUrl: 'Please enter a valid URL',
    invalidFormat: 'Invalid format',
    invalidStart: 'Cannot start or end with dash/underscore',
    reservedName: 'This name is reserved',
    invalidPhone: 'Please enter a valid phone number',
    potentialSpam: 'Message appears to be spam',
    excessiveUppercase: 'Too many uppercase letters',
  };

  return errorMessages[errorKey] || 'Invalid value';
}
