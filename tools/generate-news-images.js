const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'assets', 'chapter-cards', 'news');
fs.mkdirSync(outDir, { recursive: true });

const topics = [
  { n: 1, file: 'chapter-01-news.svg', title: 'סדר פעולות החשבון', tag: 'הנוסחה שמכריעה את הכותרת', formula: '2 + 3 × 4 = 14', scene: 'order', bg: '#0f766e', bg2: '#0ea5e9', accent: '#b8f7d4' },
  { n: 2, file: 'chapter-02-news.svg', title: 'מספרים שליליים', tag: 'תחזית מתחת לאפס', formula: '−7 < −2', scene: 'line', bg: '#1e3a8a', bg2: '#14b8a6', accent: '#bfdbfe' },
  { n: 3, file: 'chapter-03-news.svg', title: 'שברים פשוטים', tag: 'כמה מתוך השלם', formula: '3/4', scene: 'pie', bg: '#9a3412', bg2: '#ea580c', accent: '#fed7aa' },
  { n: 4, file: 'chapter-04-news.svg', title: 'אחוזים', tag: 'המספר שמזיז כותרות', formula: '35%', scene: 'percent', bg: '#991b1b', bg2: '#f97316', accent: '#fecaca' },
  { n: 5, file: 'chapter-05-news.svg', title: 'חזקות', tag: 'גדילה חוזרת בזמן', formula: '3² = 3×3', scene: 'power', bg: '#1d4ed8', bg2: '#7c3aed', accent: '#dbeafe' },
  { n: 6, file: 'chapter-06-news.svg', title: 'שורשים', tag: 'מהשטח לאורך האמיתי', formula: '√16 = 4', scene: 'root', bg: '#047857', bg2: '#65a30d', accent: '#dcfce7' },
  { n: 7, file: 'chapter-07-news.svg', title: 'חזקה שלילית', tag: 'מספרים זעירים, חדשות גדולות', formula: '10⁻³ = 1/1000', scene: 'space', bg: '#312e81', bg2: '#0f172a', accent: '#c4b5fd' },
  { n: 8, file: 'chapter-08-news.svg', title: 'כינוס איברים', tag: 'עושים סדר בנתונים', formula: '3x + 5x = 8x', scene: 'sort', bg: '#334155', bg2: '#0891b2', accent: '#bae6fd' },
  { n: 9, file: 'chapter-09-news.svg', title: 'כפל סוגריים', tag: 'הכפל נכנס לכל הפרטים', formula: '3(x+4)=3x+12', scene: 'distribute', bg: '#7f1d1d', bg2: '#be123c', accent: '#fecdd3' },
  { n: 10, file: 'chapter-10-news.svg', title: 'כפל מקוצר', tag: 'תבנית שחוסכת מהדורה שלמה', formula: '(a+b)²', scene: 'square', bg: '#78350f', bg2: '#ca8a04', accent: '#fde68a' },
  { n: 11, file: 'chapter-11-news.svg', title: 'נוסחאות', tag: 'מכונת התרגום של הנתונים', formula: 'd = v × t', scene: 'formula', bg: '#164e63', bg2: '#0891b2', accent: '#cffafe' },
  { n: 12, file: 'chapter-12-news.svg', title: 'משוואות', tag: 'מחפשים את הנעלם', formula: '1.2x = 120', scene: 'balance', bg: '#3f3f46', bg2: '#dc2626', accent: '#fee2e2' },
  { n: 13, file: 'chapter-13-news.svg', title: 'מערכת משוואות', tag: 'שתי עדויות, שני נעלמים', formula: 'x + y = 80', scene: 'system', bg: '#0f766e', bg2: '#4338ca', accent: '#ccfbf1' },
  { n: 14, file: 'chapter-14-news.svg', title: 'משוואה ריבועית', tag: 'כשהכותרת הופכת לפרבולה', formula: 'ax² + bx + c = 0', scene: 'parabola', bg: '#581c87', bg2: '#db2777', accent: '#f5d0fe' },
  { n: 15, file: 'chapter-15-news.svg', title: 'בעיות מילוליות', tag: 'הסיפור שמסתיר משוואה', formula: 'נתון → קשר → פתרון', scene: 'story', bg: '#14532d', bg2: '#16a34a', accent: '#bbf7d0' },
  { n: 16, file: 'chapter-16-news.svg', title: 'פונקציות', tag: 'לכל קלט יש פלט', formula: 'f(x)=2x+1', scene: 'function', bg: '#0f172a', bg2: '#2563eb', accent: '#bfdbfe' },
  { n: 17, file: 'chapter-17-news.svg', title: 'גיאומטריה אנליטית', tag: 'מפה שהופכת למספרים', formula: '(x,y)', scene: 'plane', bg: '#064e3b', bg2: '#0e7490', accent: '#a7f3d0' },
  { n: 18, file: 'chapter-18-news.svg', title: 'משולשים', tag: 'הצורה שמחזיקה את המבנה', formula: 'α+β+γ=180°', scene: 'triangle', bg: '#713f12', bg2: '#d97706', accent: '#fde68a' },
  { n: 19, file: 'chapter-19-news.svg', title: 'טריגונומטריה', tag: 'מודדים בלי לגעת', formula: 'tan θ = מול/ליד', scene: 'trig', bg: '#1e1b4b', bg2: '#2563eb', accent: '#c7d2fe' },
  { n: 20, file: 'chapter-20-news.svg', title: 'תרגול פרק ב', tag: 'חדר כושר לחשיבה', formula: 'בדיקה + תרגול', scene: 'practice', bg: '#991b1b', bg2: '#7c2d12', accent: '#fed7aa' },
  { n: 21, file: 'chapter-21-news.svg', title: 'סיפורים', tag: 'העלילה שמובילה לחישוב', formula: 'סיפור → נתונים', scene: 'path', bg: '#075985', bg2: '#4f46e5', accent: '#bae6fd' },
  { n: 22, file: 'chapter-22-news.svg', title: 'טיפים', tag: 'אסטרטגיית מבחן', formula: 'זמן + סדר + בדיקה', scene: 'tips', bg: '#3f6212', bg2: '#65a30d', accent: '#d9f99d' },
  { n: 23, file: 'chapter-23-news.svg', title: 'מבחן סיכום', tag: 'כל הפרקים באולפן אחד', formula: '24 פרקים', scene: 'summary', bg: '#7f1d1d', bg2: '#334155', accent: '#fecaca' },
  { n: 24, file: 'chapter-24-news.svg', title: 'מדריך Casio', tag: 'המחשבון לא קורא מחשבות', formula: '(3+5)²', scene: 'calculator', bg: '#111827', bg2: '#c2410c', accent: '#fed7aa' }
];

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

