
import { jsPDF } from 'jspdf';
import { Project } from '../types';

/**
 * Convertit le Markdown basique en HTML propre pour jsPDF.
 */
const mdToHtml = (md: string) => {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Titres
    .replace(/^## (.*$)/gim, '<h2 style="color:#0ea5e9; font-size:18pt; margin-top:25px; margin-bottom:10px; border-bottom:1px solid #e2e8f0; padding-bottom:5px; font-family:Helvetica; font-weight:bold; text-transform:uppercase;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color:#1e293b; font-size:13pt; margin-top:15px; margin-bottom:8px; font-family:Helvetica; font-weight:bold;">$1</h3>')
    // Gras (important : support des doubles astérisques)
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:bold; color:#0f172a;">$1</strong>')
    // Listes à puces
    .replace(/^\- (.*$)/gim, '<li style="margin-bottom:5px; font-size:11pt; color:#334155; list-style-type:disc;">$1</li>')
    // Paragraphes (lignes qui ne commencent pas par un tag HTML)
    .split('\n').map(line => {
      if (!line.trim()) return '<div style="height:10px"></div>';
      if (line.startsWith('<')) return line;
      return `<p style="margin-bottom:10px; font-size:11pt; line-height:1.5; color:#334155; font-family:Helvetica;">${line}</p>`;
    }).join('');

  // Encapsuler les <li> dans des <ul> si nécessaire
  html = html.replace(/(<li.*<\/li>)/g, '<ul style="margin-bottom:15px; padding-left:20px;">$1</ul>');
  
  return html;
};

export const exportToProfessionalPDF = async (
  content: string, 
  docTypeLabel: string, 
  project: Project
) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Création du container temporaire
  const container = document.createElement('div');
  container.style.width = '180mm'; // Largeur A4 moins marges
  container.style.padding = '10mm';
  container.style.backgroundColor = 'white';
  container.style.fontFamily = 'Helvetica, Arial, sans-serif';
  container.style.color = '#0f172a';

  const bodyHtml = mdToHtml(content);
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  container.innerHTML = `
    <div style="border-bottom: 4pt solid #0ea5e9; padding-bottom: 15px; margin-bottom: 30px;">
      <h1 style="color: #0ea5e9; font-size: 26pt; margin: 0; font-family: Helvetica; font-weight: bold; text-transform: uppercase;">${docTypeLabel}</h1>
      <div style="margin-top: 10px; display: flex; justify-content: space-between;">
        <div style="font-size: 10pt; color: #64748b; font-weight: bold;">PROJET : ${project.name.toUpperCase()}</div>
        <div style="font-size: 9pt; color: #94a3b8;">ÉMISSION : ${currentDate}</div>
      </div>
    </div>
    
    <div style="background: white;">
      ${bodyHtml}
    </div>

    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #94a3b8; text-align: center;">
      DOCUMENT CONFIDENTIEL — CONSEIL TRIGENYS GROUP — PROPRIÉTÉ EXCLUSIVE
    </div>
  `;

  // On doit ajouter le container au body temporairement pour jsPDF.html()
  document.body.appendChild(container);

  try {
    await doc.html(container, {
      x: margin,
      y: margin,
      width: contentWidth,
      windowWidth: 750, // Largeur virtuelle pour le rendu CSS
      autoPaging: 'text', // EVITE DE COUPER LES LIGNES
      margin: [margin, margin, margin, margin],
      callback: function (doc) {
        doc.save(`${project.name.replace(/\s+/g, '_')}_${docTypeLabel}.pdf`);
      }
    });
  } catch (error) {
    console.error("Erreur d'export PDF:", error);
  } finally {
    document.body.removeChild(container);
  }
};
