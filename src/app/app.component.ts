import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ChatService } from './core/services/chat.service';
import { SettingsService } from './core/services/settings.service';
import { SidebarComponent } from './features/sidebar';
import { ChatContainerComponent } from './features/chat';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatContainerComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private chatService = inject(ChatService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);

  private _isSidebarCollapsed = signal(false);
  readonly isSidebarCollapsed = this._isSidebarCollapsed.asReadonly();

  private _isMobile = signal(false);
  readonly isMobile = this._isMobile.asReadonly();

  private _isLoginRoute = signal(false);
  readonly isLoginRoute = this._isLoginRoute.asReadonly();

  ngOnInit(): void {
    this.chatService.loadFromLocalStorage();
    this.checkScreenSize();
    if (this.isMobile()) {
      this._isSidebarCollapsed.set(true);
    }

    const isAuthPath = (url: string) => url.startsWith('/login') || url.startsWith('/register');
    this._isLoginRoute.set(isAuthPath(this.router.url));
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        this._isLoginRoute.set(isAuthPath(ev.url));
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    const wasMobile = this.isMobile();
    this.checkScreenSize();
    const isNowMobile = this.isMobile();

    if (!wasMobile && isNowMobile) {
      this._isSidebarCollapsed.set(true);
    } else if (wasMobile && !isNowMobile) {
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
