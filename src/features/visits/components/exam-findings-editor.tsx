import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXAM_CATEGORY_LABELS } from "../lib";
import { examCategoryEnum, type ExamCategory } from "../schemas/visits.schema";
import type { VisitForm } from "./visit-form-helpers";

/** Add/remove rows for physical exam findings (up to 12, one per body system). */
export function ExamFindingsEditor({ form }: { form: VisitForm }) {
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exam_findings",
  });

  const used = fields.map((_, i) => form.watch(`exam_findings.${i}.category`));
  const nextCategory =
    (examCategoryEnum.options.find((c) => !used.includes(c)) as
      | ExamCategory
      | undefined) ?? "general_appearance";

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No findings added. Add a body system to record the exam.
        </p>
      )}

      {fields.map((f, i) => (
        <div
          key={f.id}
          className="grid grid-cols-1 gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(0,11rem)_auto_1fr_auto] sm:items-center"
        >
          <Select
            value={form.watch(`exam_findings.${i}.category`)}
            onValueChange={(v) =>
              form.setValue(`exam_findings.${i}.category`, v as ExamCategory)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {examCategoryEnum.options.map((c) => (
                <SelectItem key={c} value={c}>
                  {EXAM_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={form.watch(`exam_findings.${i}.status`) ?? "normal"}
            onValueChange={(v) =>
              form.setValue(
                `exam_findings.${i}.status`,
                v as "normal" | "abnormal",
              )
            }
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="abnormal">Abnormal</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Description / notes"
            {...register(`exam_findings.${i}.description`)}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
            onClick={() => remove(i)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        disabled={fields.length >= 12}
        onClick={() =>
          append({ category: nextCategory, status: "normal", description: "" })
        }
      >
        <Plus className="size-4" />
        Add finding
      </Button>
    </div>
  );
}
