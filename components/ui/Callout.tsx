interface CalloutProps {
  label: string;
  /** "left" = dot then line then label reading rightward; "right" = label then line then dot. */
  direction?: "left" | "right";
  className?: string;
}

export default function Callout({ label, direction = "left", className = "" }: CalloutProps) {
  const dot = (
    <span className="relative block h-[5px] w-[5px] shrink-0 rounded-full bg-accent">
      <span className="absolute inset-0 -m-1 rounded-full bg-accent/25 blur-[2px]" />
    </span>
  );
  const line = <span className="h-px w-10 shrink-0 bg-accent/40" />;
  const text = (
    <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-text-secondary/80 whitespace-nowrap">
      {label}
    </span>
  );

  return (
    <div className={`pointer-events-none flex items-center gap-2.5 ${className}`}>
      {direction === "left" ? (
        <>
          {dot}
          {line}
          {text}
        </>
      ) : (
        <>
          {text}
          {line}
          {dot}
        </>
      )}
    </div>
  );
}
