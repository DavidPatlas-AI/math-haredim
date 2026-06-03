/* =============================================
   site nav.js — shared navigation & progress
   Adds: floating home button + visit tracking
   ============================================= */
(function () {
  'use strict';

  /* ── Mark this page as visited ── */
  try {
    var parts = window.location.pathname.split('/').filter(Boolean);
    var seg   = parts.length >= 2 ? parts.slice(-2).join('/') : parts.join('/');
    if (seg) localStorage.setItem('visited:' + seg, '1');
  } catch (e) {}

  /* ── Determine home URL depth ── */
  var path  = window.location.pathname.replace(/^\//, '');
  var segs  = path.split('/').filter(Boolean).length;
  // inside /learn/, /topics/, /calculator/ = depth 1 → ../index.html
  var home  = segs <= 1 ? 'index.html' : '../index.html';

  /* ── Global sharp-color overrides for game UI ── */
  var sharp = document.createElement('style');
  sharp.textContent = [
    /* Correct answer: vivid green */
    '.opts button.right,.btn-right{background:#0db870!important;border-color:#0db870!important;color:#fff!important;box-shadow:0 4px 16px rgba(13,184,112,.45)!important}',
    /* Wrong answer: vivid red */
    '.opts button.wrong,.btn-wrong{background:#ff2d4e!important;border-color:#ff2d4e!important;color:#fff!important;box-shadow:0 4px 16px rgba(255,45,78,.4)!important}',
    /* CPU thinking text */
    '#feedback:empty::after{content:""}',
    /* Bolder turn banner */
    '.turn-banner{font-size:1.05rem!important;font-weight:800!important}',
    /* Stronger next button */
    '.next-btn{background:#2060e8!important;letter-spacing:.5px}',
    /* Vivid score numbers */
    '.scoreboard .pts{color:#e8a800!important}',
  ].join('');
  document.head.appendChild(sharp);

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = [
    '#snav{',
      'position:fixed;bottom:22px;left:22px;z-index:99999;',
      'display:inline-flex;align-items:center;gap:8px;',
      'direction:rtl;font-family:"Heebo",Arial,sans-serif;',
      'background:linear-gradient(135deg,#f0c14b 0%,#d18a3a 100%);',
      'color:#071e45;text-decoration:none;font-weight:800;font-size:.88rem;',
      'border-radius:50px;padding:13px 13px;',
      'box-shadow:0 6px 28px rgba(240,193,75,.6);',
      'transition:max-width .28s cubic-bezier(.2,.8,.2,1),padding .28s,opacity .28s;',
      'overflow:hidden;max-width:50px;white-space:nowrap;',
    '}',
    '#snav:hover{max-width:180px;padding:13px 22px}',
    '#snav .sn-ic{font-size:1.3rem;flex-shrink:0;line-height:1}',
    '#snav .sn-lb{opacity:0;transition:opacity .15s .05s;pointer-events:none}',
    '#snav:hover .sn-lb{opacity:1}',
    /* Visited checkmark for tiles in index */
    '.vck{',
      'position:absolute;top:10px;left:10px;',
      'width:22px;height:22px;border-radius:50%;',
      'background:#0db870;color:#fff;',
      'font-size:.75rem;font-weight:900;',
      'display:flex;align-items:center;justify-content:center;',
      'box-shadow:0 2px 8px rgba(58,166,111,.5);',
      'animation:vckpop .35s cubic-bezier(.2,.8,.2,1)',
    '}',
    '@keyframes vckpop{from{transform:scale(0)}to{transform:scale(1)}}',
    '@media(max-width:600px){',
      '#snav{bottom:14px;left:14px;padding:11px}',
      '#snav:hover{max-width:155px;padding:11px 18px}',
    '}'
  ].join('');
  document.head.appendChild(css);

  /* ── Button ── */
  function mountBtn() {
    if (document.getElementById('snav')) return;
    var a = document.createElement('a');
    a.id        = 'snav';
    a.href      = home;
    a.innerHTML = '<span class="sn-ic">🏠</span><span class="sn-lb">מרכז ראשי</span>';
    document.body.appendChild(a);
  }

  if (document.body) mountBtn();
  else document.addEventListener('DOMContentLoaded', mountBtn);

})();
