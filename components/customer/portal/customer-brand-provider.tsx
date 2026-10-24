"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { initialsFromPersonName } from "@/lib/auth/business-brand";
import { getAuthUser, subscribeAuthSession } from "@/lib/auth/session";

export type CustomerBrand = {
  displayName: string;
  initials: string;
  isFromSession: boolean;
};

const defaultCustomerBrand: CustomerBrand = {
  displayName: "Customer",
  initials: "C",
  isFromSession: false,
};

let cachedBrandSnapshot: CustomerBrand = defaultCustomerBrand;
let cachedBrandKey = "";

function readCustomerBrand(): CustomerBrand {
  const user = getAuthUser();
  if (!user || user.role !== "customer") {
    return defaultCustomerBrand;
  }
  const displayName = user.fullName.trim() || "Customer";
  return {
    displayName,
    initials: initialsFromPersonName(displayName, "C"),
    isFromSession: true,
  };
}

function brandSnapshotKey(brand: CustomerBrand): string {
  return `${brand.displayName}\0${brand.initials}\0${brand.isFromSession}`;
}

function getCustomerBrandSnapshot(): CustomerBrand {
  const next = readCustomerBrand();
  const key = brandSnapshotKey(next);
  if (key === cachedBrandKey) {
    return cachedBrandSnapshot;
  }
  cachedBrandKey = key;
  cachedBrandSnapshot = next;
  return cachedBrandSnapshot;
}

function useCustomerBrandSnapshot(): CustomerBrand {
  return useSyncExternalStore(
    subscribeAuthSession,
    getCustomerBrandSnapshot,
    () => defaultCustomerBrand,
  );
}

const CustomerBrandContext = createContext<CustomerBrand>(defaultCustomerBrand);

export function CustomerBrandProvider({ children }: { children: ReactNode }) {
  const brand = useCustomerBrandSnapshot();
  return (
    <CustomerBrandContext.Provider value={brand}>
      {children}
    </CustomerBrandContext.Provider>
  );
}

export function useCustomerBrand(): CustomerBrand {
  return useContext(CustomerBrandContext);
}
