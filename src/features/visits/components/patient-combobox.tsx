import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { usePatientList } from "@/features/patients";
import { SEX_LABELS, formatAge } from "@/features/patients/lib";

export function PatientCombobox({
  value,
  selectedLabel,
  onChange,
  disabled,
}: {
  value: string | undefined;
  /** Label to show in the trigger for the selected patient (parent already has it). */
  selectedLabel?: string;
  onChange: (patientId: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isFetching } = usePatientList({
    q: debounced || undefined,
    pageSize: 20,
    sort: "full_name_asc",
  });
  const patients = data?.data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value ? (selectedLabel ?? "Selected patient") : "Select a patient…"}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or MRN…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isFetching ? "Searching…" : "No patients found."}
            </CommandEmpty>
            <CommandGroup>
              {patients.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.id}
                  onSelect={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === p.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-foreground">
                      {p.full_name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{p.mrn}</span> ·{" "}
                      {SEX_LABELS[p.sex]} · {formatAge(p.dob)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
