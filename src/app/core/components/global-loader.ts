import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LoaderService } from '../../shared/services/loader.service';
import { Loader } from '../../shared/components/loader';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [Loader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
      <app-loader
        [overlay]="true"
        [message]="message()"
        [darkMode]="true"
      />
    }
  `
})
export class GlobalLoader {
  private readonly loaderService = inject(LoaderService);

  protected readonly isVisible = computed(() => this.loaderService.state().isLoading);
  protected readonly message = computed(() => this.loaderService.state().message || '');
}
