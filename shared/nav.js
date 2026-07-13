/* =============================================
   site nav.js — shared navigation & progress
   v2 — visit counting, mastery tracking,
        "מה עכשיו?" on every topic page
   ============================================= */

/* ── Inject design system CSS (fallback) ── */
(function(){
  if(!document.querySelector('link[href*="shared/style.css"]')){
    var l=document.createElement('link');
    l.rel='stylesheet'; l.href='/shared/style.css';
    document.head.appendChild(l);
  }
})();

/* ════════════════════════════════════════
   PHASE 10 — Tech Stack
   KaTeX · AOS · Micro-interactions
   ════════════════════════════════════════ */

/* ── AOS: Animate On Scroll ── */
(function(){
  var link=document.createElement('link');
  link.rel='stylesheet';
  link.href='https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css';
  document.head.appendChild(link);

  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js';
  s.onload=function(){
    AOS.init({duration:360,easing:'ease-out',once:true,offset:30});
    /* Attach data-aos to cards that don't have it yet */
    document.addEventListener('DOMContentLoaded',function(){
      var delay=0;
      document.querySelectorAll('.card,.formula-card,.quote-card,.life-card').forEach(function(el){
        if(!el.hasAttribute('data-aos')){
          el.setAttribute('data-aos','fade-up');
          el.setAttribute('data-aos-delay',Math.min(delay,240).toString());
          delay+=50;
        }
      });
      AOS.refresh();
    });
  };
  document.head.appendChild(s);
})();

/* ── KaTeX: Unicode → LaTeX renderer ── */
(function(){
  /* Only load on pages that have formula elements */
  function hasFormulas(){
    return document.querySelector('.formula,.eq,.formula-highlight,.formula-card .eq,.q-eq');
  }

  function unicodeToLatex(t){
    return t
      /* Superscripts */
      .replace(/([a-zA-Z0-9\)x])²/g,'$1^{2}')     /* ² */
      .replace(/([a-zA-Z0-9\)x])³/g,'$1^{3}')     /* ³ */
      .replace(/([a-zA-Z0-9\)x])⁴/g,'$1^{4}')     /* ⁴ */
      .replace(/([a-zA-Z0-9\)x])ⁿ/g,'$1^{n}')     /* ⁿ */
      /* Subscripts */
      .replace(/([a-zA-Z])₁/g,'$1_{1}')
      .replace(/([a-zA-Z])₂/g,'$1_{2}')
      /* Square roots */
      .replace(/√\(([^)]+)\)/g,'\\sqrt{$1}')
      .replace(/√([a-zA-Z0-9Δ])/g,'\\sqrt{$1}')  /* √x */
      /* Operators */
      .replace(/±/g,'\\pm')         /* ± */
      .replace(/×/g,'\\times')      /* × */
      .replace(/÷/g,'\\div')        /* ÷ */
      .replace(/≥/g,'\\geq')        /* ≥ */
      .replace(/≤/g,'\\leq')        /* ≤ */
      .replace(/≠/g,'\\neq')        /* ≠ */
      .replace(/∞/g,'\\infty')      /* ∞ */
      .replace(/−/g,'-')            /* − (minus) */
      .replace(/·/g,'\\cdot')       /* · */
      /* Greek letters */
      .replace(/π/g,'\\pi')         /* π */
      .replace(/α/g,'\\alpha')      /* α */
      .replace(/β/g,'\\beta')       /* β */
      .replace(/γ/g,'\\gamma')      /* γ */
      .replace(/θ/g,'\\theta')      /* θ */
      .replace(/φ/g,'\\phi')        /* φ */
      .replace(/Δ/g,'\\Delta')      /* Δ */
      .replace(/δ/g,'\\delta')      /* δ */
      .replace(/Σ/g,'\\Sigma')      /* Σ */
      .replace(/λ/g,'\\lambda')     /* λ */
      /* Arrows */
      .replace(/→/g,'\\to')         /* → */
      .replace(/⇒/g,'\\Rightarrow') /* ⇒ */
      /* Fractions: pattern "expr / expr" → leave as-is for readability */
      ;
  }

  function renderKatex(){
    if(typeof katex==='undefined') return;
    var sels=['.formula','.eq','.formula-highlight','.formula-card .eq','.q-eq','.math-expr'];
    document.querySelectorAll(sels.join(',')).forEach(function(el){
      if(el.dataset.katexDone) return;
      el.dataset.katexDone='1';
      var raw=el.textContent.trim();
      if(!raw || raw.length>120) return; /* skip very long text */
      var latex=unicodeToLatex(raw);
      if(latex===raw) return; /* no conversion happened */
      try{
        el.innerHTML=katex.renderToString(latex,{throwOnError:false,displayMode:false});
        el.setAttribute('dir','ltr');
        el.style.letterSpacing='0';
      }catch(e){}
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    if(!hasFormulas()) return;

    /* Load KaTeX CSS */
    var css=document.createElement('link');
    css.rel='stylesheet';
    css.href='https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
    document.head.appendChild(css);

    /* Load KaTeX JS */
    var js=document.createElement('script');
    js.src='https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
    js.onload=function(){
      /* First pass immediately */
      renderKatex();
      /* Second pass after dynamic content (e.g. noschaot formula cards) */
      setTimeout(renderKatex,600);
      /* Watch for new formula elements added dynamically */
      if(window.MutationObserver){
        var obs=new MutationObserver(function(mutations){
          var needsRender=mutations.some(function(m){
            return [].slice.call(m.addedNodes).some(function(n){
              return n.nodeType===1 &&
                (n.classList&&(n.classList.contains('eq')||n.classList.contains('formula'))||
                 n.querySelector&&n.querySelector('.eq,.formula'));
            });
          });
          if(needsRender) setTimeout(renderKatex,100);
        });
        obs.observe(document.body,{childList:true,subtree:true});
      }
    };
    document.head.appendChild(js);
  });
})();

