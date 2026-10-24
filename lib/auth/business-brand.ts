import type { AuthUserPayload } from "@/lib/auth/types";

export type BusinessBrand = {
  businessName: string;
  ownerName: string;
  businessInitials: string;
  ownerInitials: string;
  isFromSession: boolean;
};

export const defaultBusinessBrand: BusinessBrand = {
  businessName: "Your laundry",
  ownerName: "",
  businessInitials: "CM",
  ownerInitials: "—",
  isFromSession: false,
};

export function initialsFromPersonName(name: string, fallback = "—"): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function initialsFromBusinessName(name: string, fallback = "CM"): string {
  const cleaned = name.trim().split(/\s+/).filter(Boolean);
  if (!cleaned.length) return fallback;
  if (cleaned.length >= 2) {
    return (cleaned[0][0] + cleaned[1][0]).toUpperCase();
  }
  return cleaned[0].slice(0, 2).toUpperCase();
}

export function businessBrandFromUser(
  user: AuthUserPayload | null,
): BusinessBrand {
  if (!user || user.role !== "business") {
    return defaultBusinessBrand;
  }

  const businessName = user.businessName?.trim() || defaultBusinessBrand.businessName;
  const ownerName = user.fullName.trim();

  return {
    businessName,
    ownerName,
    businessInitials: initialsFromBusinessName(businessName),
    ownerInitials: initialsFromPersonName(ownerName, "—"),
    isFromSession: true,
  };
}
