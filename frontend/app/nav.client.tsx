"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function NavLink({
  href,
  label,
  active,
  section,
}: {
  href: string;
  label: string;
  active?: boolean;
  section: "physical" | "epistemic" | "operational" | "analysis";
}) {
  return (
    <Link href={href} className={cls("nav-link", active && `nav-link--active-${section}`)}>
      {label}
    </Link>
  );
}

export default function NavClient() {
  const pathname = usePathname() || "";

  const onPhysicalDesigner = pathname.startsWith("/physical/designer");
  const onPhysicalVisualizer = pathname.startsWith("/physical/visualizer");
  const onEpistemicDesigner = pathname.startsWith("/epistemic/designer");
  const onEpistemicVisualizer = pathname.startsWith("/epistemic/visualizer");
  const onOperationalDesigner = pathname.startsWith("/operational/designer");
  const onOperationalVisualizer = pathname.startsWith("/operational/visualizer");
  const onAnalysisGraphic = pathname.startsWith("/analysis/graphic");
  const onAnalysisRaw = pathname.startsWith("/analysis/raw");
  const onAnalysisBatch = pathname.startsWith("/analysis/batch");

  return (
    <div className="nav">
      <NavLink href="/physical/designer" label="Physical · Designer" section="physical" active={onPhysicalDesigner} />
      <NavLink href="/physical/visualizer" label="Physical · Visualizer" section="physical" active={onPhysicalVisualizer} />


      <NavLink href="/epistemic/designer" label="Belief Lab · Designer" section="epistemic" active={onEpistemicDesigner} />
      <NavLink href="/epistemic/visualizer" label="Belief Lab · Visualizer" section="epistemic" active={onEpistemicVisualizer} />

      <NavLink href="/operational/designer" label="Operational · Designer" section="operational" active={onOperationalDesigner} />
      <NavLink href="/operational/visualizer" label="Operational · Visualizer" section="operational" active={onOperationalVisualizer} />

      {/* Analysis nav order: Batch → Graphic → Raw */}
      <NavLink href="/analysis/batch" label="Analysis · Study Designer" section="analysis" active={onAnalysisBatch} />
      <NavLink href="/analysis/graphic" label="Analysis · Graphic" section="analysis" active={onAnalysisGraphic} />
      <NavLink href="/analysis/raw" label="Analysis · Raw" section="analysis" active={onAnalysisRaw} />

    </div>
  );
}
