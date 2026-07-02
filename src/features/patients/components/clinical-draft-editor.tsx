import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import type { AllergyDto } from "../schemas/patients.schema";
import type { DraftClinical } from "./patient-draft";
import { ALLERGY_TYPE_LABELS } from "../lib";

type SetDraft = React.Dispatch<React.SetStateAction<DraftClinical>>;

/**
 * Draft editor for allergies / problems / medications. Add appends a new (id-less)
 * item; removing drops it. Shared by the create and edit dialogs so both stage
 * changes and persist them in one bulk save.
 */
export function ClinicalDraftEditor({
  draft,
  setDraft,
}: {
  draft: DraftClinical;
  setDraft: SetDraft;
}) {
  const [allergen, setAllergen] = useState("");
  const [allergyType, setAllergyType] = useState<AllergyDto["type"]>("drug");
  const [condition, setCondition] = useState("");
  const [drug, setDrug] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold">Allergies</h4>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Allergen"
            value={allergen}
            onChange={(e) => setAllergen(e.target.value)}
          />
          <div className="flex gap-2">
            <Select
              value={allergyType}
              onValueChange={(v) => setAllergyType(v as AllergyDto["type"])}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ALLERGY_TYPE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              disabled={!allergen.trim()}
              onClick={() => {
                setDraft((d) => ({
                  ...d,
                  allergies: [
                    ...d.allergies,
                    {
                      allergen: allergen.trim(),
                      type: allergyType,
                      status: "active",
                    },
                  ],
                }));
                setAllergen("");
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
        <DraftChips
          items={draft.allergies.map((a) => `${a.allergen} (${a.type})`)}
          onRemove={(i) =>
            setDraft((d) => ({
              ...d,
              allergies: d.allergies.filter((_, idx) => idx !== i),
            }))
          }
        />
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold">Problems</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            disabled={!condition.trim()}
            onClick={() => {
              setDraft((d) => ({
                ...d,
                problems: [
                  ...d.problems,
                  { condition: condition.trim(), status: "active" },
                ],
              }));
              setCondition("");
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <DraftChips
          items={draft.problems.map((p) => p.condition)}
          onRemove={(i) =>
            setDraft((d) => ({
              ...d,
              problems: d.problems.filter((_, idx) => idx !== i),
            }))
          }
        />
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold">Medications</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Drug"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            disabled={!drug.trim()}
            onClick={() => {
              setDraft((d) => ({
                ...d,
                medications: [...d.medications, { drug: drug.trim() }],
              }));
              setDrug("");
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <DraftChips
          items={draft.medications.map((m) =>
            m.dose ? `${m.drug} · ${m.dose}` : m.drug,
          )}
          onRemove={(i) =>
            setDraft((d) => ({
              ...d,
              medications: d.medications.filter((_, idx) => idx !== i),
            }))
          }
        />
      </section>
    </div>
  );
}

/** Draft editor for the immunization / vaccination history list. */
export function ImmunizationDraftEditor({
  draft,
  setDraft,
}: {
  draft: DraftClinical;
  setDraft: SetDraft;
}) {
  const [vaccine, setVaccine] = useState("");
  const [dateGiven, setDateGiven] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold">Vaccination history</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field>
          <FieldLabel htmlFor="vax-vaccine">Vaccine</FieldLabel>
          <Input
            id="vax-vaccine"
            placeholder="e.g. Hepatitis B"
            value={vaccine}
            onChange={(e) => setVaccine(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="vax-date">Date given</FieldLabel>
          <Input
            id="vax-date"
            type="date"
            value={dateGiven}
            onChange={(e) => setDateGiven(e.target.value)}
          />
        </Field>
        <Button
          type="button"
          variant="outline"
          disabled={!vaccine.trim() || !dateGiven}
          onClick={() => {
            setDraft((d) => ({
              ...d,
              immunizations: [
                ...d.immunizations,
                { vaccine: vaccine.trim(), date_given: dateGiven },
              ],
            }));
            setVaccine("");
            setDateGiven("");
          }}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      <DraftChips
        items={draft.immunizations.map((i) => `${i.vaccine} · ${i.date_given}`)}
        onRemove={(i) =>
          setDraft((d) => ({
            ...d,
            immunizations: d.immunizations.filter((_, idx) => idx !== i),
          }))
        }
      />
    </div>
  );
}

function DraftChips({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (index: number) => void;
}) {
  if (items.length === 0)
    return <p className="text-xs text-muted-foreground">None added yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((label, i) => (
        <Badge key={`${label}-${i}`} variant="secondary" className="gap-1 pr-1">
          {label}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="rounded-full p-0.5 hover:bg-background/60"
          >
            <Trash2 className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
