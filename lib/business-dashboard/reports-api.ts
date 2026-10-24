import { apiFetch } from "@/lib/api/http";
import type {
  ReportPeriod,
  ReportsSnapshot,
} from "@/lib/business-dashboard/reports-types";

export type BusinessReportsBundle = Record<ReportPeriod, ReportsSnapshot>;

export function fetchBusinessReports() {
  return apiFetch<BusinessReportsBundle>("/business/reports");
}
