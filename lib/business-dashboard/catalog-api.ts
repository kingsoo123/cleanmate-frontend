import { apiFetch } from "@/lib/api/http";
import type { CatalogService } from "@/lib/business-dashboard/new-order-types";

export function fetchCatalogServices() {
  return apiFetch<CatalogService[]>("/business/catalog/services");
}

export function createCatalogService(payload: {
  category: string;
  name: string;
  unitPriceNgn: number;
}) {
  return apiFetch<CatalogService>("/business/catalog/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCatalogService(
  id: string,
  payload: {
    category?: string;
    name?: string;
    unitPriceNgn?: number;
  },
) {
  return apiFetch<CatalogService>(`/business/catalog/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCatalogService(id: string) {
  return apiFetch<void>(`/business/catalog/services/${id}`, {
    method: "DELETE",
  });
}