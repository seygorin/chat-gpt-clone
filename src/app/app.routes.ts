import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { AuthProtectedComponent } from './core/guards/auth-protected.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/registration.component').then(
        m => m.RegistrationComponent
      ),
    canActivate: [GuestGuard],
  },

  { path: '', component: AuthProtectedComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
