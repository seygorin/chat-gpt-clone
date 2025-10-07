import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, filter, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { FirebaseService } from '../../shared/services/firebase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private firebase = inject(FirebaseService);
  private router = inject(Router);
  
  private isAuthLoading$ = toObservable(this.firebase.isAuthLoading);

  canActivate(): Observable<boolean> {
    return this.isAuthLoading$.pipe(
      filter(isLoading => !isLoading), 
      take(1),
      map(() => {
        const user = this.firebase.user();
        if (user) {
          return true;
        }
        
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
