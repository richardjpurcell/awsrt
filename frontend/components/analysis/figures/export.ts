// frontend/components/analysis/figures/export.ts
export function svgToString(svgEl: SVGSVGElement): string {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // Ensure xmlns is present so SVG exports correctly.
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  if (!clone.getAttribute("xmlns:xlink")) {
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  }

  // Make sure viewBox exists (we rely on it for scaling).
  if (!clone.getAttribute("viewBox")) {
    const w = svgEl.getAttribute("width") || "800";
    const h = svgEl.getAttribute("height") || "500";
    clone.setAttribute("viewBox", `0 0 ${w} ${h}`);
  }

  return new XMLSerializer().serializeToString(clone);
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadSVG(svgEl: SVGSVGElement, filename: string) {
  const text = svgToString(svgEl);
  downloadText(filename, text, "image/svg+xml;charset=utf-8");
}

// Renders SVG into a canvas and downloads as PNG.
// scale=2 gives “retina-ish” exports without being huge.
export async function downloadPNGFromSVG(svgEl: SVGSVGElement, filename: string, scale = 2) {
  const svgText = svgToString(svgEl);
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  // Avoid tainting the canvas; SVG is in-memory blob.
  img.crossOrigin = "anonymous";

  const vb = svgEl.viewBox?.baseVal;
  const w = vb?.width || Number(svgEl.getAttribute("width")) || 900;
  const h = vb?.height || Number(svgEl.getAttribute("height")) || 520;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(w * scale));
  canvas.height = Math.max(1, Math.floor(h * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error("Canvas 2D context unavailable");
  }

  // White background for paper exports.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(url);

  const pngUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = pngUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
