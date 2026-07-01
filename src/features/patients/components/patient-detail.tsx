import { useState } from "react";
import { useNavigate } from "react-router";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import type { PatientFull } from "../schemas/patients.schema";
import { useDeletePatient, usePatientVisits } from "../hooks/use-patients";
import {
  BLOOD_TYPES,
  DELIVERY_TYPE_LABELS,
  FEEDING_TYPE_LABELS,
  SEX_LABELS,
  formatAge,
  formatDate,
  formatDateTime,
  humanize,
} from "../lib";
import {
  AllergiesSection,
  ImmunizationsSection,
  MedicationsSection,
  ProblemsSection,
} from "./clinical-list-section";
import { GrowthChart } from "./growth-chart";
import { PatientEditDialog } from "./patient-edit-dialog";

export function PatientDetail({ patient }: { patient: PatientFull }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const del = useDeletePatient();

  const onDelete = () => {
    del.mutate(patient.id, {
      onSuccess: () => navigate("/patients"),
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-6 md:px-10">
      {/* Action bar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {patient.full_name}
            </h1>
            <Badge variant={patient.sex === "female" ? "secondary" : "outline"}>
              {SEX_LABELS[patient.sex]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono">{patient.mrn}</span> · {formatAge(patient.dob)} ·
            Born {formatDate(patient.dob)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate("/visits")}>
            <CalendarPlus className="size-4" />
            New visit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="flex-wrap">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="birth">Birth Info</TabsTrigger>
          <TabsTrigger value="clinical">Clinical List</TabsTrigger>
          <TabsTrigger value="vaccination">Vaccination</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardContent className="pt-6">
              <InfoGrid
                rows={[
                  ["Full name", patient.full_name],
                  ["MRN", patient.mrn],
                  ["Date of birth", formatDate(patient.dob)],
                  ["Time of birth", patient.time_of_birth ?? "—"],
                  ["Sex", SEX_LABELS[patient.sex]],
                  [
                    "Blood type",
                    BLOOD_TYPES.includes(patient.blood_type as never)
                      ? (patient.blood_type as string)
                      : "—",
                  ],
                  ["Feeding", patient.feeding_type ? FEEDING_TYPE_LABELS[patient.feeding_type] : "—"],
                  ["Weaning status", patient.weaning_status ?? "—"],
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="birth">
          <Card>
            <CardContent className="pt-6">
              <InfoGrid
                rows={[
                  [
                    "Gestational age",
                    patient.gestational_age_weeks != null
                      ? `${patient.gestational_age_weeks} wk`
                      : "—",
                  ],
                  [
                    "Delivery type",
                    patient.delivery_type
                      ? DELIVERY_TYPE_LABELS[patient.delivery_type]
                      : "—",
                  ],
                  [
                    "Birth weight",
                    patient.birth_weight_kg != null
                      ? `${patient.birth_weight_kg} kg`
                      : "—",
                  ],
                  [
                    "Birth length",
                    patient.birth_length_cm != null
                      ? `${patient.birth_length_cm} cm`
                      : "—",
                  ],
                  [
                    "Head circumference",
                    patient.birth_hc_cm != null
                      ? `${patient.birth_hc_cm} cm`
                      : "—",
                  ],
                  ["NICU admission", patient.nicu_admission ? "Yes" : "No"],
                  [
                    "NICU days",
                    patient.nicu_days != null ? String(patient.nicu_days) : "—",
                  ],
                  [
                    "Newborn screening",
                    patient.newborn_screening_done
                      ? patient.newborn_screening_result ?? "Done"
                      : "Not done",
                  ],
                  ["Neonatal complications", patient.neonatal_complications ?? "—"],
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical">
          <Card>
            <CardContent className="flex flex-col gap-6 pt-6">
              <AllergiesSection patientId={patient.id} items={patient.allergies} />
              <ProblemsSection patientId={patient.id} items={patient.problems} />
              <MedicationsSection
                patientId={patient.id}
                items={patient.medications}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccination">
          <Card>
            <CardContent className="pt-6">
              <ImmunizationsSection
                patientId={patient.id}
                items={patient.immunizations}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Growth over time</CardTitle>
            </CardHeader>
            <CardContent>
              <GrowthChart patientId={patient.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <VisitHistory patientId={patient.id} />

      <PatientEditDialog
        patient={patient}
        open={editing}
        onOpenChange={setEditing}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {patient.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the patient and all associated allergies,
              problems, medications, immunizations and visits. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoGrid({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function VisitHistory({ patientId }: { patientId: string }) {
  const { data, isLoading } = usePatientVisits(patientId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Visit history</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading visits…</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {data.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {formatDateTime(v.datetime)}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {humanize(v.type)}
                    {v.reason ? ` · ${v.reason}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {v.fee != null && (
                    <span className="text-sm text-muted-foreground">
                      {v.fee.toFixed(2)}
                    </span>
                  )}
                  <Badge variant="outline" className="font-normal">
                    {humanize(v.status)}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
