import Link from "next/link";
import type { ReactNode } from "react";

const BRAND_NAME = "Washuply";
const BRAND_MONOGRAM = "WU";

type BrandLogoProps = {
  /** When set, wraps the logo in a link (e.g. home). */
  href?: string;
  className?: string;
  monogramClassName?: string;
  /** sm: header; md: auth shell */
  size?: "sm" | "md";
};

export function BrandLogo({
  href,
  className = "",
  monogramClassName = "",
  size = "sm",
}: BrandLogoProps) {
  const monogramSize =
    size === "md"
      ? "h-9 w-9 text-xs"
      : "h-8 w-8 text-xs";

  const content: ReactNode = (
    <>
      <span
        className={`flex shrink-0 items-center justify-center rounded-full border-2 border-brand/30 bg-brand-light font-bold text-brand ${monogramSize} ${monogramClassName}`}
        aria-hidden
      >
        {BRAND_MONOGRAM}
      </span>
      {BRAND_NAME}
    </>
  );

  const classes = `inline-flex items-center gap-2 font-semibold tracking-tight text-foreground ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}

export { BRAND_NAME, BRAND_MONOGRAM };
