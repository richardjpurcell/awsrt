import Image from "next/image";
import Link from "next/link";
import schematic from "../images/tool_schematic.png";

export default function HomePage() {
  return (
    <div className="card">
      <h2>AWSRT</h2>

      <div className="small" style={{ marginTop: 4 }}>
        <b>Adaptive Wildfire Sensing Research Tool</b>
      </div>

      <div className="small" style={{ marginTop: 8, maxWidth: 860 }}>
        A research instrument for studying adaptive sensing, belief maintenance,
        information impairment, and usefulness under wildfire-like dynamic fields.
        Data are stored locally under <code>data/</code>.
      </div>

      <div className="row" style={{ marginTop: 14, flexWrap: "wrap", gap: 10 }}>
        <Link href="/physical/designer" className="small">
          Physical Surface
        </Link>
        <Link href="/epistemic/designer" className="small">
          Epistemic Surface
        </Link>
        <Link href="/operational/designer" className="small">
          Operational Surface
        </Link>
        <Link href="/analysis/batch" className="small">
          Analysis Surface · Batch
        </Link>
        <Link href="/analysis/graphic" className="small">
          Analysis Surface · Graphic
        </Link>
        <Link href="/analysis/raw" className="small">
          Analysis Surface · Raw
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
            alt="AWSRT research-tool schematic"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            sizes="(max-width: 1000px) 100vw, 980px"
            priority
          />
        </div>
      </div>

      <div className="small" style={{ textAlign: "center", marginTop: 10, opacity: 0.75 }}>
        Physical Surface → Epistemic Surface → Operational Surface → Analysis Surface
      </div>
    </div>
  );
}
