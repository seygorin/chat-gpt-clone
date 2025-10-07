import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, of, catchError } from 'rxjs';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Chat } from '../models/chat.model';

export const chatListResolver: ResolveFn<Chat[]> = (): Observable<Chat[]> => {
  const firebaseService = inject(FirebaseService);

  return new Observable<Chat[]>(observer => {
    firebaseService
      .getUserChats()
      .then(chats => {
        observer.next(chats);
        observer.complete();
      })
      .catch(error => {
        console.warn('Failed to prefetch chats:', error);
        observer.next([]);
        observer.complete();
      });
  });
};

export const chatResolver: ResolveFn<Chat | null> = (route): Observable<Chat | null> => {
  const firebaseService = inject(FirebaseService);
  const chatId = route.paramMap.get('id');

  if (!chatId) {
    return of(null);
  }

  return new Observable<Chat | null>(observer => {
    firebaseService
      .getChat(chatId)
      .then(chat => {
        observer.next(chat);
        observer.complete();
      })
      .catch(error => {
        console.warn(`Failed to prefetch chat ${chatId}:`, error);
        observer.next(null);
        observer.complete();
      });
  });
};

export const userDataResolver: ResolveFn<boolean> = (): Observable<boolean> => {
  const firebaseService = inject(FirebaseService);

  return new Observable<boolean>(observer => {
    const subscription = firebaseService.isAuthLoading().valueOf();

    if (!subscription) {
      observer.next(true);
      observer.complete();
    } else {
      const checkAuth = () => {
        if (!firebaseService.isAuthLoading().valueOf()) {
          observer.next(true);
          observer.complete();
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    }
  }).pipe(
    catchError(error => {
      console.warn('Failed to resolve user data:', error);
      return of(false);
    })
  );
};