/* ── Reading Progress Bar (content pages only) ── */
(function(){
  document.addEventListener('DOMContentLoaded',function(){
    // Only on pages with actual content (not index/home)
    var path=window.location.pathname;
    if(path==='/'||path==='/index.html'||path==='/landing.html') return;
    var bar=document.createElement('div');
    bar.id='read-progress';
    bar.style.cssText='position:fixed;top:0;left:0;height:3px;z-index:99999;width:0%;'
      +'background:linear-gradient(90deg,#ffe66d 0%,#55efc4 100%);'
      +'border-radius:0 3px 3px 0;pointer-events:none;transition:width .08s linear;';
    document.body.appendChild(bar);
    window.addEventListener('scroll',function(){
      var max=document.documentElement.scrollHeight-window.innerHeight;
      bar.style.width=(max>0?Math.round(window.scrollY/max*100):0)+'%';
    },{passive:true});
  });
})();

/* ── Scroll-to-top Button ── */
(function(){
  document.addEventListener('DOMContentLoaded',function(){
    var btn=document.createElement('button');
    btn.id='scroll-top';
    btn.innerHTML='↑';
    btn.setAttribute('aria-label','חזרה למעלה');
    btn.style.cssText='position:fixed;bottom:72px;left:22px;z-index:9997;'
      +'width:38px;height:38px;border-radius:50%;'
      +'background:rgba(255,230,109,.12);border:1px solid rgba(255,230,109,.3);'
      +'color:#ffe66d;font-size:1.1rem;cursor:pointer;'
      +'opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;'
      +'display:flex;align-items:center;justify-content:center;font-weight:700;';
    document.body.appendChild(btn);
    window.addEventListener('scroll',function(){
      var show=window.scrollY>500;
      btn.style.opacity=show?'1':'0';
      btn.style.pointerEvents=show?'auto':'none';
      btn.style.transform=show?'translateY(0)':'translateY(8px)';
    },{passive:true});
    btn.onclick=function(){ window.scrollTo({top:0,behavior:'smooth'}); };
  });
})();

/* ── Ctrl+K / "/" opens search ── */
(function(){
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey&&e.key==='k')||(e.key==='/'&&document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='TEXTAREA')){
      var srch=document.getElementById('srch');
      if(srch){
        e.preventDefault();
        var panel=document.getElementById('search-panel');
        if(panel) panel.style.display='block';
        srch.focus();
      }
    }
    if(e.key==='Escape'){
      var srch=document.getElementById('srch');
      var panel=document.getElementById('search-panel');
      if(srch&&panel&&document.activeElement===srch){
        panel.style.display='none';
        srch.blur();
      }
    }
  });
})();

