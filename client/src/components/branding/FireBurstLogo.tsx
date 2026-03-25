import { cn } from "@/lib/cn";

const LOGO_SRC = "/branding/fireburst-logo.jpeg";

type Variant = "login" | "sidebar";

const variantClass: Record<Variant, string> = {
  login:
    "h-auto w-full max-w-[272px] object-contain drop-shadow-[0_0_40px_rgba(255,46,0,0.22)]",
  sidebar: "h-9 w-auto max-w-[160px] object-contain object-left opacity-[0.98]",
};

/**
 * Logo oficial FireBurst IT (assets en `client/public/branding/`).
 */
export function FireBurstLogo({
  variant = "login",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <img
      src={LOGO_SRC}
      alt="FireBurst IT"
      className={cn(variantClass[variant], className)}
      decoding="async"
      loading="eager"
    />
  );
}
