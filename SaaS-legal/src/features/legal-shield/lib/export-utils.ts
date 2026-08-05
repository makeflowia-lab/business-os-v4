export interface ExportData {
  branding: any;
  analysis: any;
  timeline: {
    category: string;
    items: string[];
  }[];
}

export const exportToCSV = (data: ExportData) => {
  const headers = ['Fase', 'Acción'];
  const rows = data.timeline.flatMap(t => 
    t.items.map(item => [t.category, item])
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `roadmap-cumplimiento-${data.branding.name.toLowerCase().replace(/\s+/g, '-')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printContract = (content: string, title: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
          
          body { 
            font-family: 'Times New Roman', Times, serif; 
            line-height: 1.5; 
            color: #000; 
            padding: 2cm;
            margin: 0;
            background: #fff;
          }
          .contract-title {
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2rem;
            font-size: 16pt;
            border-bottom: 2px solid #000;
            padding-bottom: 1rem;
          }
          h2 { 
            font-size: 14pt; 
            margin-top: 2rem; 
            margin-bottom: 1rem;
            page-break-after: avoid;
            text-transform: uppercase;
            border-bottom: 1px solid #eee;
          }
          p { 
            margin-bottom: 1rem; 
            text-align: justify;
            font-size: 11pt;
            orphans: 3;
            widows: 3;
          }
          hr { border: 0; border-top: 1px dashed #ccc; margin: 3rem 0; }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 4rem;
            page-break-inside: avoid;
          }
          .signature-box {
            width: 45%;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-bottom: 0.5rem;
          }
          @page { 
            margin: 1cm;
            size: auto;
          }
          @media print {
            body { padding: 0.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="contract-title">${title}</div>
        ${content.split('\n').map(line => {
          if (line.startsWith('###')) return `<h2>${line.replace('###', '').trim()}</h2>`;
          if (line.startsWith('==')) return `<hr/>`;
          if (line.trim().length === 0) return '';
          return `<p>${line}</p>`;
        }).join('')}
        <script>
          window.onload = () => {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const downloadAsMD = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  saveBlob(blob, `${filename}.md`);
};

export const downloadAsTxt = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  saveBlob(blob, `${filename}.txt`);
};

export const downloadAsDocx = (content: string, filename: string) => {
  // Simplified DOCX export using HTML wrapper trick
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export DOCX</title></head><body>`;
  const footer = "</body></html>";
  
  const sourceHTML = header + content.split('\n').map(line => `<p>${line}</p>`).join('') + footer;
  
  const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
  const fileLink = document.createElement("a");
  document.body.appendChild(fileLink);
  fileLink.href = source;
  fileLink.download = `${filename}.doc`;
  fileLink.click();
  document.body.removeChild(fileLink);
};

const saveBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
