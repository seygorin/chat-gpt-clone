import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VirtualScrollItem {
  id: string | number;
  data: unknown;
  height?: number;
}

export interface VirtualScrollConfig {
  itemHeight: number;
  bufferSize: number;
  tolerance: number;
}

@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #scrollContainer
      class="virtual-scroll-container"
      [style.height]="containerHeight"
      (scroll)="onScroll($event)"
    >
      <div class="virtual-scroll-spacer" [style.height.px]="totalHeight()"></div>

      <div class="virtual-scroll-content" [style.transform]="'translateY(' + offsetY() + 'px)'">
        @for (item of visibleItems(); track item.id) {
          <div
            class="virtual-scroll-item"
            [style.height.px]="itemHeight"
            [attr.data-index]="getItemIndex(item)"
            (click)="onItemClick(item)"
            (keydown.enter)="onItemClick(item)"
            (keydown.space)="onItemClick(item)"
            tabindex="0"
            role="button"
          >
            <ng-content></ng-content>

            @if (!hasProjectedContent) {
              <div class="default-item">
                <span>{{ getItemDisplayText(item) }}</span>
              </div>
            }
          </div>
        }
      </div>

      @if (isLoading()) {
        <div class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading more items...</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .virtual-scroll-container {
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .virtual-scroll-spacer {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        pointer-events: none;
      }

      .virtual-scroll-content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        will-change: transform;
      }

      .virtual-scroll-item {
        position: relative;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
      }

      .default-item {
        padding: 1rem;
        display: flex;
        align-items: center;
      }

      .loading-indicator {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: var(--bg-primary, white);
        border-top: 1px solid var(--border-color, #e5e7eb);
      }

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid var(--border-color, #e5e7eb);
        border-top: 2px solid var(--accent-primary, #3b82f6);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Стили скролла для webkit браузеров */
      .virtual-scroll-container::-webkit-scrollbar {
        width: 6px;
      }

      .virtual-scroll-container::-webkit-scrollbar-track {
        background: var(--bg-secondary, #f3f4f6);
      }

      .virtual-scroll-container::-webkit-scrollbar-thumb {
        background: var(--text-tertiary, #9ca3af);
        border-radius: 3px;
      }

      .virtual-scroll-container::-webkit-scrollbar-thumb:hover {
        background: var(--text-secondary, #6b7280);
      }
    `,
  ],
})
export class VirtualScrollComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer', { static: true })
  scrollContainer!: ElementRef<HTMLDivElement>;

  @Input() items: VirtualScrollItem[] = [];
  @Input() itemHeight = 50;
  @Input() bufferSize = 5;
  @Input() containerHeight = '400px';
  @Input() tolerance = 2;
  @Input() hasProjectedContent = true;

  @Output() itemClick = new EventEmitter<VirtualScrollItem>();
  @Output() scrollEnd = new EventEmitter<void>();
  @Output() visibleRangeChange = new EventEmitter<{ start: number; end: number }>();

  private elementRef = inject(ElementRef);

  private _scrollTop = signal(0);
  private _containerHeight = signal(0);
  private _isLoading = signal(false);

  readonly isLoading = this._isLoading.asReadonly();

  readonly totalHeight = computed(() => this.items.length * this.itemHeight);

  readonly visibleRange = computed(() => {
    const scrollTop = this._scrollTop();
    const containerHeight = this._containerHeight();

    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
    const endIndex = Math.min(
      this.items.length - 1,
      Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.bufferSize
    );

    return { start: startIndex, end: endIndex };
  });

  readonly visibleItems = computed(() => {
    const range = this.visibleRange();
    return this.items.slice(range.start, range.end + 1);
  });

  readonly offsetY = computed(() => {
    return this.visibleRange().start * this.itemHeight;
  });

  private resizeObserver?: ResizeObserver;
  private scrollTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const range = this.visibleRange();
      this.visibleRangeChange.emit(range);
    });
  }

  ngOnInit(): void {
    this.initializeContainer();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    this._scrollTop.set(target.scrollTop);

    const isNearEnd =
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - this.itemHeight * this.tolerance;

    if (isNearEnd && !this.isLoading()) {
      this.scrollEnd.emit();
    }

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      console.debug('Scroll ended');
    }, 150);
  }

  onItemClick(item: VirtualScrollItem): void {
    this.itemClick.emit(item);
  }

  getItemIndex(item: VirtualScrollItem): number {
    return this.items.findIndex(i => i.id === item.id);
  }

  getItemDisplayText(item: VirtualScrollItem): string {
    const data = item.data as { title?: string; name?: string } | null;
    return data?.title || data?.name || `Item ${item.id}`;
  }

  scrollToIndex(index: number): void {
    if (index < 0 || index >= this.items.length) {
      return;
    }

    const scrollTop = index * this.itemHeight;
    this.scrollContainer.nativeElement.scrollTop = scrollTop;
  }

  scrollToItem(itemId: string | number): void {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index >= 0) {
      this.scrollToIndex(index);
    }
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  updateItems(newItems: VirtualScrollItem[]): void {
    this.items = newItems;
  }

  appendItems(items: VirtualScrollItem[]): void {
    this.items = [...this.items, ...items];
  }

  prependItems(items: VirtualScrollItem[]): void {
    this.items = [...items, ...this.items];
    const addedHeight = items.length * this.itemHeight;
    this.scrollContainer.nativeElement.scrollTop += addedHeight;
  }

  private initializeContainer(): void {
    const container = this.scrollContainer.nativeElement;
    this._containerHeight.set(container.clientHeight);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this._containerHeight.set(entry.contentRect.height);
      }
    });

    this.resizeObserver.observe(this.scrollContainer.nativeElement);
  }
}
