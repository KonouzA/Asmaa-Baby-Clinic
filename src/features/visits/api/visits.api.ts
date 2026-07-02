import { api } from "@/lib/api";
import type {
  CreateVisitDto,
  UpdateVisitDto,
  VisitFull,
  VisitListQuery,
  VisitListResponse,
  VisitReceipt,
} from "../schemas/visits.schema";

/** Serialize a list query into a `?key=value` string, dropping empty values. */
function toQueryString(query: Partial<VisitListQuery>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const base = "/api/visits";

export const visitsApi = {
  list: (query: Partial<VisitListQuery>) =>
    api.get<VisitListResponse>(`${base}${toQueryString(query)}`),
  get: (id: string) => api.get<VisitFull>(`${base}/${id}`),
  create: (dto: CreateVisitDto) => api.post<VisitFull>(base, dto),
  update: (id: string, dto: UpdateVisitDto) =>
    api.put<VisitFull>(`${base}/${id}`, dto),
  remove: (id: string) => api.delete<null>(`${base}/${id}`),
  receipt: (id: string) => api.get<VisitReceipt>(`${base}/${id}/receipt`),
};
