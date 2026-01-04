import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  imports: [NgIf, AsyncPipe],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  standalone: true
})
export class LoadingSpinnerComponent {
  private loadingService = inject(LoadingService);
  readonly loading$ = this.loadingService.loading$;
}