import { FileText, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/patients/lib";
import type { VisitAttachment } from "../schemas/visits.schema";

/**
 * Attachments are pre-uploaded elsewhere and linked to a visit by id. There is no
 * upload endpoint yet, so this step lists any already-linked files and is otherwise
 * informational.
 */
export function VisitAttachmentsStep({
  attachments,
}: {
  attachments: VisitAttachment[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <Paperclip className="size-5 text-muted-foreground" />
          </div>
          <p className="font-medium">No attachments</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            File uploads aren&apos;t available yet. Lab results, imaging and
            referrals linked to this visit will appear here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y rounded-xl border">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 p-3">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{a.title}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {formatDate(a.date)}
                </span>
              </div>
              {a.type && (
                <Badge variant="outline" className="ml-auto font-normal">
                  {a.type}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
