// Renders a DOM element into an A4 PDF, sliced across as many pages as it needs.
export async function downloadElementAsPdf(element, filename) {
  const [{ default: html2canvas }, jspdf] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const { jsPDF } = jspdf;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;
  const image = canvas.toDataURL("image/jpeg", 0.94);

  pdf.addImage(image, "JPEG", 0, 0, pageWidth, imageHeight);

  let offset = 0;
  let remaining = imageHeight - pageHeight;
  while (remaining > 1) {
    offset -= pageHeight;
    pdf.addPage();
    pdf.addImage(image, "JPEG", 0, offset, pageWidth, imageHeight);
    remaining -= pageHeight;
  }

  pdf.save(filename);
}