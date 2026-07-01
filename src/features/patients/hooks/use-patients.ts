import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { patientsApi } from "../api/patients.api";
import type {
  AllergyDto,
  CreatePatientDto,
  ImmunizationDto,
  PatientListQuery,
  PatientMedicationDto,
  ProblemDto,
  UpdatePatientDto,
} from "../schemas/patients.schema";

// ── Query keys ──────────────────────────────────────────────────────────────────

export const patientKeys = {
  all: ["patients"] as const,
  list: (query: Partial<PatientListQuery>) =>
    ["patients", "list", query] as const,
  detail: (id: string) => ["patients", id] as const,
  full: (id: string) => ["patients", id, "full"] as const,
  growth: (id: string) => ["patients", id, "growth"] as const,
  visits: (id: string) => ["patients", id, "visits"] as const,
};

/** Invalidate every cache entry tied to a single patient (detail, full, growth, visits). */
function invalidatePatient(qc: QueryClient, id: string) {
  qc.invalidateQueries({ queryKey: patientKeys.detail(id) });
  qc.invalidateQueries({ queryKey: ["patients", "list"] });
}

// ── Queries ─────────────────────────────────────────────────────────────────────

export function usePatientList(query: Partial<PatientListQuery>) {
  return useQuery({
    queryKey: patientKeys.list(query),
    queryFn: () => patientsApi.list(query),
    placeholderData: (prev) => prev,
  });
}

export function usePatientFull(id: string | undefined) {
  return useQuery({
    queryKey: patientKeys.full(id ?? ""),
    queryFn: () => patientsApi.getFull(id as string),
    enabled: !!id,
  });
}

export function usePatientGrowth(id: string | undefined) {
  return useQuery({
    queryKey: patientKeys.growth(id ?? ""),
    queryFn: () => patientsApi.growth(id as string),
    enabled: !!id,
  });
}

export function usePatientVisits(id: string | undefined) {
  return useQuery({
    queryKey: patientKeys.visits(id ?? ""),
    queryFn: () => patientsApi.visits(id as string),
    enabled: !!id,
  });
}

// ── Patient mutations ─────────────────────────────────────────────────────────────

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePatientDto) => patientsApi.create(dto),
    onSuccess: (patient) => {
      qc.invalidateQueries({ queryKey: ["patients", "list"] });
      toast.success("Patient created", {
        description: `${patient.full_name} (${patient.mrn}) was added.`,
      });
    },
    onError: (err: Error) => toast.error("Could not create patient", { description: err.message }),
  });
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePatientDto) => patientsApi.update(id, dto),
    onSuccess: (patient) => {
      invalidatePatient(qc, id);
      toast.success("Patient updated", {
        description: `${patient.full_name}'s details were saved.`,
      });
    },
    onError: (err: Error) => toast.error("Could not update patient", { description: err.message }),
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients", "list"] });
      toast.success("Patient deleted");
    },
    onError: (err: Error) => toast.error("Could not delete patient", { description: err.message }),
  });
}

// ── Allergy mutations ─────────────────────────────────────────────────────────────

export function useCreateAllergy(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AllergyDto) => patientsApi.createAllergy(patientId, dto),
    onSuccess: () => {
      invalidatePatient(qc, patientId);
      toast.success("Allergy added");
    },
    onError: (err: Error) => toast.error("Could not add allergy", { description: err.message }),
  });
}

export function useDeleteAllergy(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (allergyId: string) =>
      patientsApi.deleteAllergy(patientId, allergyId),
    onSuccess: () => {
      invalidatePatient(qc, patientId);
      toast.success("Allergy removed");
    },
    onError: (err: Error) => toast.error("Could not remove allergy", { description: err.message }),
  });
}

// ── Problem mutations ─────────────────────────────────────────────────────────────

export function useCreateProblem(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ProblemDto) => patientsApi.createProblem(patientId, dto),
    onSuccess: () => {
      invalidatePatient(qc, patientId);
      toast.success("Problem added");
    },
    onError: (err: Error) => toast.error("Could not add problem", { description: err.message }),
  });
}

export function useDeleteProblem(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) =>
      patientsApi.deleteProblem(patientId, problemId),
    onSuccess: () => {
      invalidatePatient(qc, patientId);
      toast.success("Problem removed");
    },
    onError: (err: Error) => toast.error("Could not remove problem", { description: err.message }),
  });
}

// ── Medication mutations ──────────────────────────────────────────────────────────

export function useCreateMedication(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PatientMedicationDto) =>
      patientsApi.createMedication(patientId, dto),
    onSuccess: () => {
      invalidatePatient(qc, patientId);
      toast.success("Medication added");
    },
    onError: (err: Error) => toast.error("Could not add medication", { description: err.message }),
  });
}

export function useDeleteMedication(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (medId: string) =>
      patientsApi.deleteMedication(patientId, medId),
    onSuccess: () => {
      invalidatePatient(qc, patientId);
      toast.success("Medication removed");
    },
    onError: (err: Error) => toast.error("Could not remove medication", { description: err.message }),
  });
}

// ── Immunization mutations ────────────────────────────────────────────────────────

export function useCreateImmunization(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ImmunizationDto) =>
      patientsApi.createImmunization(patientId, dto),
    onSuccess: () => {
      invalidatePatient(qc, patientId);
      qc.invalidateQueries({ queryKey: patientKeys.growth(patientId) });
      toast.success("Immunization recorded");
    },
    onError: (err: Error) => toast.error("Could not record immunization", { description: err.message }),
  });
}

export function useDeleteImmunization(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (immId: string) =>
      patientsApi.deleteImmunization(patientId, immId),
    onSuccess: () => {
      invalidatePatient(qc, patientId);
      toast.success("Immunization removed");
    },
    onError: (err: Error) => toast.error("Could not remove immunization", { description: err.message }),
  });
}
