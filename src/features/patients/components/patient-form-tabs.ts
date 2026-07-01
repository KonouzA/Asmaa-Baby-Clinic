/** Shared tab set for the patient create / edit dialogs, in display order. */
export const PATIENT_TABS = [
  { value: "basic", label: "Basic" },
  { value: "birth", label: "Birth Info" },
  { value: "clinical", label: "Clinical List" },
  { value: "vaccination", label: "Vaccination" },
  { value: "summary", label: "Summary" },
] as const;

export type PatientTabValue = (typeof PATIENT_TABS)[number]["value"];
