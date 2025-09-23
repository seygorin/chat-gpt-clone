import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login.component';
import { RegistrationComponent } from './features/auth/components/registration.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthProtectedComponent } from './core/guards/auth-protected.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },

  { path: '**', component: AuthProtectedComponent, canActivate: [AuthGuard] },
];