/* ── Micro-interactions CSS ── */
(function(){
  var s=document.createElement('style');
  s.textContent=[
    /* Button press (chalk-fill) effect */
    '.btn-chalk:active{transform:scale(.96)!important;opacity:.85}',
    /* Correct answer flash */
    '@keyframes correct-flash{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}',
    '.opts button.right{animation:correct-flash .35s ease!important}',
    /* Wrong shake */
    '@keyframes wrong-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}',
    '.opts button.wrong{animation:wrong-shake .3s ease!important}',
    /* Card hover lift — consistent on all pages */
    '.card:hover,.formula-card:hover{transform:translateY(-3px);transition:transform .2s,box-shadow .2s}',
    /* Tile visited pulse */
    '.tile.t-fresh::before{content:"";position:absolute;inset:0;border-radius:inherit;',
      'background:rgba(85,239,196,.04);pointer-events:none}',
    /* Smooth focus ring */
    'button:focus-visible,a:focus-visible{outline:2px solid #c8820a;outline-offset:3px;border-radius:4px}',
    /* Skeleton loader (chalk style) */
    '.skeleton{background:linear-gradient(90deg,rgba(244,241,234,.08) 0%,rgba(244,241,234,.16) 50%,rgba(244,241,234,.08) 100%);',
      'background-size:200% 100%;animation:skeleton-shine 1.4s ease infinite;border-radius:6px}',
    '@keyframes skeleton-shine{0%{background-position:200% 0}100%{background-position:-200% 0}}',
    /* AOS custom easing for board theme */
    '[data-aos="fade-up"]{transition-timing-function:cubic-bezier(.2,.8,.2,1)!important}',
  ].join('');
  document.head.appendChild(s);
})();