function text(value, x, y, size, weight = 800, fill = '#fff', anchor = 'middle', opacity = 1) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" font-family="Arial, 'Noto Sans Hebrew', sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" opacity="${opacity}">${esc(value)}</text>`;
}

function scene(topic) {
  const a = esc(topic.accent);
  const white = '#ffffff';
  switch (topic.scene) {
    case 'order':
      return `<g transform="translate(110 170)">
        <rect x="0" y="0" width="420" height="190" rx="34" fill="#052e2b" opacity=".62"/>
        ${['( )', 'x²', '×÷', '+−'].map((v, i) => `<circle cx="${82 + i * 86}" cy="74" r="34" fill="${i === 0 ? a : white}" opacity="${i === 0 ? 1 : .86}"/>${text(v, 82 + i * 86, 84, 27, 900, '#073b35')}`).join('')}
        <path d="M54 136 H360" stroke="${a}" stroke-width="12" stroke-linecap="round" opacity=".75"/>
        <path d="M54 136 H144" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
      </g>`;
    case 'line':
      return `<g transform="translate(100 210)">
        <rect x="0" y="-70" width="500" height="170" rx="30" fill="#061a3a" opacity=".55"/>
        <path d="M44 20 H450" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".7"/>
        ${[-2, -1, 0, 1, 2].map((n, i) => `<line x1="${86 + i * 82}" y1="-8" x2="${86 + i * 82}" y2="48" stroke="#fff" stroke-width="5" opacity=".55"/>${text(n, 86 + i * 82, 82, 30, 900, white)}`).join('')}
        <circle cx="86" cy="20" r="22" fill="${a}"/>
        <circle cx="250" cy="20" r="13" fill="#fff"/>
      </g>`;
    case 'pie':
      return `<g transform="translate(128 145)">
        <circle cx="145" cy="145" r="116" fill="#fff" opacity=".18"/>
        <path d="M145 145 L145 29 A116 116 0 0 1 261 145 Z" fill="${a}"/>
        <path d="M145 145 L261 145 A116 116 0 0 1 145 261 Z" fill="${a}" opacity=".78"/>
        <path d="M145 145 L145 261 A116 116 0 0 1 29 145 Z" fill="${a}" opacity=".55"/>
        <path d="M145 29 A116 116 0 1 0 145 261 A116 116 0 1 0 145 29" fill="none" stroke="#fff" stroke-width="7" opacity=".65"/>
        <rect x="318" y="92" width="145" height="105" rx="24" fill="#000" opacity=".34"/>
        ${text('3', 390, 128, 36, 900)}
        <path d="M352 146 H428" stroke="#fff" stroke-width="7"/>
        ${text('4', 390, 184, 36, 900)}
      </g>`;
    case 'percent':
      return `<g transform="translate(120 160)">
        <circle cx="150" cy="140" r="104" fill="none" stroke="#fff" stroke-width="34" opacity=".2"/>
        <circle cx="150" cy="140" r="104" fill="none" stroke="${a}" stroke-width="34" stroke-linecap="round" stroke-dasharray="654" stroke-dashoffset="425" transform="rotate(-90 150 140)"/>
        ${text('35%', 150, 156, 58, 900)}
        <rect x="312" y="70" width="180" height="128" rx="24" fill="#000" opacity=".34"/>
        ${text('מדד', 402, 115, 29, 900)}
        ${text('+1.9%', 402, 160, 43, 900, a)}
      </g>`;
    case 'power':
      return `<g transform="translate(150 130)">
        ${[0, 1, 2, 3].map((_, i) => `<rect x="${70 + i * 48}" y="${220 - i * 45}" width="96" height="38" rx="12" fill="${i % 2 ? '#fff' : a}" opacity="${i % 2 ? .72 : .95}"/>`).join('')}
        ${text('3', 380, 170, 110, 900)}
        ${text('2', 455, 104, 46, 900, a)}
        ${text('ריבית דריבית', 220, 302, 28, 900, '#fff', 'middle', .8)}
      </g>`;
    case 'root':
      return `<g transform="translate(130 145)">
        <rect x="0" y="0" width="240" height="240" rx="18" fill="${a}" opacity=".28"/>
        ${Array.from({ length: 5 }, (_, i) => `<path d="M${i * 60} 0 V240 M0 ${i * 60} H240" stroke="#fff" stroke-width="4" opacity=".35"/>`).join('')}
        ${text('√16', 440, 132, 78, 900)}
        <path d="M350 164 H520" stroke="${a}" stroke-width="10" stroke-linecap="round"/>
        ${text('4', 440, 230, 58, 900, a)}
      </g>`;
    case 'space':
      return `<g transform="translate(115 120)">
        <circle cx="125" cy="180" r="78" fill="${a}" opacity=".9"/>
        <circle cx="385" cy="80" r="34" fill="#fff" opacity=".78"/>
        <path d="M82 210 C210 70 360 40 522 136" fill="none" stroke="#fff" stroke-width="6" opacity=".55" stroke-dasharray="16 16"/>
        ${text('10⁻³', 330, 235, 58, 900)}
        ${text('כתיב מדעי', 330, 282, 28, 900, '#fff', 'middle', .82)}
      </g>`;
    case 'sort':
      return `<g transform="translate(110 155)">
        ${['3x', '5x', '7', '2y'].map((v, i) => `<rect x="${i % 2 ? 230 : 0}" y="${Math.floor(i / 2) * 96}" width="190" height="68" rx="20" fill="${i < 2 ? a : '#fff'}" opacity="${i < 2 ? .9 : .72}"/>${text(v, i % 2 ? 325 : 95, 44 + Math.floor(i / 2) * 96, 34, 900, '#082f36')}`).join('')}
        <path d="M450 34 H560" stroke="#fff" stroke-width="8" marker-end="url(#arrow)"/>
        <rect x="585" y="-8" width="190" height="92" rx="24" fill="#000" opacity=".35"/>
        ${text('8x', 680, 50, 42, 900, a)}
      </g>`;
    case 'distribute':
      return `<g transform="translate(110 160)">
        <circle cx="80" cy="105" r="52" fill="${a}"/>
        ${text('3', 80, 122, 58, 900, '#082f36')}
        <rect x="250" y="28" width="330" height="155" rx="30" fill="#000" opacity=".34"/>
        ${text('x + 4', 415, 123, 58, 900)}
        <path d="M132 84 C180 30 210 30 250 76" fill="none" stroke="#fff" stroke-width="8" marker-end="url(#arrow)"/>
        <path d="M132 126 C180 190 210 190 250 140" fill="none" stroke="${a}" stroke-width="8" marker-end="url(#arrow)"/>
      </g>`;
    case 'square':
      return `<g transform="translate(125 138)">
        <rect x="0" y="0" width="260" height="260" rx="18" fill="${a}" opacity=".25"/>
        <rect x="0" y="0" width="160" height="160" fill="${a}" opacity=".75"/>
        <rect x="160" y="0" width="100" height="160" fill="#fff" opacity=".3"/>
        <rect x="0" y="160" width="160" height="100" fill="#fff" opacity=".3"/>
        <rect x="160" y="160" width="100" height="100" fill="#fff" opacity=".18"/>
        <path d="M160 0 V260 M0 160 H260" stroke="#fff" stroke-width="6" opacity=".75"/>
        ${text('(a+b)²', 510, 138, 58, 900)}
      </g>`;
    case 'formula':
      return `<g transform="translate(105 145)">
        <rect x="0" y="0" width="520" height="230" rx="34" fill="#042f3d" opacity=".58"/>
        ${['d', '=', 'v', '×', 't'].map((v, i) => `<circle cx="${70 + i * 95}" cy="94" r="34" fill="${i % 2 ? '#fff' : a}" opacity="${i % 2 ? .82 : .95}"/>${text(v, 70 + i * 95, 105, 32, 900, '#083344')}`).join('')}
        <path d="M58 168 H466" stroke="#fff" stroke-width="8" opacity=".35"/>
        <path d="M58 168 H265" stroke="${a}" stroke-width="8" stroke-linecap="round"/>
      </g>`;
    case 'balance':
      return `<g transform="translate(110 145)">
        <path d="M250 44 V245 M138 245 H362" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
        <path d="M90 94 H410" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
        <path d="M120 94 L60 180 H180 Z" fill="${a}" opacity=".84"/>
        <path d="M380 94 L320 180 H440 Z" fill="#fff" opacity=".78"/>
        ${text('x', 120, 162, 38, 900, '#082f36')}
        ${text('120', 380, 162, 34, 900, '#082f36')}
      </g>`;
    case 'system':
      return `<g transform="translate(118 130)">
        <rect x="0" y="0" width="520" height="290" rx="30" fill="#000" opacity=".24"/>
        <path d="M50 230 L470 46" stroke="${a}" stroke-width="10" stroke-linecap="round"/>
        <path d="M60 48 L465 232" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
        <circle cx="260" cy="138" r="22" fill="#fff"/>
        ${text('x,y', 260, 147, 23, 900, '#0f172a')}
      </g>`;
    case 'parabola':
      return `<g transform="translate(110 125)">
        <path d="M40 270 H560 M78 300 V25" stroke="#fff" stroke-width="6" opacity=".5"/>
        <path d="M88 265 C205 40 390 40 520 265" fill="none" stroke="${a}" stroke-width="13" stroke-linecap="round"/>
        <circle cx="305" cy="76" r="18" fill="#fff"/>
        ${text('x²', 330, 180, 68, 900)}
      </g>`;
    case 'story':
      return `<g transform="translate(120 125)">
        <rect x="0" y="0" width="360" height="290" rx="28" fill="#fff" opacity=".86"/>
        <rect x="34" y="38" width="220" height="22" rx="8" fill="#0f172a" opacity=".8"/>
        ${[0, 1, 2, 3].map(i => `<rect x="34" y="${88 + i * 44}" width="${240 - i * 22}" height="16" rx="8" fill="#0f172a" opacity=".26"/>`).join('')}
        <path d="M48 224 H272" stroke="${a}" stroke-width="18" stroke-linecap="round" opacity=".86"/>
        ${text('נתונים', 455, 122, 38, 900)}
        ${text('קשר', 455, 174, 38, 900, a)}
        ${text('פתרון', 455, 226, 38, 900)}
      </g>`;
    case 'function':
      return `<g transform="translate(110 145)">
        <rect x="210" y="42" width="190" height="150" rx="28" fill="${a}" opacity=".88"/>
        ${text('f', 305, 134, 76, 900, '#0f172a')}
        <path d="M36 116 H196" stroke="#fff" stroke-width="11" marker-end="url(#arrow)"/>
        <path d="M410 116 H570" stroke="#fff" stroke-width="11" marker-end="url(#arrow)"/>
        ${text('x', 62, 95, 36, 900)}
        ${text('2x+1', 538, 95, 36, 900)}
      </g>`;
    case 'plane':
      return `<g transform="translate(112 130)">
        <rect x="0" y="0" width="520" height="290" rx="30" fill="#000" opacity=".2"/>
        ${Array.from({ length: 7 }, (_, i) => `<path d="M${45 + i * 70} 25 V265 M30 ${40 + i * 36} H490" stroke="#fff" stroke-width="2" opacity=".18"/>`).join('')}
        <path d="M260 30 V260 M35 145 H490" stroke="#fff" stroke-width="6" opacity=".55"/>
        <circle cx="355" cy="82" r="19" fill="${a}"/>
        ${text('(x,y)', 370, 150, 42, 900)}
      </g>`;
    case 'triangle':
      return `<g transform="translate(112 120)">
        <path d="M80 270 L270 44 L480 270 Z" fill="${a}" opacity=".24" stroke="#fff" stroke-width="9"/>
        <path d="M80 270 H480" stroke="${a}" stroke-width="13" stroke-linecap="round"/>
        ${text('180°', 278, 218, 58, 900)}
        ${text('α', 108, 246, 32, 900, a)}
        ${text('β', 450, 246, 32, 900, a)}
        ${text('γ', 276, 88, 32, 900, a)}
      </g>`;
    case 'trig':
      return `<g transform="translate(110 130)">
        <path d="M60 245 H520" stroke="#fff" stroke-width="7" opacity=".55"/>
        <path d="M125 245 V74" stroke="#fff" stroke-width="8"/>
        <path d="M125 245 L460 74" stroke="${a}" stroke-width="10" stroke-linecap="round"/>
        <path d="M158 245 A38 38 0 0 0 143 215" fill="none" stroke="#fff" stroke-width="5"/>
        ${text('θ', 176, 226, 30, 900)}
        ${text('tan θ', 365, 175, 46, 900)}
      </g>`;
    case 'practice':
      return `<g transform="translate(130 120)">
        <rect x="0" y="0" width="355" height="290" rx="30" fill="#fff" opacity=".86"/>
        ${[0, 1, 2, 3].map((_, i) => `<rect x="40" y="${45 + i * 52}" width="230" height="20" rx="10" fill="#111827" opacity=".22"/><circle cx="300" cy="${55 + i * 52}" r="17" fill="${i < 3 ? a : '#111827'}" opacity="${i < 3 ? .9 : .25}"/>`).join('')}
        ${text('10 שאלות', 510, 126, 44, 900)}
        ${text('בדיקה בסוף', 510, 180, 32, 900, a)}
      </g>`;
    case 'path':
      return `<g transform="translate(115 135)">
        <path d="M55 238 C130 60 250 290 330 110 S470 170 530 54" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 24"/>
        ${[55, 330, 530].map((x, i) => `<circle cx="${x}" cy="${i === 0 ? 238 : i === 1 ? 110 : 54}" r="25" fill="${i === 1 ? a : '#fff'}" opacity=".9"/>`).join('')}
        ${text('סיפור', 265, 220, 50, 900)}
        ${text('→ נתונים', 265, 270, 34, 900, a)}
      </g>`;
    case 'tips':
      return `<g transform="translate(130 130)">
        <circle cx="130" cy="130" r="105" fill="#fff" opacity=".2" stroke="#fff" stroke-width="8"/>
        <path d="M130 130 L130 58" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
        <path d="M130 130 L202 156" stroke="${a}" stroke-width="10" stroke-linecap="round"/>
        ${text('טיפ', 130, 274, 40, 900)}
        <rect x="330" y="52" width="190" height="150" rx="26" fill="#000" opacity=".28"/>
        ${text('זמן', 425, 105, 34, 900)}
        ${text('סדר', 425, 150, 34, 900, a)}
        ${text('בדיקה', 425, 195, 34, 900)}
      </g>`;
    case 'summary':
      return `<g transform="translate(120 130)">
        ${['%', 'x', '√', '△', 'f'].map((v, i) => `<rect x="${(i % 3) * 150}" y="${Math.floor(i / 3) * 110}" width="125" height="84" rx="22" fill="${i % 2 ? '#fff' : a}" opacity="${i % 2 ? .78 : .92}"/>${text(v, (i % 3) * 150 + 62, Math.floor(i / 3) * 110 + 56, 42, 900, '#111827')}`).join('')}
        ${text('מבחן', 468, 104, 54, 900)}
        ${text('סיכום', 468, 166, 54, 900, a)}
      </g>`;
    case 'calculator':
      return `<g transform="translate(150 100)">
        <rect x="0" y="0" width="310" height="360" rx="34" fill="#0f172a" stroke="#fff" stroke-width="6" opacity=".92"/>
        <rect x="35" y="38" width="240" height="68" rx="14" fill="${a}" opacity=".86"/>
        ${text('(3+5)²', 155, 84, 34, 900, '#111827')}
        ${Array.from({ length: 12 }, (_, i) => `<circle cx="${62 + (i % 4) * 62}" cy="${156 + Math.floor(i / 4) * 58}" r="22" fill="#fff" opacity="${i % 3 === 0 ? .85 : .48}"/>`).join('')}
        ${text('CASIO', 500, 170, 50, 900)}
        ${text('סוגריים לפני שווה', 500, 222, 28, 900, a)}
      </g>`;
    default:
      return '';
  }
}

