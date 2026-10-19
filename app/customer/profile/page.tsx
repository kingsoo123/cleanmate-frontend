import { CustomerProfileView } from "@/components/customer/profile/customer-profile-view";
import { getCustomerProfileData } from "@/lib/customer-dashboard/get-profile-data";

export default async function CustomerProfilePage() {
  const { profile, addresses } = await getCustomerProfileData();

  return (
    <CustomerProfileView
      initialProfile={profile}
      initialAddresses={addresses}
    />
  );
}
