import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const logoPrimarySvg = readFileSync(join(__dirname, 'brand_assets', 'logo-primary.svg'), 'utf-8');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildPdfHtml(nombre, travelPreview) {
  const name = esc(nombre);
  const preview = esc(travelPreview).replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&display=swap');

  @page { size: A4; margin: 0; }

  :root {
    --teal: #036280;
    --cream: #ecede7;
    --cyan: #53BED0;
    --slate: #405f7d;
    --body: #2d3748;
    --muted: #718096;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Montserrat', sans-serif;
    color: var(--body);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    padding: 44px 56px 40px;
    position: relative;
  }

  .page-process {
    page-break-inside: avoid;
    padding-top: 20px;
  }

  .bar {
    position: absolute; top: 0; left: 0; right: 0; height: 5px;
    background: linear-gradient(90deg, var(--teal), var(--cyan));
  }

  .corner {
    position: absolute; bottom: 0; right: 0; width: 240px; height: 240px;
    background: radial-gradient(circle at 100% 100%, rgba(83,190,208,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .logo { text-align: center; margin-bottom: 20px; padding-top: 12px; }
  .logo svg { width: 190px; height: auto; }

  .divider { width: 52px; height: 2px; background: var(--cyan); margin: 18px auto 26px; }

  .tagline {
    font-family: 'Great Vibes', cursive;
    font-size: 32px;
    color: var(--teal);
    text-align: center;
    margin-bottom: 34px;
  }

  .greeting {
    font-size: 19px;
    font-weight: 600;
    color: var(--teal);
    margin-bottom: 8px;
  }

  .intro {
    font-size: 12.5px;
    line-height: 1.75;
    color: #4a4a4a;
    margin-bottom: 26px;
    max-width: 460px;
  }

  .preview-box {
    background: var(--cream);
    border-left: 3px solid var(--cyan);
    border-radius: 0 10px 10px 0;
    padding: 26px 30px;
  }

  .preview-label {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--teal);
    margin-bottom: 12px;
  }

  .preview-text {
    font-size: 11.5px;
    line-height: 1.85;
    color: var(--body);
  }

  .section-heading {
    font-family: 'Great Vibes', cursive;
    font-size: 36px;
    color: var(--teal);
    text-align: center;
    margin-bottom: 44px;
    padding-top: 14px;
  }

  .steps {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 0;
    margin-bottom: 52px;
  }

  .step { text-align: center; width: 150px; }

  .step-icon {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: var(--teal);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    box-shadow: 0 4px 14px rgba(3,98,128,0.22);
  }

  .step-icon svg { stroke: white; }

  .step-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--teal);
    margin-bottom: 5px;
  }

  .step-desc {
    font-size: 10.5px;
    color: var(--muted);
    line-height: 1.55;
  }

  .arrow {
    display: flex;
    align-items: center;
    padding-top: 12px;
    margin: 0 6px;
  }

  .arrow svg { width: 36px; opacity: 0.35; }

  .contact-card {
    background: var(--cream);
    border-radius: 14px;
    padding: 34px;
    text-align: center;
    margin-bottom: 36px;
  }

  .contact-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--teal);
    margin-bottom: 5px;
  }

  .contact-sub {
    font-size: 11.5px;
    color: var(--muted);
    margin-bottom: 18px;
  }

  .contact-row {
    font-size: 12.5px;
    color: var(--body);
    margin-bottom: 5px;
  }

  .contact-row strong { color: var(--teal); font-weight: 600; }
  .contact-row a { color: var(--teal); text-decoration: none; }

  .pdf-footer {
    text-align: center;
    padding-top: 18px;
    border-top: 1px solid #e2e8f0;
    margin-top: auto;
  }

  .pdf-footer svg { width: 100px; height: auto; opacity: 0.4; }
  .pdf-footer p { font-size: 8.5px; color: #a0aec0; margin-top: 5px; letter-spacing: 1px; }
</style>
</head>
<body>

<!-- PAGE 1: Cover + Travel Preview -->
<div class="page">
  <div class="bar"></div>
  <div class="corner"></div>

  <div class="logo">${logoPrimarySvg}</div>
  <div class="divider"></div>

  <p class="tagline">Una aventura diseñada para ti</p>

  <p class="greeting">Hola, ${name}.</p>
  <p class="intro">
    Nos encanta lo que tienes en mente. Hemos preparado una vista previa
    personalizada de tu próxima aventura — basada en tus preferencias y
    sueños de viaje. Esto es solo el comienzo.
  </p>

  <div class="preview-box">
    <p class="preview-label">Tu Vista Previa de Viaje</p>
    <p class="preview-text">${preview}</p>
  </div>
</div>

<!-- PAGE 2: Process + Contact -->
<div class="page page-process">
  <div class="divider" style="margin-top:8px;"></div>

  <p class="section-heading">¿Cómo funciona?</p>

  <div class="steps">
    <div class="step">
      <div class="step-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <p class="step-title">Agenda tu consulta</p>
      <p class="step-desc">Cuéntanos sobre tu viaje ideal por WhatsApp o correo.</p>
    </div>

    <div class="arrow">
      <svg viewBox="0 0 40 24"><path d="M4 12h28M26 6l6 6-6 6" stroke="#53BED0" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>

    <div class="step">
      <div class="step-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
          <line x1="9" y1="3" x2="9" y2="18"/>
          <line x1="15" y1="6" x2="15" y2="21"/>
        </svg>
      </div>
      <p class="step-title">Planifiquemos juntos</p>
      <p class="step-desc">Diseñamos tu itinerario a la medida con vuelos, hoteles y experiencias.</p>
    </div>

    <div class="arrow">
      <svg viewBox="0 0 40 24"><path d="M4 12h28M26 6l6 6-6 6" stroke="#53BED0" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>

    <div class="step">
      <div class="step-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      </div>
      <p class="step-title">¡Haz tus maletas!</p>
      <p class="step-desc">Relájate y prepárate. Nosotros nos encargamos de todo lo demás.</p>
    </div>
  </div>

  <div class="contact-card">
    <p class="contact-title">Estamos listos para ti</p>
    <p class="contact-sub">Contáctanos por el medio que prefieras</p>
    <p class="contact-row"><strong>WhatsApp:</strong> <a href="https://wa.me/31634645272">+31 634 645 272</a></p>
    <p class="contact-row"><strong>Email:</strong> <a href="mailto:contacto@mappatravels.com">contacto@mappatravels.com</a></p>
    <p class="contact-row"><strong>Web:</strong> <a href="https://mappatravels.com">mappatravels.com</a></p>
  </div>

  <div class="pdf-footer">
    ${logoPrimarySvg}
    <p>MAPPA Travels &middot; Tu próxima aventura comienza aquí</p>
  </div>
</div>

</body>
</html>`;
}
