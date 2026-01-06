import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: '',
    component: LayoutComponent,
    canActivateChild: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'patient-configurator',
        loadComponent: () =>
          import('./pages/patient-configurator/patient-configurator.component').then(
            (m) => m.PatientConfiguratorComponent
          )
      },
      {
        path: 'patient-configurator/patients/new',
        loadComponent: () =>
          import('./pages/patient-form/patient-form.component').then((m) => m.PatientFormComponent)
      },
      {
        path: 'patient-configurator/patients/:id/medicines',
        loadComponent: () =>
          import('./pages/patient-configurator/patient-medicines/patient-medicines.component').then(
            (m) => m.PatientMedicinesComponent
          )
      },
      {
        path: 'patient-configurator/patients/:id/exams',
        loadComponent: () =>
          import('./pages/patient-configurator/patient-exams/patient-exams.component').then(
            (m) => m.PatientExamsComponent
          )
      },
      {
        path: 'patient-configurator/patients/:id',
        loadComponent: () =>
          import('./pages/patient-form/patient-form.component').then((m) => m.PatientFormComponent)
      },
      {
        path: 'patient-configurator/patients',
        loadComponent: () =>
          import('./pages/patient/patient.component').then((m) => m.PatientComponent)
      },
      {
        path: 'patient-configurator/exams',
        loadComponent: () =>
          import('./pages/exam/exam.component').then((m) => m.ExamComponent)
      },
      {
        path: 'patient-configurator/report',
        loadComponent: () =>
          import('./pages/patient-configurator/patient-report/patient-report.component').then(
            (m) => m.PatientReportComponent
          )
      },
      {
        path: 'patient-configurator/report/response',
        loadComponent: () =>
          import('./pages/patient-configurator/report-patient-response/report-patient-response.component').then(
            (m) => m.ReportPatientResponseComponent
          )
      },
      {
        path: 'patient-configurator/medical-prescription',
        loadComponent: () =>
          import('./pages/patient-configurator/medical-prescription/medical-prescription.component').then(
            (m) => m.MedicalPrescriptionComponent
          )
      },
      {
        path: 'patients/new',
        loadComponent: () =>
          import('./pages/patient-form/patient-form.component').then((m) => m.PatientFormComponent)
      },
      {
        path: 'patients/:id',
        loadComponent: () =>
          import('./pages/patient-form/patient-form.component').then((m) => m.PatientFormComponent)
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
