import { Component, inject, input, output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { GeminiServiceConfig } from '../../../core/services/gemini.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.scss',
})
export class SettingsModalComponent implements OnInit, OnChanges {
  private settingsService = inject(SettingsService);

  readonly isOpen = input<boolean>(false);

  readonly closeModal = output<void>();

  settingsForm: Partial<GeminiServiceConfig> = {
    model: 'gemini-2.0-flash-lite',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.8,
    topK: 40,
  };

  ngOnInit(): void {
    if (this.isOpen()) {
      this.loadCurrentSettings();
    }
  }

  ngOnChanges(): void {
    if (this.isOpen()) {
      this.loadCurrentSettings();
    }
  }

  private loadCurrentSettings(): void {
    const currentSettings = this.settingsService.getCurrentSettings();
    this.settingsForm = {
      ...currentSettings.gemini,
      model: currentSettings.gemini.model || 'gemini-2.0-flash-lite', 
    };
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSave(): void {
    if (this.validateSettings()) {
      this.settingsService.updateGeminiConfig(this.settingsForm);
      this.onClose();
    }
  }

  private validateSettings(): boolean {
    if (
      this.settingsForm.temperature !== undefined &&
      (this.settingsForm.temperature < 0 || this.settingsForm.temperature > 1)
    ) {
      alert('Temperature must be between 0 and 1');
      return false;
    }

    if (
      this.settingsForm.maxTokens !== undefined &&
      (this.settingsForm.maxTokens < 1 || this.settingsForm.maxTokens > 8192)
    ) {
      alert('Max tokens must be between 1 and 8192');
      return false;
    }

    if (
      this.settingsForm.topP !== undefined &&
      (this.settingsForm.topP < 0 || this.settingsForm.topP > 1)
    ) {
      alert('Top P must be between 0 and 1');
      return false;
    }

    if (
      this.settingsForm.topK !== undefined &&
      (this.settingsForm.topK < 1 || this.settingsForm.topK > 100)
    ) {
      alert('Top K must be between 1 and 100');
      return false;
    }

    return true;
  }

  onReset(): void {
    this.settingsForm = {
      model: 'gemini-2.0-flash-lite',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.8,
      topK: 40,
    };
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
