import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoverComponent } from './cover.component';
import { IconComponent } from './icon.component';

/** Album, artist or playlist tile with a play button on hover. */
@Component({
  selector: 'app-media-card',
  imports: [RouterLink, CoverComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="group relative rounded-card p-2.5 transition-colors hover:bg-surface">
      <a [routerLink]="link()" class="block focus-visible:outline-none" [attr.aria-label]="title()">
        <app-cover [src]="image()" [round]="round()" [icon]="round() ? 'user' : 'disc'" />
        <p class="mt-2.5 line-clamp-1 text-sm font-medium" [class.text-center]="round()">{{ title() }}</p>
        @if (subtitle()) { <p class="mt-0.5 line-clamp-1 text-[13px] text-ink-faint" [class.text-center]="round()">{{ subtitle() }}</p> }
      </a>
      @if (playable()) {
        <button type="button" class="play-btn absolute right-4 top-[calc(100%-6.5rem)] h-10 w-10 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
                [attr.aria-label]="'Play ' + title()" (click)="play.emit()">
          <app-icon name="play" [size]="16" [fill]="true" />
        </button>
      }
    </div>
  `,
})
export class MediaCardComponent {
  link = input.required<unknown[]>();
  title = input.required<string>();
  subtitle = input<string | null>(null);
  image = input<string | null>(null);
  round = input(false);
  playable = input(true);
  play = output<void>();
}
