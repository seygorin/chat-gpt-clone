import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
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

  private _isMobile = signal(false);
  readonly isMobile = this._isMobile.asReadonly();

  ngOnInit(): void {
    this.chatService.loadFromLocalStorage();
    this.checkScreenSize();
    if (this.isMobile()) {
      this._isSidebarCollapsed.set(true);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const wasMobile = this.isMobile();
    this.checkScreenSize();
    const isNowMobile = this.isMobile();

    // Если перешли с десктопа на мобильный - скрыть сайдбар
    if (!wasMobile && isNowMobile) {
      this._isSidebarCollapsed.set(true);
    }
    else if (wasMobile && !isNowMobile) {
      this._isSidebarCollapsed.set(false);
    }
  }

  private checkScreenSize(): void {
    this._isMobile.set(window.innerWidth < 768);
  }

  createNewChat(): void {
    this.chatService.createChat();
  }

  toggleSidebar(): void {
    this._isSidebarCollapsed.update(collapsed => !collapsed);
  }
}
