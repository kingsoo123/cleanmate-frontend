import { apiFetch } from "@/lib/api/http";

export type BusinessBranchRow = {
  id: string;
  name: string;
  address: string | null;
  createdAt: string;
};

export type BranchManagerRow = {
  id: string;
  fullName: string;
  phone: string;
  branchId: string;
  branchName: string;
  createdAt: string;
};

export function fetchBusinessBranches() {
  return apiFetch<BusinessBranchRow[]>("/business/branches");
}

export function fetchBranchManagers() {
  return apiFetch<BranchManagerRow[]>("/business/branch-managers");
}

export function createBranchManager(payload: {
  fullName: string;
  phone: string;
  pin: string;
  branchId: string;
}) {
  return apiFetch<BranchManagerRow>("/business/branch-managers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBranchManager(
  id: string,
  payload: {
    fullName?: string;
    branchId?: string;
    pin?: string;
  },
) {
  return apiFetch<BranchManagerRow>(`/business/branch-managers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function removeBranchManager(id: string) {
  return apiFetch<void>(`/business/branch-managers/${id}`, {
    method: "DELETE",
  });
}