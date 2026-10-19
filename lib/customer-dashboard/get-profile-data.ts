import {
  previewCustomerProfile,
  previewCustomerProfileAddresses,
} from "@/lib/customer-dashboard/customer-profile-preview";
import type {
  CustomerProfile,
  CustomerSavedAddress,
} from "@/lib/customer-dashboard/customer-profile-preview";

/** Replace with API/DB when customer auth is connected. */
export async function getCustomerProfileData(): Promise<{
  profile: CustomerProfile;
  addresses: CustomerSavedAddress[];
}> {
  return {
    profile: previewCustomerProfile,
    addresses: previewCustomerProfileAddresses,
  };
}
