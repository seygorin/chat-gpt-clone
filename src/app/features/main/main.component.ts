import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar';
import { ChatContainerComponent } from '../chat';
import { FooterComponent } from '../../shared/components';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, ChatContainerComponent, FooterComponent],
  template: `
    <div class="h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div class="flex h-full w-full">
        <app-sidebar
          [class.sidebar-collapsed]="isSidebarCollapsed()"
          [class.sidebar-expanded]="!isSidebarCollapsed()"
          [isCollapsed]="isSidebarCollapsed"
          class="sidebar-collapsible"
          (closeSidebar)="toggleSidebar()"
          (toggleSidebar)="toggleSidebar()"
        ></app-sidebar>

        <div class="flex-1 relative">
          <app-chat-container
            [isSidebarCollapsed]="isSidebarCollapsed()"
            [isMobile]="isMobile()"
            (toggleSidebar)="toggleSidebar()"
          ></app-chat-container>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  private chatService = inject(ChatService);

  private _isSidebarCollapsed = signal(false);
  readonly isSidebarCollapsed = this._isSidebarCollapsed.asReadonly();

  private _isMobile = signal(false);
  readonly isMobile = this._isMobile.asReadonly();

  ngOnInit(): void {
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
