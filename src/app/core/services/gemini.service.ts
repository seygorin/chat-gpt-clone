import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Message } from '../models';

export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private activeRequest$ = new Subject<void>();
  private http = inject(HttpClient);

  generateStreamResponse(messages: Message[], config: GeminiConfig): Observable<string> {
    this.activeRequest$.next();

    console.log('Generating response for', messages.length, 'messages with config:', config);

    return this.createMockStreamResponse();
  }

  cancelActiveRequest(): void {
    this.activeRequest$.next();
  }

  private formatMessagesForAPI(messages: Message[]): Record<string, unknown>[] {
    return messages.map(message => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));
  }

  private createMockStreamResponse(): Observable<string> {
    const mockResponse =
      'This is a mock response from Gemini API. In a real implementation, this would be a streaming response from the actual API.';

    return new Observable<string>(observer => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < mockResponse.length) {
          observer.next(mockResponse[index]);
          index++;
        } else {
          observer.complete();
          clearInterval(interval);
        }
      }, 50);

      return () => {
        clearInterval(interval);
      };
    }).pipe(
      takeUntil(this.activeRequest$),
      finalize(() => {
        console.log('Streaming response completed');
      })
    );
  }

  validateConfig(config: GeminiConfig): boolean {
    return !!(
      config.apiKey &&
      config.model &&
      config.temperature >= 0 &&
      config.temperature <= 1 &&
      config.maxTokens > 0
    );
  }
}
