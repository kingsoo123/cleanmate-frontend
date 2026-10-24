"use client";

import { useEffect, useState } from "react";
import { FormField } from "@/components/auth/form-field";

export type RegisterBranchDraft = {
  id: string;
  name: string;
  address: string;
};

let nextBranchRowKey = 0;

function emptyBranch(): RegisterBranchDraft {
  nextBranchRowKey += 1;
  return { id: `branch-row-${nextBranchRowKey}`, name: "", address: "" };
}

export function RegisterBranchesField({
  error,
  onChange,
}: {
  error?: string;
  onChange: (branches: RegisterBranchDraft[]) => void;
}) {
  const [rows, setRows] = useState<RegisterBranchDraft[]>([emptyBranch()]);

  useEffect(() => {
    onChange(rows);
  }, []);

  function updateRows(next: RegisterBranchDraft[]) {
    setRows(next);
    onChange(next);
  }

  function updateRow(id: string, patch: Partial<RegisterBranchDraft>) {
    updateRows(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    updateRows([...rows, emptyBranch()]);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) return;
    updateRows(rows.filter((row) => row.id !== id));
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-secondary-surface/40 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Branches</p>
        <p className="mt-1 text-xs text-muted">
          Add each shop location. Staff pick a branch when creating orders.
        </p>
      </div>

      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className="space-y-3 rounded-lg border border-border bg-surface p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Branch {index + 1}
              </span>
              {rows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <FormField
              name={`branch-name-${row.id}`}
              label="Branch name"
              placeholder="e.g. Lekki Phase 1"
              required
              value={row.name}
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
            />
            <FormField
              name={`branch-address-${row.id}`}
              label="Address (optional)"
              placeholder="Street, city"
              value={row.address}
              onChange={(e) => updateRow(row.id, { address: e.target.value })}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addRow}
        className="text-sm font-semibold text-brand hover:underline"
      >
        + Add another branch
      </button>

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
