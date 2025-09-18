import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { takeUntil, catchError, retry } from 'rxjs/operators';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../models';
import { GeminiRequest } from '../models/api.model';
import { environment } from '../../../environments/environment';

export interface GeminiServiceConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private activeRequest$ = new Subject<void>();
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({
      apiKey: environment.geminiApiKey,
    });
  }

  generateStreamResponse(messages: Message[], config: GeminiServiceConfig): Observable<string> {
    this.activeRequest$.next();

    if (!this.validateConfig(config)) {
      return throwError(() => new Error('Invalid Gemini configuration'));
    }

    return this.createRealStreamResponse(messages, config);
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

  private createRealStreamResponse(
    messages: Message[],
    config: GeminiServiceConfig
  ): Observable<string> {
    return new Observable<string>(observer => {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'user') {
        observer.error(new Error('No user message found'));
        return;
      }

      const request: GeminiRequest = {
        model: config.model,
        contents: lastMessage.content,
        config: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
          topP: config.topP,
          topK: config.topK,
          thinkingBudget: 0,
        },
      };

      this.genAI.models
        .generateContent(request)
        .then(response => {
          const text = response.text;
          if (text) {
            let index = 0;

            const streamInterval = setInterval(() => {
              if (index < text.length) {
                observer.next(text[index]);
                index++;
              } else {
                observer.complete();
                clearInterval(streamInterval);
              }
            }, 30);

            this.activeRequest$.subscribe(() => {
              clearInterval(streamInterval);
            });
          } else {
            observer.error(new Error('No response text received from Gemini'));
          }
        })
        .catch(error => {
          observer.error(this.handleGeminiError(error));
        });
    }).pipe(
      takeUntil(this.activeRequest$),
      retry(2),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  private handleGeminiError(error: unknown): Error {
    const isErrorWithStatus = (err: unknown): err is { status: number; message?: string } => {
      return typeof err === 'object' && err !== null && 'status' in err;
    };

    if (isErrorWithStatus(error)) {
      if (error.status === 400) {
        return new Error('Invalid request to Gemini API. Please check your input.');
      } else if (error.status === 401) {
        return new Error('Invalid API key. Please check your Gemini API key.');
      } else if (error.status === 429) {
        return new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status >= 500) {
        return new Error('Gemini API server error. Please try again later.');
      }
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Error(`Gemini API error: ${message}`);
  }

  validateConfig(config: GeminiServiceConfig): boolean {
    return !!(
      config.model &&
      config.temperature >= 0 &&
      config.temperature <= 1 &&
      config.maxTokens > 0 &&
      config.maxTokens <= 8192 &&
      config.topP >= 0 &&
      config.topP <= 1 &&
      config.topK >= 1 &&
      config.topK <= 100
    );
  }
}
