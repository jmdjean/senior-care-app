import { environment } from '../../environments/environment';

const baseUrl = environment.servicesUrl.replace(/\/+$/, '');

export const apiUrls = {
  login: `${baseUrl}/api/auth/login`,
  user: `${baseUrl}/api/users/register`,
  users: `${baseUrl}/api/users`,
  patients: `${baseUrl}/api/patients`,
  headquarters: `${baseUrl}/api/headquarters`,
  patientNames: `${baseUrl}/api/patients/patient-names`,
  patientExams: (patientId: number | string) => `${baseUrl}/api/patients/${patientId}/exams`,
  patientReport: `${baseUrl}/api/patient/report`,
  medicalPrescription: `${baseUrl}/api/prescriptions`,
  medicalPrescriptionByPatient: (patientId: number | string) => `${baseUrl}/api/prescriptions/patient/${patientId}`,
  reports: `${baseUrl}/api/reports`,
  totalPatients: `${baseUrl}/api/patients/totalPatients`,
  totalPatientsAveragePlan: `${baseUrl}/api/patients/totalPatientsAveragePlan`,
  totalPatientsGoldPlan: `${baseUrl}/api/patients/totalPatientsGoldPlan`,
  disease: `${baseUrl}/api/diseases`,
  plans: `${baseUrl}/api/plans`,
  contracts: `${baseUrl}/api/contracts`,
  rent: `${baseUrl}/api/rent`,
  market: `${baseUrl}/api/market`,
  marketFoodTotal: `${baseUrl}/api/market/overview/food`,
  marketCleaningTotal: `${baseUrl}/api/market/overview/cleaning`,
  financialOverview: `${baseUrl}/api/financial/overview`,
  financialOverviewRent: `${baseUrl}/api/financial/overview/rent`,
  financialPatientsTotal: `${baseUrl}/api/financial/overview/patients-total`,
  financialEmployeesByType: (type: string) =>
    `${baseUrl}/api/financial/overview/employees/${encodeURIComponent(type)}`,
  employees: `${baseUrl}/api/employees`,
  calendarEntries: `${baseUrl}/api/calendar`,
  calendarAvailability: `${baseUrl}/api/calendar/availability`,
  traceabilities: `${baseUrl}/api/traceability`,
  errorLogs: `${baseUrl}/api/logs`
};