(function () {
  'use strict';

  /* ── Visit tracking (JSON with count + timestamp) ── */
  var seg = '';
  try {
    var parts = window.location.pathname.split('/').filter(Boolean);
    seg = parts.length >= 2 ? parts.slice(-2).join('/') : parts.join('/');
    if (seg) {
      var raw = localStorage.getItem('visited:' + seg);
      var data = { count: 1, lastVisit: Date.now() };
      if (raw) {
        try { var prev = JSON.parse(raw); data.count = (prev.count || 1) + 1; data.lastVisit = Date.now(); }
        catch(e) { data.count = 2; data.lastVisit = Date.now(); } // upgrade from old '1'
      }
      localStorage.setItem('visited:' + seg, JSON.stringify(data));
      localStorage.setItem('last-visited', JSON.stringify({
        url: window.location.pathname,
        title: document.title,
        seg: seg,
        ts: Date.now()
      }));
    }
  } catch (e) {}

  /* ── Determine home URL depth ── */
  var path   = window.location.pathname.replace(/^\//, '');
  var segs   = path.split('/').filter(Boolean).length;
  var isRoot = segs === 0 || path === 'index.html' || path === 'landing.html' || path === 'index-lavan.html' || path === 'index-lavan';
  var home   = segs <= 1 ? 'index.html' : '../index.html';
  var depth  = segs <= 1 ? '' : '../';

  /* ── Global sharp-color overrides for game UI ── */
  var sharp = document.createElement('style');
  sharp.textContent = [
    '.opts button.right,.btn-right{background:#0db870!important;border-color:#0db870!important;color:#fff!important;box-shadow:0 4px 16px rgba(13,184,112,.45)!important}',
    '.opts button.wrong,.btn-wrong{background:#ff2d4e!important;border-color:#ff2d4e!important;color:#fff!important;box-shadow:0 4px 16px rgba(255,45,78,.4)!important}',
    '#feedback:empty::after{content:""}',
    '.turn-banner{font-size:1.05rem!important;font-weight:800!important}',
    '.next-btn{background:#2060e8!important;letter-spacing:.5px}',
    '.scoreboard .pts{color:#e8a800!important}',
  ].join('');
  document.head.appendChild(sharp);

  /* ── Bidi fix: math expressions always LTR ── */
  var bidiFix = document.createElement('style');
  bidiFix.textContent = [
    '.formula,.eq,.math-expr,code,pre,',
    '.formula-card .eq,.formula-highlight,',
    '.q-box,.step-expr,.expr,.calc-display{',
      'direction:ltr!important;unicode-bidi:isolate;',
    '}',
  ].join('');
  document.head.appendChild(bidiFix);
  document.addEventListener('DOMContentLoaded', function() {
    ['.formula','.eq','.math-expr','.formula-highlight','.step-expr'].forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){ el.setAttribute('dir','ltr'); });
    });
  });

  /* ── CSS: home button ── */
  var css = document.createElement('style');
  css.textContent = [
    '#snav{position:fixed;bottom:22px;left:22px;z-index:99999;',
      'display:inline-flex;align-items:center;gap:8px;',
      'direction:rtl;font-family:"Heebo",Arial,sans-serif;',
      'background:linear-gradient(135deg,#f0c14b 0%,#d18a3a 100%);',
      'color:#071e45;text-decoration:none;font-weight:800;font-size:.88rem;',
      'border-radius:50px;padding:13px 13px;',
      'box-shadow:0 6px 28px rgba(240,193,75,.6);',
      'transition:max-width .28s cubic-bezier(.2,.8,.2,1),padding .28s,opacity .28s;',
      'overflow:hidden;max-width:50px;white-space:nowrap;}',
    '#snav:hover{max-width:180px;padding:13px 22px}',
    '#snav .sn-ic{font-size:1.3rem;flex-shrink:0;line-height:1}',
    '#snav .sn-lb{opacity:0;transition:opacity .15s .05s;pointer-events:none}',
    '#snav:hover .sn-lb{opacity:1}',
    '.vck{position:absolute;top:10px;left:10px;width:22px;height:22px;border-radius:50%;',
      'background:#0db870;color:#fff;font-size:.75rem;font-weight:900;',
      'display:flex;align-items:center;justify-content:center;',
      'box-shadow:0 2px 8px rgba(58,166,111,.5);animation:vckpop .35s cubic-bezier(.2,.8,.2,1)}',
    '@keyframes vckpop{from{transform:scale(0)}to{transform:scale(1)}}',
    '@media(max-width:600px){#snav{bottom:14px;left:14px;padding:11px}#snav:hover{max-width:155px;padding:11px 18px}}',
  ].join('');
  document.head.appendChild(css);

  /* ── Home button ── */
  function mountBtn() {
    if (isRoot) return;
    if (document.getElementById('snav')) return;
    var a = document.createElement('a');
    a.id = 'snav'; a.href = home;
    a.innerHTML = '<span class="sn-ic">🏠</span><span class="sn-lb">מרכז ראשי</span>';
    document.body.appendChild(a);
  }
  if (document.body) mountBtn();
  else document.addEventListener('DOMContentLoaded', mountBtn);

})();

