import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function captureElement(element: HTMLElement) {
  return html2canvas(element, {
    scale: 2,
    backgroundColor: "#0a0a0a",
    useCORS: true,
  });
}

export async function exportToPng(element: HTMLElement): Promise<Uint8Array> {
  const canvas = await captureElement(element);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(new Uint8Array());
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
    }, "image/png");
  });
}

export async function exportToPdf(element: HTMLElement): Promise<Uint8Array> {
  const canvas = await captureElement(element);
  const imgData = canvas.toDataURL("image/png");

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const pdf = new jsPDF({
    orientation: imgWidth > imgHeight ? "landscape" : "portrait",
    unit: "px",
    format: [imgWidth / 2, imgHeight / 2],
  });

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth / 2, imgHeight / 2);
  return new Uint8Array(pdf.output("arraybuffer"));
}

// Web fallback: download via blob link
export function downloadBytes(data: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
