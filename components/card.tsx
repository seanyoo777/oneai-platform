export function Card({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-oneai-surface p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}