/* ── Dark Mode ── */
(function () {
  var KEY = 'theme';
  var isDark = localStorage.getItem(KEY) === 'dark';
  function applyDark(on) { document.documentElement.classList.toggle('dark', on); }
  applyDark(isDark);

  var css = document.createElement('style');
  css.textContent = [
    'html.dark{color-scheme:dark}',
    'html.dark body{background:#1a1c2e!important;color:#e8e6f0!important;',
      '--paper:#1a1c2e;--bg:#1a1c2e;--ink:#e8e6f0;--text:#e8e6f0;--txt:#e8e6f0;',
      '--card:#252744;--card-solid:#252744;--card2:#2e3158;',
      '--mut:#9a97b0;--text-dim:#9a97b0;',
      '--line:rgba(255,255,255,.07);--border:rgba(255,255,255,.07);',
      '--shadow:0 8px 28px rgba(0,0,0,.55);}',
    'html.dark .card,html.dark .tile,html.dark header,html.dark .featured,html.dark .stat',
      '{background:#252744!important;border-color:rgba(255,255,255,.08)!important;color:#e8e6f0!important}',
    'html.dark h1,html.dark h2,html.dark h3,html.dark h4,html.dark .card h2,html.dark .card h3,html.dark .desc,html.dark .sub{color:#e8e6f0!important}',
    'html.dark .top-nav{background:rgba(26,28,46,.97)!important;border-color:rgba(255,255,255,.06)!important}',
    'html.dark input,html.dark select,html.dark textarea{background:#2e3158!important;color:#e8e6f0!important;border-color:rgba(255,255,255,.15)!important}',
    'html.dark .note,html.dark .gold-box,html.dark .formula,html.dark .tip{background:rgba(255,255,255,.05)!important}',
    'html.dark .examples div,html.dark .example{background:#2e3158!important;color:#e8e6f0!important}',
    'html.dark #tnav{border-color:rgba(255,255,255,.06)!important}',
    'html.dark .tnav-btn{background:#252744!important;color:#e8e6f0!important;border-color:rgba(255,255,255,.12)!important}',
    'html.dark .tnav-hub{background:rgba(255,255,255,.06)!important;color:#9a97b0!important}',
    'html.dark .opts button{background:#252744!important;color:#e8e6f0!important;border-color:rgba(255,255,255,.15)!important}',
    'html.dark .q-box,html.dark .turn-banner,html.dark .scoreboard{background:#2e3158!important;color:#e8e6f0!important}',
    'html.dark .sec-title{color:#e8e6f0!important}',
    'html.dark .section-title{color:#e8e6f0!important;border-color:rgba(255,255,255,.15)!important}',
    'html.dark .formula-card{background:#252744!important;border-color:rgba(255,255,255,.08)!important}',
    'html.dark .formula-card .eq{color:#e8e6f0!important}',
    'html.dark .formula-card.open{background:#2e3158!important}',
    /* Dark mode toggle */
    '#dmode{position:fixed;bottom:22px;right:22px;z-index:99998;',
      'width:46px;height:46px;border-radius:50%;',
      'background:#12142a;color:#f0c14b;border:none;font-size:1.25rem;',
      'cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.3);',
      'transition:transform .2s,background .25s;display:flex;align-items:center;justify-content:center;}',
    'html.dark #dmode{background:#e8c84a;color:#12142a}',
    '#dmode:hover{transform:scale(1.12)}',
    '@media(max-width:600px){#dmode{bottom:14px;right:14px;width:42px;height:42px;font-size:1.1rem}}',
  ].join('');
  document.head.appendChild(css);

  function mountToggle() {
    if (document.getElementById('dmode')) return;
    var btn = document.createElement('button');
    btn.id = 'dmode'; btn.title = isDark ? 'מצב יום' : 'מצב לילה';
    btn.setAttribute('aria-label', btn.title);
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.onclick = function () {
      isDark = !isDark; applyDark(isDark);
      localStorage.setItem(KEY, isDark ? 'dark' : 'light');
      btn.textContent = isDark ? '☀️' : '🌙';
      btn.title = isDark ? 'מצב יום' : 'מצב לילה';
    };
    document.body.appendChild(btn);
  }
  if (document.body) mountToggle();
  else document.addEventListener('DOMContentLoaded', mountToggle);
})();

