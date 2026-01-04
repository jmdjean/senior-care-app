import { Component, OnInit, inject } from '@angular/core';
import { HomeService } from '../../shared/services/home.service';
import { LoadingService } from '../../shared/services/loading.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true
})
export class HomeComponent implements OnInit {
  private homeService = inject(HomeService);
  private loadingService = inject(LoadingService);

  totalPatients = 0;
  averagePlanPatients = 0;
  goldPlanPatients = 0;

  ngOnInit(): void {
    this.loadTotalPatients();
    this.loadAveragePlanPatients();
    this.loadGoldPlanPatients();
  }

  private loadTotalPatients(): void {
    this.loadingService.track(this.homeService.getTotalPatient()).subscribe((value) => {
      this.totalPatients = value;
    });
  }

  private loadAveragePlanPatients(): void {
    this.loadingService.track(this.homeService.getPatientPlanAverage()).subscribe((value) => {
      this.averagePlanPatients = value;
    });
  }

  private loadGoldPlanPatients(): void {
    this.loadingService.track(this.homeService.getPatientPlanGold()).subscribe((value) => {
      this.goldPlanPatients = value;
    });
  }
}
