import Image from "next/image";
import Link from "next/link";
import schematic from "../images/tool_schematic.png";

export default function HomePage() {
  return (
    <div className="card">
      <h2>AWSRT (v0)</h2>

      <div className="small">
        Use the nav bar to create runs and visualize them. Data are stored locally under <code>data/</code>.
      </div>

      <div className="row" style={{ marginTop: 10, flexWrap: "wrap", gap: 10 }}>
        <Link href="/physical/designer" className="small">
          Start: Physical Designer
        </Link>
        <Link href="/epistemic/designer" className="small">
          Then: Epistemic Designer
        </Link>
        <Link href="/operational/designer" className="small">
          Then: Operational Designer
        </Link>
        <Link href="/analysis/batch" className="small">
          Finally: Analysis · Batch
        </Link>
        <Link href="/analysis/graphic" className="small">
          Then: Analysis · Graphic
        </Link>
        <Link href="/analysis/raw" className="small">
          Then: Analysis · Raw
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            maxHeight: "60vh",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.6)",
            padding: 10,
          }}
        >
          <Image
            src={schematic}
            alt="AWSRT tool schematic"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            sizes="(max-width: 1000px) 100vw, 980px"
            priority
          />
        </div>
      </div>

      <div className="small" style={{ textAlign: "center", marginTop: 10, opacity: 0.75 }}>
        Physical → Epistemic → Operational → Analysis
      </div>
    </div>
  );
}
