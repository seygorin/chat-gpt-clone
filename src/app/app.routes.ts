import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthProtectedComponent } from './core/guards/auth-protected.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	
	{ path: '**', component: AuthProtectedComponent, canActivate: [AuthGuard] },
];
