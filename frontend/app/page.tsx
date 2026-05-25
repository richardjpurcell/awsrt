import Link from "next/link";

function SurfaceCard({
  title,
  body,
  detail,
  className,
}: {
  title: string;
  body: string;
  detail: string;
  className: string;
}) {
  return (
    <div className={`surfaceCard ${className}`}>
      <div className="surfaceTitle">{title}</div>
      <div className="surfaceBody">{body}</div>
      <div className="surfaceDetail">{detail}</div>
    </div>
  );
}

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
          Analysis Surface
        </Link>
        <Link href="/analysis/graphic" className="small">
          Analysis Visualizer
        </Link>
        <Link href="/analysis/raw" className="small">
          Analysis Raw
        </Link>
      </div>

      <div className="surfaceDiagram" aria-label="AWSRT four-surface orientation diagram">
        <div className="surfaceLoop">
          <SurfaceCard
            title="Physical Surface"
            body="Structured wildfire-like fields"
            detail="ignition · spread · terrain-like structure · directional bias · transformed fire artifacts"
            className="surfacePhysical"
          />

          <div className="surfaceArrow">observations ↓</div>

          <SurfaceCard
            title="Epistemic Surface"
            body="Belief state and uncertainty"
            detail="observations · entropy · belief updates · uncertainty-aware representation"
            className="surfaceEpistemic"
          />

          <div className="surfaceArrow">belief / usefulness signals ↓</div>

          <SurfaceCard
            title="Operational Surface"
            body="Adaptive sensing behavior"
            detail="sensor placement · policy family · impairment response · usefulness states"
            className="surfaceOperational"
          />

          <div className="surfaceFeedback">↺ actions and deployment geometry</div>
        </div>

        <div className="surfaceAnalysisWrap">
          <div className="surfaceAnalysisArrows">
            <span>field artifacts</span>
            <span>belief traces</span>
            <span>policy / state traces</span>
          </div>

          <SurfaceCard
            title="Analysis Surface"
            body="Metrics and interpretation"
            detail="TTFD · delivery · belief quality · usefulness-state diagnostics"
            className="surfaceAnalysis"
          />
        </div>
      </div>

      <div className="small" style={{ textAlign: "center", marginTop: 10, opacity: 0.75 }}>
        AWSRT separates environmental structure, belief maintenance, sensing behavior, and analysis so timing,
        information delivery, belief quality, and usefulness can be inspected separately.
      </div>
    </div>
  );
}