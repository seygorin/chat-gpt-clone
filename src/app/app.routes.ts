import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { chatListResolver, userDataResolver } from './core/resolvers/chat.resolver';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard],
    data: { preload: true, priority: 'high' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/registration.component').then(
        m => m.RegistrationComponent
      ),
    canActivate: [GuestGuard],
    data: { preload: true, priority: 'normal', preloadDelay: 1000 },
  },
  {
    path: '',
    loadComponent: () => import('./features/main/main.component').then(m => m.MainComponent),
    canActivate: [AuthGuard],
    resolve: {
      chats: chatListResolver,
      userData: userDataResolver,
    },
    data: { preload: true, priority: 'high' },
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./shared/components/error-page.component').then(m => m.ErrorPageComponent),
    title: 'Error - ChatGPT Clone',
    data: { preload: true, priority: 'low', preloadDelay: 2000 },
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/components/not-found.component').then(m => m.NotFoundComponent),
    title: '404 - Page Not Found',
    data: { preload: true, priority: 'low', preloadDelay: 2000 },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found.component').then(m => m.NotFoundComponent),
    title: '404 - Page Not Found',
  },
];
