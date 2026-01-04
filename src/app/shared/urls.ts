import { environment } from '../../environments/environment';

const baseUrl = environment.servicesUrl.replace(/\/+$/, '');

export const apiUrls = {
  login: `${baseUrl}/login`,
  user: `${baseUrl}/user`,
  patients: `${baseUrl}/patients`,
  patientNames: `${baseUrl}/patient/patient-names`,
  patientExams: (patientId: number | string) => `${baseUrl}/patients/${patientId}/exams`,
  reports: `${baseUrl}/reports`,
  totalPatients: `${baseUrl}/patients/totalPatients`,
  totalPatientsAveragePlan: `${baseUrl}/patients/totalPatientsAveragePlan`,
  totalPatientsGoldPlan: `${baseUrl}/patients/totalPatientsGoldPlan`
};
