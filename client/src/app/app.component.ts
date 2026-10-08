import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <div class="pointer-events-none fixed inset-x-0 bottom-40 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-28" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="pointer-events-auto rounded-lg px-4 py-2.5 text-sm font-medium shadow-xl shadow-black/40" [class]="t.tone === 'error' ? 'bg-danger text-white' : 'bg-ink text-bg'">{{ t.text }}</div>
      }
    </div>
  `,
})
export class AppComponent { toast = inject(ToastService); }
