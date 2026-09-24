"use client";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  href?: string;
}

export default function Button({ children, variant = "primary", onClick, href }: ButtonProps) {
  const base =
    "group inline-flex h-[46px] items-center gap-2 rounded-md px-5 text-[13px] font-medium tracking-wide transition-colors duration-300";

  const styles =
    variant === "primary"
      ? "bg-[#EDF1F2] text-bg-primary hover:bg-accent"
      : "border border-white/15 text-text-primary hover:border-accent/60 hover:text-accent";

  const content = (
    <>
      <span>{children}</span>
      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
        →
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${base} ${styles}`}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {content}
    </button>
  );
}
