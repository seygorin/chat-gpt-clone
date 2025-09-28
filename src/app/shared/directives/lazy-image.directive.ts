import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Renderer2,
  inject,
  signal,
  effect,
} from '@angular/core';

@Directive({
  selector: '[appLazyImage]',
  standalone: true,
})
export class LazyImageDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef<HTMLImageElement>);
  private renderer = inject(Renderer2);

  private observer?: IntersectionObserver;
  private _isLoaded = signal(false);
  private _isError = signal(false);
  private _isIntersecting = signal(false);

  @Input() src!: string;
  @Input() placeholder?: string;
  @Input() fallback?: string;
  @Input() threshold = 0.1;
  @Input() rootMargin = '50px';

  constructor() {
    effect(() => {
      if (this._isIntersecting() && !this._isLoaded() && !this._isError()) {
        this.loadImage();
      }
    });
  }

  ngOnInit(): void {
    const img = this.elementRef.nativeElement;

    if (this.placeholder) {
      this.renderer.setAttribute(img, 'src', this.placeholder);
    } else {
      this.createPlaceholder();
    }

    this.renderer.addClass(img, 'lazy-image');
    this.renderer.addClass(img, 'lazy-image-loading');

    this.createObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver(): void {
    if (!('IntersectionObserver' in window)) {
      this._isIntersecting.set(true);
      return;
    }

    const options: IntersectionObserverInit = {
      threshold: this.threshold,
      rootMargin: this.rootMargin,
    };

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this._isIntersecting.set(true);
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }

  private createPlaceholder(): void {
    const img = this.elementRef.nativeElement;
    const width = img.getAttribute('width') || '300';
    const height = img.getAttribute('height') || '200';

    const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <g>
          <rect x="50%" y="50%" width="40" height="40" rx="4" fill="#d1d5db" transform="translate(-20, -20)"/>
          <circle cx="50%" cy="45%" r="8" fill="#9ca3af" transform="translate(0, -5)"/>
          <polygon points="50%,55% 40%,75% 60%,75%" fill="#9ca3af" transform="translate(0, -10)"/>
        </g>
      </svg>
    `)}`;

    this.renderer.setAttribute(img, 'src', placeholderSvg);
  }

  private async loadImage(): Promise<void> {
    const img = this.elementRef.nativeElement;

    try {
      const tempImage = new Image();

      const loadPromise = new Promise<void>((resolve, reject) => {
        tempImage.onload = () => resolve();
        tempImage.onerror = () => reject(new Error('Failed to load image'));
        tempImage.src = this.src;
      });

      await loadPromise;

      this.renderer.setAttribute(img, 'src', this.src);
      this.renderer.removeClass(img, 'lazy-image-loading');
      this.renderer.addClass(img, 'lazy-image-loaded');

      this._isLoaded.set(true);

      this.addFadeInEffect();
    } catch (error) {
      console.warn('Failed to load image:', this.src, error);
      this.handleImageError();
    }
  }

  private handleImageError(): void {
    const img = this.elementRef.nativeElement;

    if (this.fallback) {
      this.renderer.setAttribute(img, 'src', this.fallback);
    } else {
      const fallbackSvg = `data:image/svg+xml;base64,${btoa(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#fef2f2"/>
          <g>
            <circle cx="50%" cy="50%" r="30" fill="#fca5a5" transform="translate(0, -10)"/>
            <text x="50%" y="50%" text-anchor="middle" fill="#dc2626" font-size="24" transform="translate(0, 5)">!</text>
            <text x="50%" y="75%" text-anchor="middle" fill="#7f1d1d" font-size="12">Image not found</text>
          </g>
        </svg>
      `)}`;

      this.renderer.setAttribute(img, 'src', fallbackSvg);
    }

    this.renderer.removeClass(img, 'lazy-image-loading');
    this.renderer.addClass(img, 'lazy-image-error');
    this._isError.set(true);
  }

  private addFadeInEffect(): void {
    const img = this.elementRef.nativeElement;

    this.renderer.setStyle(img, 'opacity', '0');
    this.renderer.setStyle(img, 'transition', 'opacity 0.3s ease-in-out');

    requestAnimationFrame(() => {
      this.renderer.setStyle(img, 'opacity', '1');
    });
  }
}
