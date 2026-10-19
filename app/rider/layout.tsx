import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Rider jobs",
    template: "%s · CleanMate Rider",
  },
};

export default function RiderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary-surface/40 px-4 py-6 sm:px-5">
      {children}
    </div>
  );
}