/* ── "מה עכשיו?" — prev/next + 3 action buttons on all topic pages ── */
(function () {

  /* Full ordered topic list (learn/ + topics/) */
  var TOPICS = [
    { seg:'learn/chazakot',                           name:'חזקות' },
    { seg:'learn/shorashim',                          name:'שורשים' },
    { seg:'learn/seder_peulot',                       name:'סדר פעולות' },
    { seg:'learn/shliliyim',                          name:'מספרים שליליים' },
    { seg:'learn/chazaka_shlili',                     name:'חזקה של שלילי' },
    { seg:'topics/mavoa-algebra',                     name:'מבוא לאלגברה' },
    { seg:'topics/fraction_addition_subtraction_html',name:'חיבור וחיסור שברים' },
    { seg:'topics/advanced_fractions_operations_html',name:'כפל וחילוק שברים' },
    { seg:'topics/fractions_algebra_html',            name:'שברים אלגבריים' },
    { seg:'topics/mechane-meshutaf',                  name:'מכנה משותף ומשוואות' },
    { seg:'learn/kinus_evarim',                       name:'כינוס איברים' },
    { seg:'learn/kefel_sograyim',                     name:'כפל ופתיחת סוגריים' },
    { seg:'learn/kefel_mekutzar',                     name:'נוסחאות כפל מקוצר' },
    { seg:'topics/common_factor_standalone_html',     name:'גורם משותף' },
    { seg:'topics/factoring_difference_squares_html', name:'הפרש ריבועים' },
    { seg:'topics/piruk-legormim',                    name:'פירוק לגורמים מלא' },
    { seg:'learn/mishvaot',                           name:'משוואות ממעלה ראשונה' },
    { seg:'topics/aishvayonot',                       name:'אי-שוויונות' },
    { seg:'learn/beayot_miluliyot',                   name:'בעיות מילוליות' },
    { seg:'topics/beayot-taarovet',                   name:'בעיות תערובת' },
    { seg:'learn/achuzim',                            name:'אחוזים' },
    { seg:'learn/funktziot',                          name:'פונקציות וגרפים' },
    { seg:'topics/tchum-hagdara',                     name:'תחום הגדרה' },
    { seg:'learn/mishvaa_ribuit',                     name:'משוואה ריבועית' },
    { seg:'topics/mishvaot-du-riboiot',               name:'משוואות דו-ריבועיות' },
    { seg:'topics/funktziat-shoresh',                 name:'פונקציית שורש' },
    { seg:'learn/maarechet',                          name:'מערכת משוואות' },
    { seg:'topics/tor-cheshboni',                     name:'טור חשבוני' },
    { seg:'learn/meshulashim',                        name:'משולשים' },
    { seg:'topics/zaviyot-meshulash',                 name:'זוויות במשולש' },
    { seg:'topics/chafifast-meshulashim',             name:'חפיפת משולשים' },
    { seg:'topics/merubaot',                          name:'מרובעים' },
    { seg:'topics/shtachim-vhikim',                   name:'שטחים והיקפים' },
    { seg:'topics/maagal',                            name:'מעגל' },
    { seg:'learn/geo_analytit',                       name:'גיאומטריה אנליטית' },
    { seg:'learn/trigo',                              name:'טריגונומטריה' },
    { seg:'topics/statistika',                        name:'סטטיסטיקה' },
    { seg:'topics/hasttabrut',                        name:'הסתברות' },
    { seg:'learn/noschaot',                           name:'דף נוסחאות' },
    { seg:'learn/tipim',                              name:'טיפים וטריקים' },
    { seg:'learn/mivchanim',                          name:'מבחני מה"ט' },
    { seg:'learn/tirgul_perek_b',                     name:'תרגול מסכם' },
    { seg:'learn/mivchan_sikum',                      name:'מבחן סיכום' },
  ];

  var path  = window.location.pathname.replace(/^\//, '');
  var parts = path.split('/').filter(Boolean);
  var depth = parts.length >= 2 ? '../' : '';

  /* Determine current seg (without .html) */
  var curSeg = '';
  if (parts.length >= 2) {
    curSeg = parts.slice(-2).join('/').replace('.html','');
  }

  var idx = TOPICS.findIndex(function(t){ return t.seg === curSeg; });
  if (idx < 0) return; // not a recognised topic page → don't inject

  var prev  = idx > 0              ? TOPICS[idx - 1] : null;
  var next  = idx < TOPICS.length-1? TOPICS[idx + 1] : null;

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = [
    /* "מה עכשיו?" wrapper */
    '#what-now{',
      'max-width:780px;margin:40px auto 0;padding:22px 20px 28px;',
      'border-top:2px dashed rgba(0,0,0,.1);',
      'font-family:"Heebo",Arial,sans-serif;direction:rtl;',
      'text-align:center;',
    '}',
    '#what-now .wn-title{',
      'font-size:.78rem;font-weight:800;color:#9a97b0;letter-spacing:2.5px;',
      'text-transform:uppercase;margin-bottom:16px;',
    '}',
    /* Prev / hub / next row */
    '.wn-nav{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:14px;}',
    '.tnav-btn{display:inline-flex;align-items:center;gap:7px;',
      'background:#fff;border:1.5px solid rgba(0,0,0,.11);border-radius:12px;',
      'padding:10px 16px;text-decoration:none;color:#12142a;',
      'font-size:.87rem;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.05);',
      'transition:.2s;max-width:42%;overflow:hidden;flex-shrink:0;}',
    '.tnav-btn span.lbl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.tnav-btn:hover{border-color:#c9a227;background:#fffcf0;',
      'transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.09);}',
    '.tnav-arr{color:#c9a227;font-size:1rem;flex-shrink:0;}',
    '.tnav-hub{display:inline-flex;align-items:center;gap:5px;color:#5a6080;',
      'font-size:.82rem;font-weight:600;text-decoration:none;',
      'padding:8px 14px;border-radius:99px;background:rgba(0,0,0,.04);',
      'transition:.2s;white-space:nowrap;flex-shrink:0;}',
    '.tnav-hub:hover{background:rgba(0,0,0,.08);color:#12142a;}',
    /* Action buttons row */
    '.wn-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}',
    '.wn-btn{display:inline-flex;align-items:center;gap:6px;padding:11px 22px;',
      'border-radius:12px;text-decoration:none;font-weight:700;font-size:.9rem;',
      'transition:.18s;border:none;cursor:pointer;}',
    '.wn-practice{background:#0f9e56;color:#fff;}',
    '.wn-practice:hover{background:#0c8a4b;transform:translateY(-2px)}',
    '.wn-exam{background:#c8820a;color:#fff;}',
    '.wn-exam:hover{background:#b3720a;transform:translateY(-2px)}',
    '.wn-next-btn{background:#2a5bd8;color:#fff;}',
    '.wn-next-btn:hover{background:#2251c4;transform:translateY(-2px)}',
    /* responsive */
    '@media(max-width:540px){',
      '.wn-nav{justify-content:center;}',
      '.tnav-btn{max-width:44%;font-size:.8rem;padding:9px 11px;}',
      '.wn-btn{font-size:.85rem;padding:10px 16px;}',
    '}',
  ].join('');
  document.head.appendChild(css);

  function makeBtn(topic, isPrev) {
    var a = document.createElement('a');
    a.className = 'tnav-btn';
    a.href = depth + topic.seg + '.html';
    a.title = topic.name;
    if (isPrev) {
      a.innerHTML = '<span class="tnav-arr">→</span><span class="lbl">' + topic.name + '</span>';
    } else {
      a.innerHTML = '<span class="lbl">' + topic.name + '</span><span class="tnav-arr">←</span>';
    }
    return a;
  }

  function inject() {
    var wrap = document.createElement('div');
    wrap.id = 'what-now';

    /* Title */
    var title = document.createElement('div');
    title.className = 'wn-title';
    title.textContent = 'מה עכשיו?';
    wrap.appendChild(title);

    /* Prev / Hub / Next navigation row */
    var nav = document.createElement('div');
    nav.className = 'wn-nav';
    nav.setAttribute('aria-label', 'ניווט בין נושאים');

    nav.appendChild(prev ? makeBtn(prev, true) : document.createElement('span'));

    var hub = document.createElement('a');
    hub.className = 'tnav-hub';
    hub.href = depth + 'index.html';
    hub.innerHTML = '📚 כל הנושאים';
    nav.appendChild(hub);

    nav.appendChild(next ? makeBtn(next, false) : document.createElement('span'));
    wrap.appendChild(nav);

    /* Action buttons */
    var actions = document.createElement('div');
    actions.className = 'wn-actions';

    /* תרגול */
    var practice = document.createElement('a');
    practice.className = 'wn-btn wn-practice';
    practice.href = depth + 'learn/tirgul_perek_b.html';
    practice.innerHTML = '✍️ תרגול מסכם';
    actions.appendChild(practice);

    /* מבחן קצר */
    var exam = document.createElement('a');
    exam.className = 'wn-btn wn-exam';
    exam.href = depth + 'learn/mivchan_sikum.html';
    exam.innerHTML = '🏆 מבחן קצר';
    actions.appendChild(exam);

    /* הנושא הבא */
    if (next) {
      var nextBtn = document.createElement('a');
      nextBtn.className = 'wn-btn wn-next-btn';
      nextBtn.href = depth + next.seg + '.html';
      nextBtn.innerHTML = '← ' + next.name;
      actions.appendChild(nextBtn);
    }

    wrap.appendChild(actions);

    /* Insert before existing footer or snav or at end of body */
    var footer = document.querySelector('footer');
    if (footer) footer.parentNode.insertBefore(wrap, footer);
    else document.body.appendChild(wrap);
  }

  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
