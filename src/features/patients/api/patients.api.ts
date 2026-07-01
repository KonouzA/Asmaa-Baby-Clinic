import { api } from "@/lib/api";
import type {
  AllergyDto,
  Allergy,
  CreatePatientDto,
  GrowthPoint,
  Immunization,
  ImmunizationDto,
  Patient,
  PatientFull,
  PatientListQuery,
  PatientListResponse,
  PatientMedication,
  PatientMedicationDto,
  Problem,
  ProblemDto,
  UpdatePatientDto,
  VisitSummary,
} from "../schemas/patients.schema";

/** Serialize a list query into a `?key=value` string, dropping empty values. */
function toQueryString(query: Partial<PatientListQuery>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const base = "/api/patients";

export const patientsApi = {
  // Core
  list: (query: Partial<PatientListQuery>) =>
    api.get<PatientListResponse>(`${base}${toQueryString(query)}`),
  get: (id: string) => api.get<Patient>(`${base}/${id}`),
  getFull: (id: string) => api.get<PatientFull>(`${base}/${id}/full`),
  create: (dto: CreatePatientDto) => api.post<Patient>(base, dto),
  update: (id: string, dto: UpdatePatientDto) =>
    api.put<Patient>(`${base}/${id}`, dto),
  remove: (id: string) => api.delete<{ ok: true }>(`${base}/${id}`),

  // Allergies
  listAllergies: (id: string) => api.get<Allergy[]>(`${base}/${id}/allergies`),
  createAllergy: (id: string, dto: AllergyDto) =>
    api.post<Allergy>(`${base}/${id}/allergies`, dto),
  updateAllergy: (id: string, allergyId: string, dto: Partial<AllergyDto>) =>
    api.put<Allergy>(`${base}/${id}/allergies/${allergyId}`, dto),
  deleteAllergy: (id: string, allergyId: string) =>
    api.delete<{ ok: true }>(`${base}/${id}/allergies/${allergyId}`),

  // Problems
  listProblems: (id: string) => api.get<Problem[]>(`${base}/${id}/problems`),
  createProblem: (id: string, dto: ProblemDto) =>
    api.post<Problem>(`${base}/${id}/problems`, dto),
  updateProblem: (id: string, problemId: string, dto: Partial<ProblemDto>) =>
    api.put<Problem>(`${base}/${id}/problems/${problemId}`, dto),
  deleteProblem: (id: string, problemId: string) =>
    api.delete<{ ok: true }>(`${base}/${id}/problems/${problemId}`),

  // Medications
  listMedications: (id: string) =>
    api.get<PatientMedication[]>(`${base}/${id}/medications`),
  createMedication: (id: string, dto: PatientMedicationDto) =>
    api.post<PatientMedication>(`${base}/${id}/medications`, dto),
  updateMedication: (
    id: string,
    medId: string,
    dto: Partial<PatientMedicationDto>,
  ) => api.put<PatientMedication>(`${base}/${id}/medications/${medId}`, dto),
  deleteMedication: (id: string, medId: string) =>
    api.delete<{ ok: true }>(`${base}/${id}/medications/${medId}`),

  // Immunizations
  listImmunizations: (id: string) =>
    api.get<Immunization[]>(`${base}/${id}/immunizations`),
  createImmunization: (id: string, dto: ImmunizationDto) =>
    api.post<Immunization>(`${base}/${id}/immunizations`, dto),
  deleteImmunization: (id: string, immId: string) =>
    api.delete<{ ok: true }>(`${base}/${id}/immunizations/${immId}`),

  // Derived
  growth: (id: string) => api.get<GrowthPoint[]>(`${base}/${id}/growth`),
  visits: (id: string) => api.get<VisitSummary[]>(`${base}/${id}/visits`),
};
