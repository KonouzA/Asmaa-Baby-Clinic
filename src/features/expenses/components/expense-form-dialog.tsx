import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createExpenseSchema,
  type CreateExpenseDto,
  type Expense,
} from "../schemas/expenses.schema";
import { useCreateExpense, useUpdateExpense } from "../hooks/use-expenses";
import { formatMonthYear } from "@/features/reports";

type ExpenseFormDialogProps = {
  year: number;
  month: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, edits this expense instead of creating a new one. */
  expense?: Expense;
};

function toFormValues(
  year: number,
  month: number,
  expense?: Expense,
): CreateExpenseDto {
  return {
    year,
    month,
    name: expense?.name ?? "",
    description: expense?.description ?? undefined,
    value: expense?.value ?? 0,
  };
}

/** Add/edit modal for a single expense line item (name, description, value). */
export function ExpenseFormDialog({
  year,
  month,
  open,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) {
  const isEdit = !!expense;
  const create = useCreateExpense();
  const update = useUpdateExpense(year, month, expense?.id ?? "");
  const pending = create.isPending || update.isPending;

  const form = useForm<CreateExpenseDto>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: toFormValues(year, month, expense),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(year, month, expense));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense, year, month]);

  const submit = form.handleSubmit((values) => {
    if (isEdit) {
      update.mutate(values, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>{formatMonthYear(month, year)}</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="expense-name">Name</FieldLabel>
            <Input
              id="expense-name"
              placeholder="e.g. Equipment repair"
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="expense-description">
              Description (optional)
            </FieldLabel>
            <Textarea
              id="expense-description"
              rows={2}
              {...form.register("description")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="expense-value">Value</FieldLabel>
            <Input
              id="expense-value"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              {...form.register("value", {
                setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
              })}
            />
            <FieldError errors={[form.formState.errors.value]} />
          </Field>
        </FieldGroup>

        <DialogFooter showCloseButton>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Add expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
