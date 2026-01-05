import { environment } from '../../environments/environment';

const baseUrl = environment.servicesUrl.replace(/\/+$/, '');

export const apiUrls = {
  login: `${baseUrl}/api/auth/login`,
  user: `${baseUrl}/api/users/register`,
  patients: `${baseUrl}/api/patients`,
  patientNames: `${baseUrl}/api/patient/patient-names`,
  patientExams: (patientId: number | string) => `${baseUrl}/api/patients/${patientId}/exams`,
  reports: `${baseUrl}/api/reports`,
  totalPatients: `${baseUrl}/api/patients/totalPatients`,
  totalPatientsAveragePlan: `${baseUrl}/api/patients/totalPatientsAveragePlan`,
  totalPatientsGoldPlan: `${baseUrl}/api/patients/totalPatientsGoldPlan`,
  disease: `${baseUrl}/api/disease`,
  plans: `${baseUrl}/api/plans`
};
