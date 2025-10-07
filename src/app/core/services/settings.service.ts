import { Injectable, signal, computed, effect } from '@angular/core';
import { GeminiServiceConfig } from './gemini.service';

export interface AppSettings {
  theme: 'light' | 'dark';
  gemini: GeminiServiceConfig;
  autoSave: boolean;
  showTimestamps: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  gemini: {
    apiKey: '',
    model: 'gemini-2.0-flash-lite',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.8,
    topK: 40,
  },
  autoSave: true,
  showTimestamps: true,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _settings = signal<AppSettings>(DEFAULT_SETTINGS);

  readonly settings = this._settings.asReadonly();

  readonly theme = computed(() => this._settings().theme);
  readonly geminiConfig = computed(() => this._settings().gemini);
  readonly isDarkMode = computed(() => this._settings().theme === 'dark');
  readonly isAutoSaveEnabled = computed(() => this._settings().autoSave);

  constructor() {
    this.loadSettings();

    this.initializeAutoSave();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this._settings.update(settings => ({
      ...settings,
      theme,
    }));

    this.applyTheme(theme);
  }

  updateGeminiConfig(config: Partial<GeminiServiceConfig>): void {
    this._settings.update(settings => ({
      ...settings,
      gemini: {
        ...settings.gemini,
        ...config,
      },
    }));
  }

  toggleAutoSave(): void {
    this._settings.update(settings => ({
      ...settings,
      autoSave: !settings.autoSave,
    }));
  }

  toggleTimestamps(): void {
    this._settings.update(settings => ({
      ...settings,
      showTimestamps: !settings.showTimestamps,
    }));
  }

  resetSettings(): void {
    this._settings.set(DEFAULT_SETTINGS);
    this.applyTheme(DEFAULT_SETTINGS.theme);
  }

  getCurrentSettings(): AppSettings {
    return this._settings();
  }

  private initializeAutoSave(): void {
    effect(() => {
      const settings = this._settings();
      this.saveToLocalStorage(settings);
    });
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('chat-gpt-clone-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this._settings.set({ ...DEFAULT_SETTINGS, ...settings });
        this.applyTheme(settings.theme || DEFAULT_SETTINGS.theme);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }

  private saveToLocalStorage(settings: AppSettings): void {
    try {
      localStorage.setItem('chat-gpt-clone-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
