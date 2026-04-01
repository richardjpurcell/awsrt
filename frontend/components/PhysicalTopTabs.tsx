"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 10,
    textDecoration: "none",
    display: "inline-block",
    background: active ? "var(--awsrt-physical)" : "transparent"
    color: active ? "#111827" : "inherit",
    transition: "background-color 120ms ease, color 120ms ease",
  };
}

export function PhysicalTopTabs() {
  const pathname = usePathname() || "";

  const onDesigner = pathname.startsWith("/physical/designer");
  const onVisualizer = pathname.startsWith("/physical/visualizer");

  return (
    <div className="row" style={{ gap: 8, alignItems: "center" }}>
      <Link href="/physical/designer" style={tabStyle(onDesigner)}>
        Physical Designer
      </Link>
      <Link href="/physical/visualizer" style={tabStyle(onVisualizer)}>
        Physical Visualizer
      </Link>
    </div>
  );
}
