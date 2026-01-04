import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./pages/patient/patient.component').then((m) => m.PatientComponent)
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./pages/exam/exam.component').then((m) => m.ExamComponent)
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./pages/report/report.component').then((m) => m.ReportComponent)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/authentication/authentication.component').then(
        (m) => m.AuthenticationComponent
      )
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/auth/signup/signup.component').then((m) => m.SignupComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
