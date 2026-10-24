import { apiFetch } from "@/lib/api/http";
import type { BusinessDashboardData } from "@/lib/business-dashboard/types";

export function fetchBusinessDashboard() {
  return apiFetch<BusinessDashboardData>("/business/dashboard");
}
