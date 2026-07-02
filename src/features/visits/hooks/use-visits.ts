import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { visitsApi } from "../api/visits.api";
import type {
  CreateVisitDto,
  UpdateVisitDto,
  VisitListQuery,
} from "../schemas/visits.schema";

// ── Query keys ──────────────────────────────────────────────────────────────────

export const visitKeys = {
  all: ["visits"] as const,
  list: (query: Partial<VisitListQuery>) => ["visits", "list", query] as const,
  detail: (id: string) => ["visits", id] as const,
};

/** Invalidate the visit lists plus one visit's detail. Patient caches carry a
 * visit history + growth chart, so refresh those too. */
function invalidateVisit(qc: QueryClient, id: string, patientId?: string) {
  qc.invalidateQueries({ queryKey: ["visits", "list"] });
  qc.invalidateQueries({ queryKey: visitKeys.detail(id) });
  if (patientId) {
    qc.invalidateQueries({ queryKey: ["patients", patientId] });
  }
}

// ── Queries ─────────────────────────────────────────────────────────────────────

export function useVisitList(query: Partial<VisitListQuery>) {
  return useQuery({
    queryKey: visitKeys.list(query),
    queryFn: () => visitsApi.list(query),
    placeholderData: (prev) => prev,
  });
}

export function useVisitFull(id: string | undefined) {
  return useQuery({
    queryKey: visitKeys.detail(id ?? ""),
    queryFn: () => visitsApi.get(id as string),
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────────

export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateVisitDto) => visitsApi.create(dto),
    onSuccess: (visit) => {
      invalidateVisit(qc, visit.id, visit.patient_id);
      toast.success("Visit saved");
    },
    onError: (err: Error) =>
      toast.error("Could not save visit", { description: err.message }),
  });
}

export function useUpdateVisit(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateVisitDto) => visitsApi.update(id, dto),
    onSuccess: (visit) => {
      invalidateVisit(qc, visit.id, visit.patient_id);
      toast.success("Visit updated");
    },
    onError: (err: Error) =>
      toast.error("Could not update visit", { description: err.message }),
  });
}

export function useDeleteVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => visitsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visits", "list"] });
      toast.success("Visit deleted");
    },
    onError: (err: Error) =>
      toast.error("Could not delete visit", { description: err.message }),
  });
}
