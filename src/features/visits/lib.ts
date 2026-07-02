import type { Badge } from "@/components/ui/badge";
import type { VisitStatus, VisitType, ExamCategory } from "./schemas/visits.schema";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  "well-child": "Well-child",
  sick: "Sick",
  "follow-up": "Follow-up",
  vaccination: "Vaccination",
  emergency: "Emergency",
};

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  booked: "Booked",
  "checked-in": "Checked in",
  "in-progress": "In progress",
  done: "Done",
  "no-show": "No-show",
  cancelled: "Cancelled",
};

export const VISIT_STATUS_BADGE: Record<VisitStatus, BadgeVariant> = {
  booked: "outline",
  "checked-in": "secondary",
  "in-progress": "secondary",
  done: "default",
  "no-show": "destructive",
  cancelled: "destructive",
};

export const EXAM_CATEGORY_LABELS: Record<ExamCategory, string> = {
  general_appearance: "General appearance",
  heent: "HEENT",
  neck: "Neck",
  chest_lungs: "Chest & lungs",
  cardiovascular: "Cardiovascular",
  abdomen: "Abdomen",
  genitourinary: "Genitourinary",
  rectal: "Rectal",
  musculoskeletal: "Musculoskeletal",
  lymph_nodes: "Lymph nodes",
  extremities_skin: "Extremities & skin",
  neurological: "Neurological",
};

export const TEMP_ROUTE_LABELS: Record<string, string> = {
  axillary: "Axillary",
  oral: "Oral",
  rectal: "Rectal",
  tympanic: "Tympanic",
};

export const DEV_TOOL_LABELS: Record<string, string> = {
  mchat: "M-CHAT",
  asq: "ASQ",
  denver: "Denver",
  flacc: "FLACC",
  faces: "FACES",
};
