import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page py-16">
      <app-empty icon="compass" title="This page does not exist" text="The link may be old or mistyped.">
        <a routerLink="/" class="btn-primary btn-sm">Back to home</a>
      </app-empty>
    </div>
  `,
})
export class NotFoundPage {}
