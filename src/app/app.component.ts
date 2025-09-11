import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from './core/services/chat.service';
import { SettingsService } from './core/services/settings.service';
import { SidebarComponent } from './features/sidebar';
import { ChatContainerComponent } from './features/chat';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private chatService = inject(ChatService);
  private settingsService = inject(SettingsService);

  private _isSidebarCollapsed = signal(false);
  readonly isSidebarCollapsed = this._isSidebarCollapsed.asReadonly();

  ngOnInit(): void {
    this.chatService.loadFromLocalStorage();
  }

  createNewChat(): void {
    this.chatService.createChat();
  }

  toggleSidebar(): void {
    this._isSidebarCollapsed.update(collapsed => !collapsed);
  }
}
