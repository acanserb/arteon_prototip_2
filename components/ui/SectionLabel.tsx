export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-[0.28em] text-accent font-medium">
      {children}
    </span>
  );
}
