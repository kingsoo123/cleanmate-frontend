import type {
  CustomerProfile,
  CustomerSavedAddress,
} from "@/lib/customer-dashboard/customer-profile-preview";

/** Server placeholder; client loads via JWT. */
export async function getCustomerProfileData(): Promise<{
  profile: CustomerProfile;
  addresses: CustomerSavedAddress[];
}> {
  return {
    profile: {
      id: "",
      name: "",
      phone: "",
      email: "",
      preferredLaundry: "",
      memberSince: "",
    },
    addresses: [],
  };
}
