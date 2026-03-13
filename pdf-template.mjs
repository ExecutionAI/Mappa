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

// ─── Route Detail PDF ────────────────────────────────────────────────────────
export function buildRoutePdfHtml(clientName, detail, selectedOpt) {
  const name = esc(clientName || 'Viajero');
  const transportIcons = {
    vuelo:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L8 8 .8 6.2c-.5-.1-.9.4-.7.9L3 12l3.3 3.3L8 22l4-4 5.8 1.2z"/></svg>`,
    tren:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M12 3v8M8 19l-2 2M16 19l2 2M9 15h.01M15 15h.01"/></svg>`,
    bus:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6M16 6v6M2 12h19.6M18 18h2a1 1 0 000-2H4a1 1 0 000 2h2M7 18v2M17 18v2"/><rect x="2" y="3" width="20" height="13" rx="2"/></svg>`,
    traslado: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>`,
  };

  const segments = (detail.segments || []).map(seg => {
    if (seg.type === 'transport') {
      const icon = transportIcons[seg.transport_mode] || transportIcons.traslado;
      const modeLabel = { vuelo: 'Vuelo', tren: 'Tren', bus: 'Bus', traslado: 'Traslado' }[seg.transport_mode] || 'Transporte';
      const dayLabel = seg.day_start === seg.day_end ? `Día ${seg.day_start}` : `Días ${seg.day_start}–${seg.day_end}`;
      return `
      <div class="seg seg-transport">
        <div class="seg-icon-col">
          <div class="seg-icon transport-icon">${icon}</div>
          <div class="seg-line"></div>
        </div>
        <div class="seg-content">
          <div class="seg-day">${dayLabel}</div>
          <div class="seg-transport-route">${esc(seg.from || '')} → ${esc(seg.to || '')}</div>
          <div class="seg-transport-mode">${modeLabel}${seg.transport_detail ? ' · ' + esc(seg.transport_detail) : ''}</div>
          ${seg.estimated_cost_mxn ? `<div class="seg-cost">~$${seg.estimated_cost_mxn.toLocaleString('es-MX')} MXN / persona</div>` : ''}
        </div>
      </div>`;
    } else {
      const dayLabel = seg.day_start === seg.day_end ? `Día ${seg.day_start}` : `Días ${seg.day_start}–${seg.day_end}`;
      const nightsLabel = seg.nights ? `${seg.nights} noche${seg.nights > 1 ? 's' : ''}` : '';
      const highlights = (seg.highlights || []).map(h => `<li>${esc(h)}</li>`).join('');
      return `
      <div class="seg seg-city">
        <div class="seg-icon-col">
          <div class="seg-icon city-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
          </div>
          <div class="seg-line"></div>
        </div>
        <div class="seg-content">
          <div class="seg-day">${dayLabel}${nightsLabel ? ' · ' + nightsLabel : ''}</div>
          <div class="seg-city-name">${esc(seg.city || '')}</div>
          ${seg.hotel_category ? `<div class="seg-hotel">🏨 ${esc(seg.hotel_category)}</div>` : ''}
          ${seg.neighborhood_tip ? `<div class="seg-neighborhood">📍 ${esc(seg.neighborhood_tip)}</div>` : ''}
          ${highlights ? `<ul class="seg-highlights">${highlights}</ul>` : ''}
        </div>
      </div>`;
    }
  }).join('');

  const b = detail.budget_summary || {};
  const budgetRows = [
    ['Vuelos', b.flights_mxn],
    ['Hospedaje', b.accommodation_mxn],
    ['Transporte local', b.transport_local_mxn],
  ].filter(([, v]) => v).map(([label, val]) =>
    `<tr><td>${label}</td><td>$${val.toLocaleString('es-MX')} MXN</td></tr>`
  ).join('');

  const cities = (selectedOpt?.city_order || []).map((c, i, arr) =>
    i < arr.length - 1 ? `<span class="city-chip">${esc(c)}</span><span class="chip-arrow">→</span>` : `<span class="city-chip">${esc(c)}</span>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&display=swap');
  @page { size: A4; margin: 0; }
  :root {
    --teal: #036280; --cream: #ecede7; --cyan: #53BED0;
    --slate: #405f7d; --body: #2d3748; --muted: #718096;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Montserrat', sans-serif; color: var(--body); -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .bar { height: 5px; background: linear-gradient(90deg, var(--teal), var(--cyan)); }
  .page { width: 210mm; padding: 36px 52px 40px; position: relative; }
  .page-cover { min-height: calc(297mm - 5px); display: flex; flex-direction: column; padding-bottom: 32px; }
  .cover-main { flex: 1; }
  .cover-includes { margin-top: 28px; padding: 22px 26px; background: var(--cream); border-radius: 12px; }
  .cover-includes-title { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--teal); margin-bottom: 16px; }
  .cover-includes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; }
  .cover-include-item { display: flex; align-items: center; gap: 10px; font-size: 11.5px; color: var(--body); font-weight: 500; }
  .include-icon-box { width: 30px; height: 30px; border-radius: 8px; background: white; display: flex; align-items: center; justify-content: center; color: var(--teal); flex-shrink: 0; box-shadow: 0 1px 4px rgba(3,98,128,0.1); }
  .cover-footer-strip { padding-top: 22px; border-top: 1px solid rgba(3,98,128,0.12); text-align: center; margin-top: 28px; }
  .cover-footer-strip p { font-family: 'Great Vibes', cursive; font-size: 28px; color: var(--teal); opacity: 0.6; margin-bottom: 6px; }
  .cover-footer-strip small { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }
  .page-break { page-break-before: always; }

  .logo { text-align: center; margin-bottom: 18px; padding-top: 10px; }
  .logo svg { width: 220px; height: auto; }
  .divider { width: 48px; height: 2px; background: var(--cyan); margin: 16px auto 24px; }

  .cover-heading { font-family: 'Great Vibes', cursive; font-size: 40px; color: var(--teal); text-align: center; margin-bottom: 6px; }
  .cover-sub { text-align: center; font-size: 11px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 28px; }
  .cover-greeting { font-size: 16px; font-weight: 600; color: var(--teal); margin-bottom: 10px; }
  .cover-summary { font-size: 12px; line-height: 1.8; color: #4a4a4a; margin-bottom: 22px; max-width: 480px; }

  .route-title-box { background: var(--teal); border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; }
  .route-title-label { font-size: 9px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--cyan); margin-bottom: 6px; }
  .route-title-text { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .route-duration { font-size: 11px; color: rgba(255,255,255,0.75); }

  .chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 0; }
  .city-chip { background: rgba(255,255,255,0.15); color: #fff; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
  .chip-arrow { color: var(--cyan); font-size: 13px; }

  .section-title { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--teal); margin-bottom: 18px; padding-bottom: 8px; border-bottom: 2px solid var(--cream); }

  /* Timeline */
  .timeline { }
  .seg { display: flex; gap: 16px; page-break-inside: avoid; margin-bottom: 0; }
  .seg-icon-col { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .seg-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .city-icon { background: var(--teal); color: #fff; }
  .transport-icon { background: #e6f7f2; color: var(--teal); }
  .seg-line { flex: 1; width: 2px; background: #e2e8f0; margin: 4px 0; min-height: 12px; }
  .seg:last-child .seg-line { display: none; }
  .seg-content { padding-bottom: 20px; flex: 1; }

  .seg-day { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); margin-bottom: 3px; margin-top: 5px; }
  .seg-city-name { font-size: 18px; font-weight: 700; color: var(--teal); margin-bottom: 6px; }
  .seg-hotel { font-size: 11px; color: var(--body); margin-bottom: 3px; }
  .seg-neighborhood { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
  .seg-highlights { margin-left: 14px; }
  .seg-highlights li { font-size: 11.5px; line-height: 1.65; color: var(--body); margin-bottom: 2px; }

  .seg-transport-route { font-size: 14px; font-weight: 600; color: var(--slate); margin-bottom: 3px; margin-top: 4px; }
  .seg-transport-mode { font-size: 11px; color: var(--muted); margin-bottom: 3px; }
  .seg-cost { display: inline-block; font-size: 10px; font-weight: 600; color: var(--teal); background: #e6f7f2; padding: 2px 8px; border-radius: 10px; }

  /* Budget */
  .budget-box { background: var(--cream); border-radius: 12px; padding: 20px 24px; page-break-inside: avoid; margin-top: 8px; }
  .budget-box table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .budget-box td { padding: 5px 0; color: var(--body); border-bottom: 1px solid #dde0d9; }
  .budget-box tr:last-child td { border-bottom: none; }
  .budget-box td:last-child { text-align: right; font-weight: 600; color: var(--teal); }
  .budget-total td { font-size: 14px !important; font-weight: 700 !important; padding-top: 10px !important; border-top: 2px solid var(--teal) !important; }

  /* Footer */
  .pdf-footer { text-align: center; padding: 28px 40px 32px; background: var(--cream); border-radius: 12px; margin-top: 28px; page-break-inside: avoid; }
  .pdf-footer svg { width: 150px; height: auto; opacity: 0.65; }
  .pdf-footer .footer-tagline { font-family: 'Great Vibes', cursive; font-size: 22px; color: var(--teal); opacity: 0.7; margin: 8px 0 4px; }
  .pdf-footer p { font-size: 8.5px; color: #a0aec0; margin-top: 4px; letter-spacing: 1px; }

  /* Bottom bar — fixed, repeats on every printed page */
  .bar-bottom { position: fixed; bottom: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, var(--cyan), var(--teal)); }
</style>
</head>
<body>

<div class="bar"></div>
<div class="page page-cover">
  <div class="cover-main">
    <div class="logo">${logoPrimarySvg}</div>
    <div class="divider"></div>

    <p class="cover-heading">Tu Itinerario</p>
    <p class="cover-sub">Propuesta de ruta · MAPPA Travels</p>

    <p class="cover-greeting">Hola, ${name}.</p>
    <p class="cover-summary">${esc(detail.summary || '')}</p>

    <div class="route-title-box">
      <div class="route-title-label">Ruta seleccionada</div>
      <div class="route-title-text">${esc(detail.title || selectedOpt?.title || '')}</div>
      ${detail.total_days ? `<div class="route-duration">${detail.total_days} días</div>` : ''}
      ${cities ? `<div style="margin-top:12px;" class="chips">${cities}</div>` : ''}
    </div>

    <div class="cover-includes">
      <div class="cover-includes-title">Esta propuesta incluye</div>
      <div class="cover-includes-grid">
        <div class="cover-include-item">
          <div class="include-icon-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L8 8 .8 6.2c-.5-.1-.9.4-.7.9L3 12l3.3 3.3L8 22l4-4 5.8 1.2z"/></svg></div>
          <span>Vuelos recomendados</span>
        </div>
        <div class="cover-include-item">
          <div class="include-icon-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <span>Hospedaje seleccionado</span>
        </div>
        <div class="cover-include-item">
          <div class="include-icon-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <span>Itinerario día a día</span>
        </div>
        <div class="cover-include-item">
          <div class="include-icon-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          <span>Estimación de presupuesto</span>
        </div>
        <div class="cover-include-item">
          <div class="include-icon-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg></div>
          <span>Tips por destino</span>
        </div>
        <div class="cover-include-item">
          <div class="include-icon-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
          <span>Asesoría personalizada</span>
        </div>
      </div>
    </div>
  </div>
  <div class="cover-footer-strip">
    <p>Viajes con alma</p>
    <small>MAPPA Travels &middot; mappatravels.com</small>
  </div>
</div>

<div class="bar page-break"></div>
<div class="page">
  <p class="section-title">Itinerario día a día</p>
  <div class="timeline">${segments}</div>

  ${budgetRows ? `
  <p class="section-title" style="margin-top:24px;">Estimación de presupuesto <span style="font-weight:400;color:var(--muted);font-size:9px;letter-spacing:0">(por persona)</span></p>
  <div class="budget-box">
    <table>
      ${budgetRows}
      ${b.total_per_person_mxn ? `<tr class="budget-total"><td>Total estimado</td><td>$${b.total_per_person_mxn.toLocaleString('es-MX')} MXN</td></tr>` : ''}
    </table>
  </div>` : ''}

  <div class="pdf-footer">
    ${logoPrimarySvg}
    <p class="footer-tagline">Viajes con alma</p>
    <p>MAPPA Travels &middot; mappatravels.com &middot; contacto@mappatravels.com</p>
  </div>
</div>

<div class="bar-bottom"></div>
</body>
</html>`;
}

// ─── Original lead PDF ────────────────────────────────────────────────────────
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
