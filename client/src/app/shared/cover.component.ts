import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-cover',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="cover ring-1 ring-inset ring-line/[0.06]" [class.!rounded-full]="round()" [class.!rounded-md]="small()">
      @if (src()) { <img [src]="src()" alt="" loading="lazy" decoding="async" class="h-full w-full object-cover" /> }
      @else { <div class="flex h-full w-full items-center justify-center text-ink-faint"><app-icon [name]="icon()" [size]="small() ? 16 : 28" /></div> }
    </div>
  `,
})
export class CoverComponent {
  src = input<string | null | undefined>(null);
  round = input(false);
  small = input(false);
  icon = input('music');
}
