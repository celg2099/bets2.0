import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfHotListService {
  descargar(htmlString: string): void {
    const now = new Date();
    const fecha = now
      .toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
      .replace(/\//g, '-');
    const hora = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const seg = now.getSeconds().toString().padStart(2, '0');
    const filename = `reporte_${fecha}_${hora}${min}${seg}.pdf`;

    import('html2pdf.js').then((mod) => {
      const html2pdf = mod.default ?? mod;
      (html2pdf as any)()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(htmlString)
        .save();
    });
  }
}
