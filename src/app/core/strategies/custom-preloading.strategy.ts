import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  private preloadedRoutes = new Set<string>();

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.path && this.preloadedRoutes.has(route.path)) {
      return of(null);
    }

    const shouldPreload = route.data?.['preload'] === true;
    const preloadDelay = route.data?.['preloadDelay'] || 0;
    const priority = route.data?.['priority'] || 'normal';

    if (!shouldPreload) {
      return of(null);
    }

    if (this.isSlowConnection()) {
      if (priority !== 'high') {
        return of(null);
      }
    }

    if (this.isDataSaver()) {
      return of(null);
    }

    console.log(`Preloading route: ${route.path} (priority: ${priority})`);

    if (route.path) {
      this.preloadedRoutes.add(route.path);
    }

    return timer(preloadDelay).pipe(mergeMap(() => load()));
  }

  private isSlowConnection(): boolean {
    const connection = (
      navigator as unknown as { connection?: { effectiveType: string; downlink: number } }
    ).connection;

    if (connection) {
      const slowConnectionTypes = ['slow-2g', '2g'];
      return slowConnectionTypes.includes(connection.effectiveType) || connection.downlink < 1.5;
    }

    return false;
  }

  private isDataSaver(): boolean {
    const connection = (navigator as unknown as { connection?: { saveData: boolean } }).connection;
    return connection?.saveData === true;
  }

  clearPreloadedCache(): void {
    this.preloadedRoutes.clear();
  }

  getPreloadedRoutes(): Set<string> {
    return new Set(this.preloadedRoutes);
  }
}
