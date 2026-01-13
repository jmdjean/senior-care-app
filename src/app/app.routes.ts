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
        path: 'calendario',
        loadComponent: () =>
          import('./pages/calendar/dashboard/calendar-dashboard.component').then((m) => m.CalendarDashboardComponent)
      },
      {
        path: 'calendario/registros',
        loadComponent: () =>
          import('./pages/calendar/records/calendar.component').then((m) => m.CalendarComponent)
      },
      {
        path: 'calendario/compromissos',
        loadComponent: () =>
          import('./pages/calendar/commitments/calendar-commitments.component').then(
            (m) => m.CalendarCommitmentsComponent
          )
      },
      {
        path: 'calendario/novo',
        loadComponent: () =>
          import('./pages/calendar/form/calendar-form.component').then((m) => m.CalendarFormComponent)
      },
      {
        path: 'calendario/:id',
        loadComponent: () =>
          import('./pages/calendar/form/calendar-form.component').then((m) => m.CalendarFormComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users-configurator/users-configurator.component').then(
            (m) => m.UsersConfiguratorComponent
          )
      },
      {
        path: 'users/new',
        loadComponent: () =>
          import('./pages/users/user-form/user-form.component').then((m) => m.UserFormComponent)
      },
      {
        path: 'users/list',
        loadComponent: () =>
          import('./pages/users/user-list/user-list.component').then((m) => m.UserListComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./pages/users/user-form/user-form.component').then((m) => m.UserFormComponent)
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
      },
      {
        path: 'financeiro',
        loadComponent: () =>
          import('./pages/financeiro/financeiro-configurator/financeiro-configurator.component').then(
            (m) => m.FinanceiroConfiguratorComponent
          )
      },
      {
        path: 'financeiro/contracts',
        loadComponent: () =>
          import('./pages/financeiro/contracts/contracts.component').then((m) => m.ContractsComponent)
      },
      {
        path: 'financeiro/contracts/new',
        loadComponent: () =>
          import('./pages/financeiro/contracts/contract-form.component').then((m) => m.ContractFormComponent)
      },
      {
        path: 'financeiro/contracts/:id',
        loadComponent: () =>
          import('./pages/financeiro/contracts/contract-form.component').then((m) => m.ContractFormComponent)
      },
      {
        path: 'financeiro/rent',
        loadComponent: () =>
          import('./pages/financeiro/rent/rent.component').then((m) => m.RentComponent)
      },
      {
        path: 'financeiro/market',
        loadComponent: () =>
          import('./pages/financeiro/market/market.component').then((m) => m.MarketComponent)
      },
      {
        path: 'financeiro/market/new',
        loadComponent: () =>
          import('./pages/financeiro/market/market-form.component').then((m) => m.MarketFormComponent)
      },
      {
        path: 'financeiro/market/:id',
        loadComponent: () =>
          import('./pages/financeiro/market/market-form.component').then((m) => m.MarketFormComponent)
      },
      {
        path: 'financeiro/market/:id/view',
        loadComponent: () =>
          import('./pages/financeiro/market/market-view.component').then((m) => m.MarketViewComponent)
      },
      {
        path: 'financeiro/overview',
        loadComponent: () =>
          import('./pages/financeiro/overview/overview.component').then((m) => m.OverviewComponent)
      },
      {
        path: 'mercado',
        loadComponent: () =>
          import('./pages/market/market-configurator/market-configurator.component').then(
            (m) => m.MarketConfiguratorComponent
          )
      },
      {
        path: 'mercado/list',
        loadComponent: () =>
          import('./pages/financeiro/market/market.component').then((m) => m.MarketComponent)
      },
      {
        path: 'mercado/new',
        loadComponent: () =>
          import('./pages/financeiro/market/market-form.component').then((m) => m.MarketFormComponent)
      },
      {
        path: 'mercado/overview',
        loadComponent: () =>
          import('./pages/market/overview-market/overview-market.component').then(
            (m) => m.OverviewMarketComponent
          )
      },
      {
        path: 'mercado/:id/view',
        loadComponent: () =>
          import('./pages/financeiro/market/market-view.component').then((m) => m.MarketViewComponent)
      },
      {
        path: 'mercado/:id',
        loadComponent: () =>
          import('./pages/financeiro/market/market-form.component').then((m) => m.MarketFormComponent)
      },
      {
        path: 'sede',
        loadComponent: () =>
          import('./pages/headquarters/headquarter-list.component').then((m) => m.HeadquarterListComponent)
      },
      {
        path: 'funcionarios',
        loadComponent: () =>
          import('./pages/funcionarios/funcionarios-configurator/funcionarios-configurator.component').then(
            (m) => m.FuncionariosConfiguratorComponent
          )
      },
      {
        path: 'funcionarios/new',
        loadComponent: () =>
          import('./pages/funcionarios/employee-form/employee-form.component').then((m) => m.EmployeeFormComponent)
      },
      {
        path: 'funcionarios/list',
        loadComponent: () =>
          import('./pages/funcionarios/employee-list/employee-list.component').then((m) => m.EmployeeListComponent)
      },
      {
        path: 'funcionarios/:id',
        loadComponent: () =>
          import('./pages/funcionarios/employee-form/employee-form.component').then((m) => m.EmployeeFormComponent)
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
    path: '**',
    redirectTo: 'home'
  }
];
