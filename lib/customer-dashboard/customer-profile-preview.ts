export type CustomerSavedAddress = {
  id: string;
  label: string;
  line: string;
};

export type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredLaundry: string;
  memberSince: string;
};

export const previewCustomerProfile: CustomerProfile = {
  id: "c1",
  name: "Ada Okonkwo",
  phone: "+234 803 222 3344",
  email: "ada.o@email.com",
  preferredLaundry: "Sunbright Laundry & Dry Clean",
  memberSince: "August 2026",
};

export const previewCustomerProfileAddresses: CustomerSavedAddress[] = [
  { id: "a1", label: "Home", line: "12 Admiralty Way, Lekki Phase 1" },
  { id: "a2", label: "Office", line: "Eko Atlantic, Tower 4" },
];
