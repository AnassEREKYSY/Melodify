import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-empty',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col items-center rounded-card border border-dashed border-line/[0.12] px-6 py-12 text-center">
      <span class="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-raised text-ink-muted"><app-icon [name]="icon()" /></span>
      <p class="font-medium">{{ title() }}</p>
      @if (text()) { <p class="mt-1 max-w-sm text-sm text-ink-muted">{{ text() }}</p> }
      <div class="mt-4 empty:hidden"><ng-content /></div>
    </div>
  `,
})
export class EmptyStateComponent { icon = input('music'); title = input.required<string>(); text = input<string | null>(null); }
