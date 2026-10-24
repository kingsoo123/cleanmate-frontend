import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { HeaderAccountMenus } from "@/components/landing/header-account-menus";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Services" },
  { href: "#for-customers", label: "Why Choose Us" },
  { href: "#for-customers", label: "Reviews" },
  { href: "#features", label: "FAQ's" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-surface px-4 sm:px-8">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4">
        <BrandLogo href="/" className="shrink-0 text-lg" />

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-muted xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <HeaderAccountMenus />
      </div>
    </header>
  );
}
