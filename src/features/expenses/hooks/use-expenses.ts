import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { expensesApi } from "../api/expenses.api";
import type {
  CreateExpenseDto,
  UpdateExpenseDto,
} from "../schemas/expenses.schema";
import { reportKeys } from "@/features/reports";

// ── Query keys ──────────────────────────────────────────────────────────────────

export const expenseKeys = {
  list: (year: number, month: number) => ["expenses", year, month] as const,
};

/** Expense totals feed directly into the report's total_cost/net, so any
 * write must also refresh the reports feature's caches for that month. */
function invalidateExpenses(qc: QueryClient, year: number, month: number) {
  qc.invalidateQueries({ queryKey: expenseKeys.list(year, month) });
  qc.invalidateQueries({ queryKey: reportKeys.year(year) });
  qc.invalidateQueries({ queryKey: reportKeys.month(year, month) });
  qc.invalidateQueries({ queryKey: reportKeys.dashboard() });
}

// ── Queries ─────────────────────────────────────────────────────────────────────

export function useExpenses(year: number, month: number) {
  return useQuery({
    queryKey: expenseKeys.list(year, month),
    queryFn: () => expensesApi.list(year, month),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────────

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExpenseDto) => expensesApi.create(dto),
    onSuccess: (expense) => {
      invalidateExpenses(qc, expense.year, expense.month);
      toast.success("Expense added");
    },
    onError: (err: Error) =>
      toast.error("Could not add expense", { description: err.message }),
  });
}

export function useUpdateExpense(year: number, month: number, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateExpenseDto) => expensesApi.update(id, dto),
    onSuccess: () => {
      invalidateExpenses(qc, year, month);
      toast.success("Expense updated");
    },
    onError: (err: Error) =>
      toast.error("Could not update expense", { description: err.message }),
  });
}

export function useDeleteExpense(year: number, month: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      invalidateExpenses(qc, year, month);
      toast.success("Expense deleted");
    },
    onError: (err: Error) =>
      toast.error("Could not delete expense", { description: err.message }),
  });
}
