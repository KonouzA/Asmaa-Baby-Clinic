// Public surface of the patients feature.

export { PatientsTable } from "./components/patients-table";
export {
  PatientsFilters,
  type PatientFilters,
} from "./components/patients-filters";
export { PatientsPagination } from "./components/patients-pagination";
export { NewPatientDialog } from "./components/new-patient-dialog";
export { PatientDetail } from "./components/patient-detail";

export {
  usePatientList,
  usePatientFull,
  usePatientGrowth,
  usePatientVisits,
  patientKeys,
} from "./hooks/use-patients";

export { patientsApi } from "./api/patients.api";

export type {
  Patient,
  PatientFull,
  PatientListQuery,
} from "./schemas/patients.schema";
