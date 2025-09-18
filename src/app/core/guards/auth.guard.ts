import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseService } from '../../shared/services/firebase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private firebase = inject(FirebaseService);
  private router = inject(Router);

  canActivate(): boolean {
    const user = this.firebase.user();
    if (user) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
