"use client";

import * as Dialog from "@radix-ui/react-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
}

/**
 * Accessible destructive-action confirmation.
 * Radix Dialog provides focus trap, Esc-to-close and overlay-click close.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-flora-border bg-white p-5 shadow-lg"
        >
          <Dialog.Title className="text-sm font-semibold text-flora-primary">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-flora-muted">
            {description}
          </Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={loading}
                className="rounded-lg border border-flora-border bg-white px-4 py-2 text-sm font-medium text-flora-muted transition-colors hover:bg-flora-surface disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="rounded-lg bg-[#991B1B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7f1d1d] disabled:opacity-50"
            >
              {loading ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
