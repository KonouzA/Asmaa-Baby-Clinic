import { api } from "@/lib/api";
import type {
  CreateExpenseDto,
  Expense,
  UpdateExpenseDto,
} from "../schemas/expenses.schema";

const base = "/api/expenses";

export const expensesApi = {
  list: (year: number, month: number) =>
    api.get<Expense[]>(`${base}?year=${year}&month=${month}`),
  create: (dto: CreateExpenseDto) => api.post<Expense>(base, dto),
  update: (id: string, dto: UpdateExpenseDto) =>
    api.put<Expense>(`${base}/${id}`, dto),
  remove: (id: string) => api.delete<null>(`${base}/${id}`),
};
