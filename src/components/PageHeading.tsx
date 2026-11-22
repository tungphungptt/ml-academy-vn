import type { ReactNode } from "react";
export default function PageHeading({ title, description, actions }: { eyebrow: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return <header className="page-heading"><div><h1>{title.normalize("NFC")}</h1>{description && <p className="page-description">{description}</p>}</div>{actions && <div className="heading-actions">{actions}</div>}</header>;
}
export function SectionHeading({ title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="section-heading"><div><h2>{title.normalize("NFC")}</h2></div>{children}</div>;
}
