const PIN_PATTERN = /^\d{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

/** @deprecated Use isValidPin */
export const isValidCustomerPin = isValidPin;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/** Returns an error message, or null when value is a valid phone or email. */
export function validatePhoneOrEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Phone number or email is required.";
  }
  if (trimmed.includes("@")) {
    if (!isValidEmail(trimmed)) {
      return "Enter a valid email address.";
    }
    return null;
  }
  if (!validatePhone(trimmed)) {
    return "Enter a valid phone number.";
  }
  return null;
}
