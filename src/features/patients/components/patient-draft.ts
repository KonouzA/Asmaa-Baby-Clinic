import type {
  AllergyDto,
  ImmunizationDto,
  PatientFull,
  PatientMedicationDto,
  ProblemDto,
} from "../schemas/patients.schema";

/** A draft clinical item; persisted items carry an `id`, new ones don't. */
export type DraftItem<T> = T & { id?: string };

export type DraftClinical = {
  allergies: DraftItem<AllergyDto>[];
  problems: DraftItem<ProblemDto>[];
  medications: DraftItem<PatientMedicationDto>[];
  immunizations: DraftItem<ImmunizationDto>[];
};

export const emptyDraft: DraftClinical = {
  allergies: [],
  problems: [],
  medications: [],
  immunizations: [],
};

/** Seed a draft from a persisted patient, keeping ids so we can diff on save. */
export function draftFromPatient(p: PatientFull): DraftClinical {
  return {
    allergies: p.allergies.map((a) => ({
      id: a.id,
      allergen: a.allergen,
      type: a.type,
      reaction: a.reaction ?? undefined,
      severity: a.severity ?? undefined,
      status: a.status,
    })),
    problems: p.problems.map((pr) => ({
      id: pr.id,
      condition: pr.condition,
      icd10_code: pr.icd10_code ?? undefined,
      onset_date: pr.onset_date ?? undefined,
      status: pr.status,
    })),
    medications: p.medications.map((m) => ({
      id: m.id,
      drug: m.drug,
      dose: m.dose ?? undefined,
      route: m.route ?? undefined,
      frequency: m.frequency ?? undefined,
      start_date: m.start_date ?? undefined,
      end_date: m.end_date ?? undefined,
    })),
    immunizations: p.immunizations.map((i) => ({
      id: i.id,
      vaccine: i.vaccine,
      dose_number: i.dose_number ?? undefined,
      date_given: i.date_given,
      visit_id: i.visit_id ?? undefined,
    })),
  };
}

/** Split one list into ids removed since the original and freshly added items. */
function listDiff<T>(originalIds: string[], draftItems: DraftItem<T>[]) {
  const draftIds = new Set(
    draftItems.filter((i) => i.id).map((i) => i.id as string),
  );
  return {
    removed: originalIds.filter((id) => !draftIds.has(id)),
    added: draftItems.filter((i) => !i.id),
  };
}

/** Compute the add/remove operations needed to reconcile a draft with the patient. */
export function diffClinical(original: PatientFull, draft: DraftClinical) {
  return {
    allergies: listDiff(
      original.allergies.map((a) => a.id),
      draft.allergies,
    ),
    problems: listDiff(
      original.problems.map((p) => p.id),
      draft.problems,
    ),
    medications: listDiff(
      original.medications.map((m) => m.id),
      draft.medications,
    ),
    immunizations: listDiff(
      original.immunizations.map((i) => i.id),
      draft.immunizations,
    ),
  };
}

export type ClinicalDiff = ReturnType<typeof diffClinical>;
