import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HomeService } from '../../shared/services/home.service';
import { LoadingService } from '../../shared/services/loading.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatIconModule]
})
export class HomeComponent implements OnInit {
  private homeService = inject(HomeService);
  private loadingService = inject(LoadingService);

  totalPatients = signal(0);
  averagePlanPatients = signal(0);
  goldPlanPatients = signal(0);

  ngOnInit(): void {
    this.loadTotalPatients();
    this.loadAveragePlanPatients();
    this.loadGoldPlanPatients();
  }

  private loadTotalPatients(): void {
    this.loadingService.track(this.homeService.getTotalPatient()).subscribe((value) => {
      this.totalPatients.set(value.total);
    });
  }

  private loadAveragePlanPatients(): void {
    this.loadingService.track(this.homeService.getPatientPlanAverage()).subscribe((value) => {
      this.averagePlanPatients.set(value.total);
    });
  }

  private loadGoldPlanPatients(): void {
    this.loadingService.track(this.homeService.getPatientPlanGold()).subscribe((value) => {
      this.goldPlanPatients.set(value.total);
    });
  }
}
