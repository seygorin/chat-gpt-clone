import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="fixed bottom-2 right-2 z-20">
      <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <a
          href="https://rs.school/courses/angular"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center hover:opacity-80 transition-opacity"
          aria-label="RS School Angular Course"
        >
          <img
            src="https://rs.school/_next/static/media/rss-logo.c19ce1b4.svg"
            alt="RS School Logo"
            class="w-4 h-4"
          />
        </a>

        <span>by</span>
        <a
          href="https://github.com/seygorin"
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          seygorin
        </a>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
