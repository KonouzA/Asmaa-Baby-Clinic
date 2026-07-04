import { useState } from "react";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatMonthYear } from "@/features/reports";
import { useDeleteExpense, useExpenses } from "../hooks/use-expenses";
import type { Expense } from "../schemas/expenses.schema";
import { ExpenseFormDialog } from "./expense-form-dialog";

/** Itemized monthly expense ledger: list, add, edit and delete line items. */
export function ExpensesTable({ year, month }: { year: number; month: number }) {
  const { data: expenses, isLoading } = useExpenses(year, month);
  const deleteExpense = useDeleteExpense(year, month);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);
  const [deleting, setDeleting] = useState<Expense | undefined>(undefined);

  const openAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setFormOpen(true);
  };

  const total = (expenses ?? []).reduce((sum, e) => sum + e.value, 0);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Expenses</CardTitle>
        <CardDescription>{formatMonthYear(month, year)}</CardDescription>
        <CardAction>
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" />
            Add expense
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !expenses || expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No expenses recorded</p>
            <p className="text-sm text-muted-foreground">
              Add an expense to start tracking costs for this month.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow
                    key={e.id}
                    className="cursor-pointer"
                    onClick={() => openEdit(e)}
                  >
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {e.description || "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(e.value)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setDeleting(e);
                        }}
                        aria-label={`Delete ${e.name}`}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {expenses && expenses.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-sm font-medium">Total cost</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        )}
      </CardContent>

      <ExpenseFormDialog
        year={year}
        month={month}
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editing}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the expense entry. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteExpense.mutate(deleting.id);
                setDeleting(undefined);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
