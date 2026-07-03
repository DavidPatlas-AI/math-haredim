(function(){
  'use strict';

  const fallbackVisual={symbol:'∑',formula:'x+1',tag:'מסלול',bg:'#087c68',bg2:'#2563eb',accent:'#d9fdd3'};
  const ICON_W=160,ICON_H=120;

  const FAMILY_BY_FILE={
    'learn/seder_peulot.html':'order',
    'learn/shliliyim.html':'numberline',
    'learn/shvarim.html':'fraction',
    'learn/achuzim.html':'percent',
    'learn/chazakot.html':'power',
    'learn/shorashim.html':'root',
    'learn/chazaka_shlili.html':'flip',
    'learn/kinus_evarim.html':'sort',
    'learn/kefel_sograyim.html':'distribute',
    'learn/kefel_mekutzar.html':'square',
    'learn/noschaot.html':'formula',
    'learn/mishvaot.html':'balance',
    'learn/maarechet.html':'lines',
    'learn/mishvaa_ribuit.html':'parabola',
    'learn/beayot_miluliyot.html':'story',
    'learn/funktziot.html':'machine',
    'learn/geo_analytit.html':'plane',
    'learn/meshulashim.html':'triangle',
    'learn/trigo.html':'trig',
    'learn/tirgul_perek_b.html':'loop',
    'learn/sippurim.html':'path',
    'learn/tipim.html':'clock',
    'learn/mivchan_sikum.html':'mixed',
    'calculator/casio-tutorial.html':'calculator'
  };

  function lessonFor(page){
    return (window.MATHBRO_LESSONS||{})[page&&page.file]||{};
  }

  function cleanTitle(page){
    return String(page&&page.title||'פרק')
      .replace(/\s*·\s*מתמטיקה לחרדים.*$/,'')
      .replace(/^פרק\s*\d+[:：]?\s*/,'')
      .trim();
  }

  function visualFor(page){
    return {...fallbackVisual,...(lessonFor(page).visual||{})};
  }

  function familyFor(page){
    return FAMILY_BY_FILE[page&&page.file]||'generic';
  }

  function statusText(page,lesson){
    const l=lesson||lessonFor(page);
    const slides=storySlides(page,l);
    return slides[0]&&slides[0].text||l.beginner||'פותחים את הנושא בשיחה קצרה, תמונה, בדיקה וחידון.';
  }

  function storySlides(page,lesson){
    const l=lesson||lessonFor(page);
    const title=cleanTitle(page);
    if(Array.isArray(l.story)&&l.story.length){
      return l.story.map((slide,index)=>({
        kind:slide.kind||'hero',
        badge:slide.badge||`שקופית ${index+1}`,
        title:slide.title||title,
        text:slide.text||l.beginner||'נלמד את הרעיון צעד־צעד.',
        formula:slide.formula||l.visual&&l.visual.formula||'מתחילים'
      }));
    }
    return [
      {kind:'hero',badge:'פותחים סטורי',title,text:l.beginner||`נלמד את ${title} דרך הסבר קצר.`,formula:visualFor(page).formula},
      {kind:'idea',badge:'הרעיון',title:'מה חשוב להבין?',text:l.deep&&l.deep.why||l.advanced||l.beginner||'',formula:l.deep&&l.deep.memory||'נתונים → כלל → בדיקה'},
      {kind:'practice',badge:'נסה לבד',title:'תרגול',text:l.challenge||`פתור שאלה קצרה בנושא ${title}.`,formula:'✓'}
    ];
  }

  function xml(value){
    return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&apos;','"':'&quot;'}[ch]));
  }

  function wrap(value,max=34,limit=5){
    const words=String(value??'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
    const lines=[];
    let line='';
    words.forEach(word=>{
      const next=line?`${line} ${word}`:word;
      if(next.length>max&&line){
        lines.push(line);
        line=word;
      }else{
        line=next;
      }
    });
    if(line)lines.push(line);
    if(lines.length>limit){
      const kept=lines.slice(0,limit);
      kept[limit-1]=`${kept[limit-1].replace(/[.。!?！？,，;；:]$/,'')}...`;
      return kept;
    }
    return lines;
  }

  function textBlock(lines,x,y,size,lineHeight,fill='#fff',weight='800',anchor='middle'){
    return lines.map((line,index)=>`<text x="${x}" y="${y+index*lineHeight}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" direction="rtl">${xml(line)}</text>`).join('');
  }

  function commonDefs(v){
    return `<defs>
      <style>
        @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes draw{from{stroke-dashoffset:740}to{stroke-dashoffset:0}}
        @keyframes glow{0%,100%{opacity:.35}50%{opacity:.75}}
        @keyframes pop{0%{transform:scale(.94);opacity:.75}100%{transform:scale(1);opacity:1}}
        @keyframes tip{0%,100%{transform:rotate(0deg)}30%{transform:rotate(-9deg)}65%{transform:rotate(6deg)}}
        @keyframes slidePoint{0%,100%{transform:translateX(0)}50%{transform:translateX(46px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes flipdown{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(28px) rotate(180deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.22}}
        @keyframes sweepArm{0%{transform:rotate(-28deg)}100%{transform:rotate(206deg)}}
        .float{animation:floaty 5.4s ease-in-out infinite}
        .draw{stroke-dasharray:740;animation:draw 3.5s ease forwards}
        .glow{animation:glow 3.2s ease-in-out infinite}
        .pop{animation:pop .7s ease forwards}
        .tip{animation:tip 3.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        .slide{animation:slidePoint 3.2s ease-in-out infinite}
        .spin{animation:spin 6s linear infinite;transform-box:fill-box;transform-origin:center}
        .spin-slow{animation:spin 11s linear infinite;transform-box:fill-box;transform-origin:center}
        .flip{animation:flipdown 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        .blink{animation:blink 1.5s ease-in-out infinite}
        .sweep{animation:sweepArm 3.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      </style>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${xml(v.bg)}"/>
        <stop offset="1" stop-color="${xml(v.bg2)}"/>
      </linearGradient>
      <radialGradient id="light" cx="30%" cy="18%" r="78%">
        <stop offset="0" stop-color="${xml(v.accent)}" stop-opacity=".62"/>
        <stop offset=".58" stop-color="${xml(v.accent)}" stop-opacity=".13"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#000" flood-opacity=".32"/>
      </filter>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10Z" fill="${xml(v.accent)}"/>
      </marker>
    </defs>`;
  }

  // ---- per-topic illustrations, drawn in a 160x120 box, centered/scaled by placeIcon() ----
  const ICONS={
    order(v){
      const items=[['( )',40],['x²',66],['×÷',92],['+−',118]];
      return `<g>
        <rect x="20" y="34" width="120" height="54" rx="16" fill="#fff" opacity=".14"/>
        ${items.map(([s,x],i)=>`<circle cx="${x}" cy="61" r="15" fill="${i===0?xml(v.accent):'#fff'}" opacity="${i===0?1:.75}"/>
        <text x="${x}" y="66" text-anchor="middle" font-family="Arial" font-size="13" font-weight="900" fill="${xml(v.bg)}">${xml(s)}</text>`).join('')}
        <path class="slide" d="M32 92 h16" stroke="${xml(v.accent)}" stroke-width="6" stroke-linecap="round"/>
        <text x="80" y="110" text-anchor="middle" font-family="Arial" font-size="11" font-weight="800" fill="#fff" opacity=".85" direction="rtl">סדר קבוע</text>
      </g>`;
    },
    numberline(v){
      return `<g>
        <path d="M14 64 H146" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".65"/>
        ${[-2,-1,0,1,2].map((n,i)=>`<line x1="${30+i*26}" y1="56" x2="${30+i*26}" y2="72" stroke="#fff" stroke-width="3" opacity=".55"/>
        <text x="${30+i*26}" y="90" text-anchor="middle" font-family="Arial" font-size="12" font-weight="800" fill="#fff" opacity=".8">${n}</text>`).join('')}
        <circle class="slide" cx="30" cy="64" r="9" fill="${xml(v.accent)}"/>
      </g>`;
    },
    fraction(v){
      const cx=56,cy=60,r=40;
      function slice(i){
        const a0=(i*90-90)*Math.PI/180,a1=((i+1)*90-90)*Math.PI/180;
        const x0=(cx+r*Math.cos(a0)).toFixed(1),y0=(cy+r*Math.sin(a0)).toFixed(1),x1=(cx+r*Math.cos(a1)).toFixed(1),y1=(cy+r*Math.sin(a1)).toFixed(1);
        return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`;
      }
      return `<g class="pop">
        ${[0,1,2,3].map(i=>`<path d="${slice(i)}" fill="${i<3?xml(v.accent):'#fff'}" opacity="${i<3?.95:.22}" stroke="${xml(v.bg)}" stroke-width="2"/>`).join('')}
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>
        <rect x="108" y="42" width="42" height="36" rx="10" fill="#061713" opacity=".4"/>
        <text x="129" y="58" text-anchor="middle" font-family="Arial" font-size="14" font-weight="900" fill="#fff">3</text>
        <path d="M118 64 H140" stroke="#fff" stroke-width="3"/>
        <text x="129" y="76" text-anchor="middle" font-family="Arial" font-size="14" font-weight="900" fill="#fff">4</text>
      </g>`;
    },
    percent(v){
      const r=34,c=2*Math.PI*r;
      return `<g>
        <circle cx="56" cy="60" r="${r}" fill="none" stroke="#fff" stroke-width="12" opacity=".22"/>
        <circle cx="56" cy="60" r="${r}" fill="none" stroke="${xml(v.accent)}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c*0.65).toFixed(1)}" transform="rotate(-90 56 60)" class="pop"/>
        <text x="56" y="67" text-anchor="middle" font-family="Arial" font-size="20" font-weight="900" fill="#fff">35%</text>
        <text x="120" y="50" font-family="Arial" font-size="12" font-weight="800" fill="#fff" opacity=".8">100%</text>
        <text x="120" y="72" font-family="Arial" font-size="12" font-weight="800" fill="${xml(v.accent)}" direction="rtl">מהשלם</text>
      </g>`;
    },
    power(v){
      return `<g class="float">
        <rect x="46" y="78" width="34" height="22" rx="4" fill="${xml(v.accent)}"/>
        <rect x="50" y="54" width="26" height="22" rx="4" fill="#fff" opacity=".85"/>
        <rect x="54" y="30" width="18" height="22" rx="4" fill="${xml(v.accent)}" opacity=".8"/>
        <text x="100" y="60" font-family="Arial" font-size="34" font-weight="900" fill="#fff">3</text>
        <text x="126" y="42" font-family="Arial" font-size="18" font-weight="900" fill="${xml(v.accent)}">2</text>
        <text x="94" y="94" font-family="Arial" font-size="13" font-weight="800" fill="#fff" opacity=".8">= 3×3</text>
      </g>`;
    },
    root(v){
      const n=4,size=64,cell=size/n,ox=20,oy=30;
      let grid='';
      for(let i=0;i<=n;i++){
        grid+=`<line x1="${ox+i*cell}" y1="${oy}" x2="${ox+i*cell}" y2="${oy+size}" stroke="#fff" stroke-width="1.4" opacity=".35"/>`;
        grid+=`<line x1="${ox}" y1="${oy+i*cell}" x2="${ox+size}" y2="${oy+i*cell}" stroke="#fff" stroke-width="1.4" opacity=".35"/>`;
      }
      return `<g class="pop">
        <rect x="${ox}" y="${oy}" width="${size}" height="${size}" fill="${xml(v.accent)}" opacity=".25" rx="6"/>
        ${grid}
        <text x="${ox+size/2}" y="${oy+size+18}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="800" fill="#fff">4×4=16</text>
        <text x="120" y="66" font-family="Arial" font-size="28" font-weight="900" fill="#fff">√16</text>
        <path d="M104 76 H150" stroke="${xml(v.accent)}" stroke-width="3"/>
        <text x="127" y="92" text-anchor="middle" font-family="Arial" font-size="16" font-weight="900" fill="${xml(v.accent)}">4</text>
      </g>`;
    },
    flip(v){
      return `<g>
        <text x="43" y="46" text-anchor="middle" font-family="Arial" font-size="18" font-weight="900" fill="#fff" opacity=".45">2⁻³</text>
        <path d="M70 40 H98" stroke="${xml(v.accent)}" stroke-width="4" marker-end="url(#arrow)"/>
        <rect x="104" y="30" width="42" height="60" rx="10" fill="#061713" opacity=".4"/>
        <path d="M112 58 H140" stroke="#fff" stroke-width="3"/>
        <text x="126" y="50" text-anchor="middle" font-family="Arial" font-size="15" font-weight="900" fill="#fff">1</text>
        <text x="126" y="76" text-anchor="middle" font-family="Arial" font-size="15" font-weight="900" fill="${xml(v.accent)}" class="flip">2³</text>
      </g>`;
    },
    sort(v){
      return `<g>
        <rect x="14" y="70" width="56" height="34" rx="10" fill="#fff" opacity=".16"/>
        <rect x="90" y="70" width="56" height="34" rx="10" fill="#fff" opacity=".16"/>
        <text x="42" y="93" text-anchor="middle" font-family="Arial" font-size="15" font-weight="900" fill="${xml(v.accent)}">x  x  x</text>
        <text x="118" y="93" text-anchor="middle" font-family="Arial" font-size="15" font-weight="900" fill="#fff">5  2</text>
        <circle class="float" cx="30" cy="34" r="12" fill="${xml(v.accent)}"/><text x="30" y="39" text-anchor="middle" font-family="Arial" font-size="13" font-weight="900" fill="${xml(v.bg)}">x</text>
        <circle class="float" cx="130" cy="34" r="12" fill="#fff"/><text x="130" y="39" text-anchor="middle" font-family="Arial" font-size="13" font-weight="900" fill="${xml(v.bg)}">5</text>
        <path d="M30 46 V66" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 4" opacity=".6"/>
        <path d="M130 46 V66" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 4" opacity=".6"/>
      </g>`;
    },
    distribute(v){
      return `<g>
        <circle cx="30" cy="60" r="18" fill="${xml(v.accent)}" class="glow"/>
        <text x="30" y="66" text-anchor="middle" font-family="Arial" font-size="18" font-weight="900" fill="${xml(v.bg)}">4</text>
        <path class="draw" d="M48 54 C70 40, 90 40, 106 44" stroke="#fff" stroke-width="3.5" fill="none" opacity=".8" marker-end="url(#arrow)"/>
        <path class="draw" d="M48 66 C70 82, 90 82, 106 78" stroke="#fff" stroke-width="3.5" fill="none" opacity=".8" marker-end="url(#arrow)"/>
        <rect x="106" y="30" width="44" height="26" rx="8" fill="#061713" opacity=".4"/><text x="128" y="48" text-anchor="middle" font-family="Arial" font-size="14" font-weight="900" fill="#fff">x</text>
        <rect x="106" y="66" width="44" height="26" rx="8" fill="#061713" opacity=".4"/><text x="128" y="84" text-anchor="middle" font-family="Arial" font-size="14" font-weight="900" fill="#fff">+3</text>
      </g>`;
    },
    square(v){
      const ox=20,oy=20,a=44,b=26;
      return `<g class="pop">
        <rect x="${ox}" y="${oy}" width="${a}" height="${a}" fill="${xml(v.accent)}" opacity=".9"/>
        <rect x="${ox+a}" y="${oy}" width="${b}" height="${a}" fill="#fff" opacity=".55"/>
        <rect x="${ox}" y="${oy+a}" width="${a}" height="${b}" fill="#fff" opacity=".55"/>
        <rect x="${ox+a}" y="${oy+a}" width="${b}" height="${b}" fill="#061713" opacity=".4"/>
        <text x="${ox+a/2}" y="${oy+a/2+5}" text-anchor="middle" font-family="Arial" font-size="14" font-weight="900" fill="${xml(v.bg)}">a²</text>
        <text x="${ox+a+b/2}" y="${oy+a/2+5}" text-anchor="middle" font-family="Arial" font-size="11" font-weight="900" fill="${xml(v.bg)}">ab</text>
        <text x="${ox+a/2}" y="${oy+a+b/2+5}" text-anchor="middle" font-family="Arial" font-size="11" font-weight="900" fill="${xml(v.bg)}">ab</text>
        <text x="${ox+a+b/2}" y="${oy+a+b/2+5}" text-anchor="middle" font-family="Arial" font-size="10" font-weight="900" fill="#fff">b²</text>
        <text x="126" y="60" text-anchor="middle" font-family="Arial" font-size="14" font-weight="900" fill="#fff">(a+b)²</text>
      </g>`;
    },
    formula(v){
      return `<g>
        <rect x="18" y="26" width="124" height="68" rx="14" fill="#fff" opacity=".16"/>
        <text x="80" y="54" text-anchor="middle" font-family="Arial" font-size="18" font-weight="900" fill="#fff">A = b·h/2</text>
        <circle class="pop" cx="46" cy="76" r="11" fill="${xml(v.accent)}"/><text x="46" y="80" text-anchor="middle" font-family="Arial" font-size="11" font-weight="900" fill="${xml(v.bg)}">8</text>
        <circle class="pop" cx="80" cy="76" r="11" fill="${xml(v.accent)}"/><text x="80" y="80" text-anchor="middle" font-family="Arial" font-size="11" font-weight="900" fill="${xml(v.bg)}">5</text>
        <text x="114" y="80" font-family="Arial" font-size="13" font-weight="900" fill="#fff">=20</text>
      </g>`;
    },
    balance(v){
      return `<g class="tip">
        <path d="M80 30 V50" stroke="#fff" stroke-width="4"/>
        <path d="M28 50 H132" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
        <path d="M28 50 L18 78 H50 Z" fill="${xml(v.accent)}" opacity=".85"/>
        <path d="M132 50 L112 78 H150 Z" fill="#fff" opacity=".6"/>
        <text x="34" y="72" font-family="Arial" font-size="13" font-weight="900" fill="${xml(v.bg)}">2x</text>
        <text x="122" y="72" font-family="Arial" font-size="13" font-weight="900" fill="${xml(v.bg)}">8</text>
        <rect x="66" y="86" width="28" height="14" rx="4" fill="#061713" opacity=".4"/>
      </g>`;
    },
    lines(v){
      return `<g>
        <path d="M20 20 L140 100" stroke="#fff" stroke-width="3.5" opacity=".7"/>
        <path d="M20 100 L140 20" stroke="${xml(v.accent)}" stroke-width="3.5" opacity=".9"/>
        <circle class="glow" cx="80" cy="60" r="8" fill="#fff"/>
        <text x="92" y="52" font-family="Arial" font-size="12" font-weight="900" fill="#fff">(4,3)</text>
      </g>`;
    },
    parabola(v){
      return `<g>
        <path d="M20 40 H140" stroke="#fff" stroke-width="2" opacity=".4"/>
        <path class="draw" d="M24 34 C 60 100, 100 100, 136 34" stroke="${xml(v.accent)}" stroke-width="5" fill="none"/>
        <circle cx="52" cy="40" r="5" fill="#fff"/><circle cx="108" cy="40" r="5" fill="#fff"/>
        <text x="52" y="58" text-anchor="middle" font-family="Arial" font-size="11" font-weight="900" fill="#fff">2</text>
        <text x="108" y="58" text-anchor="middle" font-family="Arial" font-size="11" font-weight="900" fill="#fff">3</text>
      </g>`;
    },
    story(v){
      return `<g>
        <path d="M14 22 h50 a10 10 0 0 1 10 10 v20 a10 10 0 0 1 -10 10 h-30 l-12 12 v-12 h-8 a10 10 0 0 1 -10 -10 v-20 a10 10 0 0 1 10 -10 Z" fill="#fff" opacity=".2"/>
        <text x="39" y="46" text-anchor="middle" font-family="Arial" font-size="18" font-weight="900" fill="#fff">?</text>
        <path class="draw" d="M80 44 H118" stroke="${xml(v.accent)}" stroke-width="3.5" marker-end="url(#arrow)"/>
        <rect x="118" y="26" width="30" height="36" rx="8" fill="#061713" opacity=".4"/>
        <text x="133" y="49" text-anchor="middle" font-family="Arial" font-size="15" font-weight="900" fill="${xml(v.accent)}">x</text>
      </g>`;
    },
    machine(v){
      return `<g>
        <path class="slide" d="M14 60 H44" stroke="#fff" stroke-width="4" marker-end="url(#arrow)"/>
        <text x="20" y="50" font-family="Arial" font-size="13" font-weight="900" fill="#fff">x</text>
        <rect x="48" y="34" width="56" height="52" rx="12" fill="${xml(v.accent)}" opacity=".9"/>
        <circle class="spin" cx="76" cy="60" r="14" fill="none" stroke="${xml(v.bg)}" stroke-width="4" stroke-dasharray="6 6"/>
        <path d="M108 60 H140" stroke="#fff" stroke-width="4" marker-end="url(#arrow)"/>
        <text x="122" y="50" font-family="Arial" font-size="13" font-weight="900" fill="#fff">y</text>
      </g>`;
    },
    plane(v){
      return `<g>
        <path d="M20 100 H140 M40 20 V110" stroke="#fff" stroke-width="2.5" opacity=".55"/>
        <circle class="pop" cx="96" cy="52" r="7" fill="${xml(v.accent)}"/>
        <path d="M96 52 V100 M40 52 H96" stroke="#fff" stroke-width="2" stroke-dasharray="3 4" opacity=".6"/>
        <text x="104" y="48" font-family="Arial" font-size="12" font-weight="900" fill="#fff">(4,3)</text>
      </g>`;
    },
    triangle(v){
      return `<g>
        <path d="M80 22 L136 100 H24 Z" fill="none" stroke="#fff" stroke-width="4"/>
        <path class="sweep" d="M80 22 a14 14 0 0 1 10 14" fill="none" stroke="${xml(v.accent)}" stroke-width="3"/>
        <path d="M24 100 a14 14 0 0 0 14 -6" fill="none" stroke="${xml(v.accent)}" stroke-width="3"/>
        <path d="M136 100 a14 14 0 0 1 -16 -4" fill="none" stroke="${xml(v.accent)}" stroke-width="3"/>
        <text x="80" y="112" text-anchor="middle" font-family="Arial" font-size="12" font-weight="900" fill="#fff">180°</text>
      </g>`;
    },
    trig(v){
      return `<g>
        <path d="M20 100 L140 100 L140 30 Z" fill="none" stroke="#fff" stroke-width="4"/>
        <path d="M126 90 h14 v-10" fill="none" stroke="${xml(v.accent)}" stroke-width="3"/>
        <text x="72" y="112" font-family="Arial" font-size="11" font-weight="900" fill="#fff">ליד</text>
        <text x="144" y="66" font-family="Arial" font-size="11" font-weight="900" fill="#fff">מול</text>
        <text x="66" y="60" font-family="Arial" font-size="11" font-weight="900" fill="${xml(v.accent)}">יתר</text>
      </g>`;
    },
    loop(v){
      return `<g class="spin-slow">
        <circle cx="80" cy="60" r="40" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="10 10" opacity=".6"/>
      </g>
      <g>
        <circle cx="80" cy="20" r="10" fill="${xml(v.accent)}"/><text x="80" y="24" text-anchor="middle" font-family="Arial" font-size="10" font-weight="900" fill="${xml(v.bg)}">✓</text>
        <circle cx="120" cy="60" r="10" fill="#fff"/><text x="120" y="64" text-anchor="middle" font-family="Arial" font-size="10" font-weight="900" fill="${xml(v.bg)}">✓</text>
        <circle cx="80" cy="100" r="10" fill="${xml(v.accent)}"/><text x="80" y="104" text-anchor="middle" font-family="Arial" font-size="10" font-weight="900" fill="${xml(v.bg)}">✓</text>
        <circle cx="40" cy="60" r="10" fill="#fff"/><text x="40" y="64" text-anchor="middle" font-family="Arial" font-size="10" font-weight="900" fill="${xml(v.bg)}">✓</text>
      </g>`;
    },
    path(v){
      return `<g>
        <path class="draw" d="M16 100 C 50 40, 90 100, 144 30" stroke="${xml(v.accent)}" stroke-width="4" fill="none" stroke-dasharray="10 8"/>
        <circle cx="16" cy="100" r="9" fill="#fff"/><text x="16" y="104" text-anchor="middle" font-family="Arial" font-size="11" font-weight="900" fill="${xml(v.bg)}">?</text>
        <circle cx="144" cy="30" r="9" fill="${xml(v.accent)}"/><text x="144" y="34" text-anchor="middle" font-family="Arial" font-size="11" font-weight="900" fill="${xml(v.bg)}">✓</text>
      </g>`;
    },
    clock(v){
      return `<g>
        <circle cx="60" cy="60" r="38" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/>
        <path class="sweep" d="M60 60 L60 28" stroke="${xml(v.accent)}" stroke-width="4" stroke-linecap="round"/>
        <path d="M60 60 L82 68" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="60" cy="60" r="4" fill="#fff"/>
        <rect x="112" y="30" width="34" height="10" rx="4" fill="#fff" opacity=".5"/>
        <rect x="112" y="50" width="34" height="10" rx="4" fill="${xml(v.accent)}" opacity=".8"/>
        <rect x="112" y="70" width="34" height="10" rx="4" fill="#fff" opacity=".3"/>
      </g>`;
    },
    mixed(v){
      const items=[['%',30,30],['x',100,30],['√',30,88],['△',100,88]];
      return `<g>
        ${items.map(([s,x,y],i)=>`<circle cx="${x}" cy="${y}" r="18" fill="${i%2?'#fff':xml(v.accent)}" opacity="${i%2?.55:.9}" class="pop"/>
        <text x="${x}" y="${y+6}" text-anchor="middle" font-family="Arial" font-size="16" font-weight="900" fill="${xml(v.bg)}">${xml(s)}</text>`).join('')}
      </g>`;
    },
    calculator(v){
      return `<g>
        <rect x="26" y="14" width="108" height="96" rx="12" fill="#061713" opacity=".55"/>
        <rect x="36" y="24" width="88" height="26" rx="6" fill="#0b2b24"/>
        <text x="114" y="42" text-anchor="end" font-family="Arial" font-size="13" font-weight="900" fill="${xml(v.accent)}" class="blink">(3+5)²</text>
        ${[0,1,2,3].map(r=>[0,1,2,3].map(c=>`<rect x="${40+c*22}" y="${58+r*12}" width="16" height="9" rx="3" fill="#fff" opacity=".22"/>`).join('')).join('')}
      </g>`;
    },
    analogy(v){
      return `<g class="float">
        <path d="M50 90 L50 58 L80 38 L110 58 L110 90 Z" fill="${xml(v.accent)}" opacity=".92"/>
        <rect x="70" y="66" width="20" height="24" fill="#061713" opacity=".45"/>
        <path d="M118 66 H144" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6" marker-end="url(#arrow)"/>
      </g>`;
    },
    generic(v){
      return `<g class="float">
        <circle cx="80" cy="60" r="40" fill="#061713" opacity=".28"/>
        <text x="80" y="72" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="900" fill="#fff">${xml(v.symbol)}</text>
      </g>`;
    }
  };

  function placeIcon(family,v,x,y,w,h){
    const scale=Math.min(w/ICON_W,h/ICON_H);
    const iw=ICON_W*scale,ih=ICON_H*scale;
    const ox=x+(w-iw)/2,oy=y+(h-ih)/2;
    const render=ICONS[family]||ICONS.generic;
    return `<g transform="translate(${ox.toFixed(1)},${oy.toFixed(1)}) scale(${scale.toFixed(3)})">${render(v)}</g>`;
  }

  function storyGraphic(kind,v,page){
    if(kind==='steps'){
      return `<g filter="url(#shadow)">
        ${[0,1,2].map(i=>`<rect x="112" y="${318+i*116}" width="496" height="86" rx="24" fill="#fff" opacity="${i===0?'.24':'.16'}"/>
        <circle cx="560" cy="${361+i*116}" r="24" fill="${xml(v.accent)}"/>
        <text x="560" y="${370+i*116}" text-anchor="middle" font-family="Arial" font-size="24" font-weight="900" fill="${xml(v.bg)}">${i+1}</text>
        <path d="M184 ${361+i*116} H500" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".42"/>`).join('')}
      </g>`;
    }
    if(kind==='example'){
      return `<g filter="url(#shadow)" class="float">
        <rect x="92" y="312" width="536" height="250" rx="34" fill="#fff" opacity=".2"/>
        <rect x="126" y="348" width="468" height="178" rx="24" fill="#061713" opacity=".38"/>
        <path class="draw" d="M168 474 C260 390, 362 548, 544 410" fill="none" stroke="${xml(v.accent)}" stroke-width="12" stroke-linecap="round"/>
      </g>`;
    }
    if(kind==='trap'){
      return `<g filter="url(#shadow)" class="pop">
        <path d="M360 250 L586 612 H134 Z" fill="#fff" opacity=".2"/>
        <path d="M360 304 L526 580 H194 Z" fill="${xml(v.accent)}" opacity=".95"/>
        <text x="360" y="505" text-anchor="middle" font-family="Arial" font-size="132" font-weight="900" fill="${xml(v.bg)}">!</text>
      </g>`;
    }
    if(kind==='practice'){
      return `<g filter="url(#shadow)">
        <rect x="118" y="294" width="484" height="302" rx="36" fill="#fff" opacity=".2"/>
        ${[0,1,2].map(i=>`<rect x="168" y="${354+i*72}" width="46" height="46" rx="13" fill="#fff" opacity=".22"/>
        <path d="M178 ${376+i*72} l12 13 l28 -32" fill="none" stroke="${xml(v.accent)}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M246 ${378+i*72} H520" stroke="#fff" stroke-width="11" stroke-linecap="round" opacity=".42"/>`).join('')}
      </g>`;
    }
    if(kind==='idea'){
      return `<g filter="url(#shadow)" class="float">
        <circle cx="360" cy="384" r="142" fill="#fff" opacity=".18"/>
        <path d="M306 402 C300 332, 348 286, 404 316 C462 348, 444 418, 404 452 L404 498 H316 L316 454 C306 442 300 426 306 402 Z" fill="${xml(v.accent)}" opacity=".95"/>
        <rect x="316" y="514" width="88" height="18" rx="9" fill="#fff" opacity=".62"/>
        <rect x="328" y="544" width="64" height="16" rx="8" fill="#fff" opacity=".45"/>
      </g>`;
    }
    if(kind==='analogy'){
      return `<g filter="url(#shadow)" class="float">
        <rect x="120" y="330" width="480" height="230" rx="30" fill="#fff" opacity=".18"/>
        <path d="M210 470 L210 400 L270 358 L330 400 L330 470 Z" fill="${xml(v.accent)}" opacity=".92"/>
        <rect x="248" y="418" width="44" height="52" fill="#061713" opacity=".42"/>
        <path d="M366 428 H510" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".5"/>
        <circle cx="532" cy="428" r="28" fill="${xml(v.accent)}"/>
      </g>`;
    }
    // 'hero' and any other kind: real per-chapter topic illustration
    return `<g filter="url(#shadow)">
      <rect x="112" y="282" width="496" height="282" rx="42" fill="#fff" opacity=".18"/>
      ${placeIcon(familyFor(page),v,168,300,384,246)}
    </g>`;
  }

  function storyArt(page,slide,index=0){
    const v=visualFor(page),title=cleanTitle(page),chapter=page&&page.chapter?`פרק ${page.chapter}`:'מסלול';
    const s=slide||storySlides(page)[0]||{};
    const total=(storySlides(page)||[]).length||6;
    const titleLines=wrap(s.title||title,18,2);
    const formulaLines=wrap(s.formula||v.formula,24,2);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
      ${commonDefs(v)}
      <rect width="720" height="1280" fill="url(#bg)"/>
      <rect width="720" height="1280" fill="url(#light)"/>
      <g opacity=".13">
        <path d="M70 210 H650 M70 330 H650 M70 450 H650 M70 570 H650 M70 690 H650" stroke="#fff" stroke-width="2"/>
        <path d="M160 160 V760 M300 160 V760 M440 160 V760 M580 160 V760" stroke="#fff" stroke-width="2"/>
      </g>
      <circle class="glow" cx="128" cy="162" r="128" fill="#fff" opacity=".18"/>
      <circle cx="650" cy="742" r="200" fill="#000" opacity=".11"/>
      <path class="draw" d="M58 704 C 206 520, 352 850, 660 590" fill="none" stroke="${xml(v.accent)}" stroke-width="13" stroke-linecap="round" opacity=".52"/>
      <rect x="88" y="82" width="544" height="66" rx="33" fill="#fff" opacity=".16"/>
      <text x="360" y="124" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" font-weight="900" fill="#fff" direction="rtl">${xml(chapter)} · ${xml(s.badge||v.tag)}</text>
      ${storyGraphic(s.kind,v,page)}
      <g filter="url(#shadow)">
        <rect x="76" y="674" width="568" height="132" rx="30" fill="#061713" opacity=".36"/>
        ${textBlock(formulaLines,360,742,46,52,v.accent,'900')}
      </g>
      ${textBlock(titleLines,360,900,54,60,'#fff','900')}
      <g opacity=".78">
        <rect x="158" y="990" width="404" height="74" rx="37" fill="#061713" opacity=".36"/>
        <text x="360" y="1037" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="${xml(v.accent)}" direction="rtl">שקופית ${index+1} מתוך ${total}</text>
      </g>
      <text x="360" y="1212" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" font-weight="800" fill="#fff" opacity=".72" direction="rtl">מתמטיקה לחרדים · מסלול ווצאפ · ${xml(index+1)}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function chapterArt(page,mode){
    const v=visualFor(page),title=cleanTitle(page),chapter=page&&page.chapter?`פרק ${page.chapter}`:'מסלול';
    const story=mode==='story',wide=mode==='wide';
    if(story)return storyArt(page,storySlides(page)[0],0);
    const w=wide?640:220,h=wide?300:220,cx=w/2;
    const family=familyFor(page);
    if(!wide){
      // thumb: small, icon fills almost the whole tile, no text needed at this size
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        ${commonDefs(v)}
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#light)"/>
        <circle cx="${w*.16}" cy="${h*.16}" r="${w*.22}" fill="#fff" opacity=".13"/>
        <circle cx="${w*.86}" cy="${h*.88}" r="${w*.28}" fill="#000" opacity=".12"/>
        ${placeIcon(family,v,w*.08,h*.08,w*.84,h*.84)}
        <circle cx="${w*.86}" cy="${h*.16}" r="${w*.09}" fill="#061713" opacity=".45"/>
        <text x="${w*.86}" y="${h*.16+4}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${w*.09}" font-weight="900" fill="#fff">${xml(page&&page.chapter||'★')}</text>
      </svg>`;
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      ${commonDefs(v)}
      <rect width="${w}" height="${h}" rx="28" fill="url(#bg)"/>
      <rect width="${w}" height="${h}" rx="28" fill="url(#light)"/>
      <circle cx="${w*.18}" cy="${h*.18}" r="70" fill="#fff" opacity=".13"/>
      <circle cx="${w*.84}" cy="${h*.82}" r="92" fill="#000" opacity=".12"/>
      <rect x="${w*.13}" y="20" width="${w*.74}" height="38" rx="19" fill="#fff" opacity=".16"/>
      <text x="${cx}" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="900" fill="#fff" direction="rtl">${xml(chapter)} · ${xml(v.tag)}</text>
      <g filter="url(#shadow)">${placeIcon(family,v,70,64,500,142)}</g>
      <g filter="url(#shadow)">
        <rect x="64" y="214" width="512" height="46" rx="18" fill="#061713" opacity=".38"/>
        <text x="${cx}" y="244" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="${xml(v.accent)}">${xml(v.formula)}</text>
      </g>
      <text x="${cx}" y="284" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="900" fill="#fff" opacity=".88" direction="rtl">${xml(title)}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  window.MATHBRO_VISUALS={visualFor,statusText,storySlides,storyArt,chapterArt,cleanTitle};
})();
