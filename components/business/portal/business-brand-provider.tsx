"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  businessBrandFromUser,
  defaultBusinessBrand,
  type BusinessBrand,
} from "@/lib/auth/business-brand";
import { getAuthUser, subscribeAuthSession } from "@/lib/auth/session";

const BusinessBrandContext = createContext<BusinessBrand>(defaultBusinessBrand);

let cachedBrandSnapshot: BusinessBrand = defaultBusinessBrand;
let cachedBrandKey = "";

function brandSnapshotKey(brand: BusinessBrand): string {
  return [
    brand.businessName,
    brand.ownerName,
    brand.businessInitials,
    brand.ownerInitials,
    brand.isFromSession,
  ].join("\0");
}

/** Stable reference for useSyncExternalStore when session data is unchanged. */
function readBrandFromSession(): BusinessBrand {
  const next = businessBrandFromUser(getAuthUser());
  const key = brandSnapshotKey(next);
  if (key === cachedBrandKey) {
    return cachedBrandSnapshot;
  }
  cachedBrandKey = key;
  cachedBrandSnapshot = next;
  return cachedBrandSnapshot;
}

function useSessionBusinessBrand(): BusinessBrand {
  return useSyncExternalStore(
    subscribeAuthSession,
    readBrandFromSession,
    () => defaultBusinessBrand,
  );
}

export function BusinessBrandProvider({ children }: { children: ReactNode }) {
  const brand = useSessionBusinessBrand();

  return (
    <BusinessBrandContext.Provider value={brand}>
      {children}
    </BusinessBrandContext.Provider>
  );
}

export function useBusinessBrand(): BusinessBrand {
  return useContext(BusinessBrandContext);
}
