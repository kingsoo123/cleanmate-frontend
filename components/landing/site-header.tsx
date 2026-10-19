import Link from "next/link";
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
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand/30 bg-brand-light text-xs font-bold text-brand"
            aria-hidden
          >
            CM
          </span>
          CleanMate
        </Link>

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
