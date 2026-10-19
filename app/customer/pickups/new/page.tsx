import { RequestPickupForm } from "@/components/customer/pickups/request-pickup-form";
import { previewCustomerAddresses } from "@/lib/customer-dashboard/customer-addresses";

export default function RequestPickupPage() {
  return <RequestPickupForm addresses={previewCustomerAddresses} />;
}