function svg(topic) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" direction="rtl">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${esc(topic.bg)}"/>
      <stop offset="1" stop-color="${esc(topic.bg2)}"/>
    </linearGradient>
    <radialGradient id="spot" cx="24%" cy="15%" r="70%">
      <stop offset="0" stop-color="${esc(topic.accent)}" stop-opacity=".55"/>
      <stop offset=".62" stop-color="${esc(topic.accent)}" stop-opacity=".1"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10Z" fill="${esc(topic.accent)}"/>
    </marker>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="26" stdDeviation="22" flood-color="#000" flood-opacity=".32"/>
    </filter>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#spot)"/>
  <g opacity=".12">
    ${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 100} 0V675" stroke="#fff" stroke-width="1"/>`).join('')}
    ${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${i * 96}H1200" stroke="#fff" stroke-width="1"/>`).join('')}
  </g>
  <circle cx="1010" cy="118" r="155" fill="#fff" opacity=".09"/>
  <circle cx="96" cy="580" r="210" fill="#000" opacity=".12"/>
  <rect x="72" y="72" width="1056" height="531" rx="44" fill="#000" opacity=".22" filter="url(#shadow)"/>
  <rect x="104" y="104" width="992" height="467" rx="34" fill="#fff" opacity=".08"/>
  <g transform="translate(0 0)">
    ${text('חדשות למתמטיקאים', 1015, 164, 30, 900, topic.accent, 'middle', .98)}
    ${text(`פרק ${topic.n} · ${topic.tag}`, 1015, 210, 26, 800, '#fff', 'middle', .86)}
    ${text(topic.title, 1015, 292, 54, 900)}
    ${text(topic.formula, 1015, 366, 42, 900, topic.accent)}
  </g>
  ${scene(topic)}
  <rect x="742" y="466" width="312" height="54" rx="27" fill="#fff" opacity=".14"/>
  ${text('תמונה מקורית לכתבת הפרק', 898, 502, 23, 900, '#fff', 'middle', .92)}
</svg>`;
}

for (const topic of topics) {
  fs.writeFileSync(path.join(outDir, topic.file), svg(topic), 'utf8');
}

console.log(`created ${topics.length} news images in ${outDir}`);
