export type OnboardingRole = "business" | "customer" | "rider";

export function parseOnboardingRole(value: string | undefined): OnboardingRole {
  if (value === "business") return "business";
  if (value === "rider" || value === "driver") return "rider";
  return "customer";
}

export const onboardingCopy = {
  business: {
    registerTitle: "Create your business account",
    registerSubtitle:
      "Register with business details, phone, email, and a 6-digit PIN for secure sign-in.",
    loginTitle: "Business sign in",
    loginSubtitle:
      "Enter your phone number or business email and your 6-digit PIN.",
  },
  customer: {
    registerTitle: "Create your customer account",
    registerSubtitle:
      "Sign up with your name, phone number, and a 6-digit PIN to request pickups and track orders.",
    loginTitle: "Customer sign in",
    loginSubtitle:
      "Enter your phone number or email and the 6-digit PIN you chose when you registered.",
  },
  rider: {
    registerTitle: "Rider account",
    registerSubtitle: "Riders are onboarded by the laundry—they do not self-register.",
    loginTitle: "Dispatch rider sign in",
    loginSubtitle:
      "Use the phone number and 6-digit PIN your laundry set when they onboarded you.",
  },
} as const satisfies Record<
  OnboardingRole,
  {
    registerTitle: string;
    registerSubtitle: string;
    loginTitle: string;
    loginSubtitle: string;
  }
>;

export const loginDestinations: Record<OnboardingRole, string> = {
  business: "/business/dashboard",
  customer: "/customer/dashboard",
  rider: "/rider/dashboard",
};
