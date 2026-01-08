import { environment } from '../../environments/environment';

const baseUrl = environment.servicesUrl.replace(/\/+$/, '');

export const apiUrls = {
  login: `${baseUrl}/api/auth/login`,
  user: `${baseUrl}/api/users/register`,
  users: `${baseUrl}/api/users`,
  patients: `${baseUrl}/api/patients`,
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
  financialOverview: `${baseUrl}/api/financial/overview`,
  employees: `${baseUrl}/api/employees`
};
