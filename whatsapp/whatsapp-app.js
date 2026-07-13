(function(){
  'use strict';

  const pages=Array.isArray(window.MATHBRO_PAGES)?window.MATHBRO_PAGES:[];
  const lessonContent=window.MATHBRO_LESSONS||{};
  const visuals=window.MATHBRO_VISUALS||{};
  const chapterPages=pages.filter(p=>Number.isFinite(p.chapter));
  const INITIAL_LESSON_LIMIT=24;
  const $=id=>document.getElementById(id);
  const els={
    list:$('lessonList'),search:$('lessonSearch'),resultCount:$('resultCount'),showMore:$('showMoreBtn'),
    continueBtn:$('continueBtn'),examStart:$('examStartBtn'),bannerStart:$('bannerStartBtn'),progressText:$('progressText'),progressPercent:$('progressPercent'),progressBar:$('progressBar'),
    messages:$('messages'),chatTitle:$('chatTitle'),chatStatus:$('chatStatus'),chatAvatar:document.querySelector('#chatView .contact-avatar'),openLesson:$('openLessonLink'),doneBtn:$('doneBtn'),waContact:$('waContactLink'),
    backBtn:$('backBtn'),composer:$('composer'),input:$('messageInput'),toast:$('toast'),statusList:$('statusList'),
    statusModal:$('statusModal'),statusViewer:$('statusViewer'),statusBars:$('statusBars'),statusIcon:$('statusIcon'),statusPhoto:$('statusPhoto'),
    statusTitle:$('statusModalTitle'),statusText:$('statusModalText'),statusTime:$('statusTime'),statusOwnerName:$('statusOwnerName'),statusClose:$('statusClose'),statusPrev:$('statusPrev'),statusNext:$('statusNext'),
    statusLearn:$('statusLearn')
  };

  const STORAGE={done:'mathbro-done',current:'mathbro-current-v2',level:'mathbro-level-v2',learning:'mathbro-learning-v3',exam:'mathbro-exam-v1'};
  function readDone(){try{return new Set(JSON.parse(localStorage.getItem(STORAGE.done)||'[]'))}catch(e){return new Set()}}
  function readLearning(){try{return JSON.parse(localStorage.getItem(STORAGE.learning)||'{}')}catch(e){return {}}}
  const state={
    done:readDone(),current:null,messages:[],busy:false,filter:'all',query:'',showAll:false,level:localStorage.getItem(STORAGE.level)||'new',statusIndex:0,statusSlide:0,exam:null,
    learning:readLearning(),currentQuiz:null
  };

  function save(){
    localStorage.setItem(STORAGE.done,JSON.stringify([...state.done]));
    if(state.current)localStorage.setItem(STORAGE.current,state.current.file);
    localStorage.setItem(STORAGE.level,state.level);
    localStorage.setItem(STORAGE.learning,JSON.stringify(state.learning));
  }

  function memoryFor(file){
    if(!state.learning[file])state.learning[file]={asked:[],correct:0,wrong:0,stage:'start',example:0};
    return state.learning[file];
  }
  function setStage(stage){if(!state.current)return;memoryFor(state.current.file).stage=stage;save()}

  function escapeHtml(value){
    const safe=String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    return safe.replace(/(?<![\d/])(\d{1,3})\/(\d{1,3})(?!\d)/g,'<span class="frac"><i>$1</i><em>$2</em></span>');
  }
  function cleanTitle(p){
    return String(p&&p.title||'נושא חדש')
      .replace(/\s*·\s*מתמטיקה לחרדים.*$/,'')
      .replace(/^פרק\s*\d+[:：]?\s*/,'')
      .trim();
  }
  function pageLabel(p){return p.chapter?`פרק ${p.chapter}`:'כלי'}
  function lessonUrl(p){return `lesson.html?file=${encodeURIComponent(p.file)}`}
  function chapterArt(p,mode){return visuals.chapterArt?visuals.chapterArt(p,mode):''}
  function chapterStatusText(p){return visuals.statusText?visuals.statusText(p,lessonContent[p&&p.file]):packFor(p).beginner}
  function pageText(p){return `${p.title||''} ${p.group||''} ${p.level||''}`.toLowerCase()}
  function categoryFor(p){
    const t=pageText(p);
    if(/משווא|מילול|פונקציה|גרף|גיאומטר/.test(t))return 'equations';
    if(/סוגריים|כינוס|אלגבר/.test(t))return 'algebra';
    return 'basic';
  }

  const knowledge={
    basic:{
      simple:'המטרה היא לא לשנן נוסחה בעל פה. לומדים למה הכלל עובד, מתי משתמשים בו ואיך בודקים שהתשובה הגיונית.',
      location:'הנושא הזה חוזר כמעט בכל שאלה בבחינה — כטכניקת עזר לפני שמגיעים לתרגיל המרכזי.',
      case:'תלמיד מקבל תרגיל ומזדרז לפתור בלי לעצור לרגע ולבדוק באיזה כלל להשתמש קודם. זו הסיבה השכיחה ביותר לטעויות.',
      checks:['זהה איזו טכניקה נדרשת','כתוב את השלב הראשון בברור','בדוק כל שלב לפני שממשיכים','הצב תשובה בחזרה כדי לוודא'],
      warning:'טעות בסימן (פלוס/מינוס) היא הטעות הנפוצה ביותר במבחנים. תמיד עוברים שוב על הסימנים לפני שממשיכים.',
      terms:['כלל','שלב','בדיקה','הצבה'],
      quiz:{q:'מה כדאי לעשות לפני שממשיכים לשלב הבא בתרגיל?',options:['לנחש ולהמשיך','לבדוק שהשלב הנוכחי נכון','לדלג לתשובה הסופית','להתעלם מהסימנים'],correct:1,why:'בדיקה של כל שלב מונעת טעות שתתגלגל לכל התרגיל.'}
    },
    algebra:{
      simple:'ביטוי אלגברי הוא צירוף של מספרים ואותיות. כדי לפשט אותו, מטפלים בסוגריים ובאיברים דומים לפי כללים קבועים.',
      location:'זו טכניקת הבסיס לכל שאלה עם x — פתיחת סוגריים וכינוס איברים מופיעים כמעט בכל תרגיל אלגברה.',
      case:'תלמיד פותח סוגריים אבל שוכח להכפיל את כל האיבר השני בסוגריים, לא רק את הראשון.',
      checks:['הכפל את המספר שלפני הסוגריים בכל איבר בפנים','שים לב לסימן שלפני הסוגריים','אסוף איברים דומים (אותה אות ואותה חזקה)','בדוק על ידי הצבת מספר'],
      warning:'מינוס לפני סוגריים הופך את כל הסימנים בפנים. זו הטעות הכי נפוצה בפתיחת סוגריים.',
      terms:['ביטוי','איבר','מקדם','כינוס'],
      quiz:{q:'מה קורה כשיש מינוס לפני סוגריים ופותחים אותם?',options:['שום דבר לא משתנה','כל הסימנים בפנים מתהפכים','רק הסימן הראשון משתנה','מוסיפים מינוס בסוף'],correct:1,why:'מינוס לפני סוגריים שווה ערך להכפלה ב-(-1), שהופכת את כל הסימנים.'}
    },
    equations:{
      simple:'משוואה היא כמו מאזניים מאוזנים. כל פעולה שעושים בצד אחד חייבים לעשות באותה מידה בצד השני, כדי לשמור על האיזון.',
      location:'משוואות מופיעות בכל פרק — מבעיות מילוליות ועד גיאומטריה וטריגונומטריה.',
      case:'תלמיד מעביר איבר לצד השני ושוכח להפוך את הסימן שלו.',
      checks:['בודד את האיבר עם x בצד אחד','מה שעובר לצד השני — הופך סימן (או הופך פעולה)','פשט כל צד בנפרד לפני שמעבירים איברים','הצב את התשובה במשוואה המקורית לבדיקה'],
      warning:'כשמחלקים את שני הצדדים במספר שלילי — לא משנה סימן אי-שוויון (אלא אם זו אי-שוויון, לא משוואה רגילה).',
      terms:['משוואה','נעלם','איזון','הצבה'],
      quiz:{q:'איך בודקים שפתרון משוואה נכון?',options:['משווים לתשובה של חבר','מציבים את הפתרון חזרה במשוואה המקורית','מסתכלים אם המספר "נראה הגיוני"','לא בודקים, ממשיכים הלאה'],correct:1,why:'הצבה חזרה במשוואה המקורית מוכיחה בוודאות שהפתרון נכון.'}
    }
  };

  function packFor(p){
    const fallback=knowledge[categoryFor(p)]||knowledge.basic;
    const lesson=lessonContent[p&&p.file];
    if(!lesson)return {...fallback,beginner:fallback.simple,advanced:fallback.simple,examples:[fallback.case],questions:[fallback.quiz],diagram:fallback.terms,challenge:`הסבר במילים שלך את ${cleanTitle(p)} ומה בודקים קודם.`};
    return {...fallback,...lesson,simple:state.level==='some'?lesson.advanced:lesson.beginner,case:lesson.case||lesson.examples[0],quiz:lesson.questions[0]};
  }
  function actionsHtml(actions){
    if(!actions||!actions.length)return '';
    return `<div class="bubble-actions">${actions.map((a,i)=>`<button type="button" class="${i===0?'primary ':''}${a.wide?'wide':''}" data-action="${escapeHtml(a.action)}">${escapeHtml(a.label)}</button>`).join('')}</div>`;
  }
  function listHtml(items){return `<ul class="message-list">${items.map((x,i)=>`<li><b>${i+1}.</b><span>${escapeHtml(x)}</span></li>`).join('')}</ul>`}
  function termsHtml(items){return `<div class="term-row">${items.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>`}
  function diagramHtml(items){return `<div class="flow-diagram">${items.map((x,i)=>`<span class="flow-step"><i>${i+1}</i>${escapeHtml(x)}</span>`).join('<b aria-hidden="true">←</b>')}</div>`}
  function conceptHtml(p,pack){
    const deep=pack.deep||{};
    return `<div class="concept-card">
      <div class="concept-media">
        <img src="${escapeHtml(chapterArt(p,'wide'))}" alt="">
        <div class="concept-pulse" aria-hidden="true"></div>
      </div>
      <div class="concept-copy">
        <span>תמונה שמסבירה את הרעיון</span>
        <b>${escapeHtml(deep.hook||pack.simple)}</b>
        <p>${escapeHtml(deep.why||pack.advanced||pack.beginner)}</p>
        ${pack.examples&&pack.examples[0]?`<p class="micro-copy"><b>דוגמה:</b> ${escapeHtml(pack.examples[0])}</p>`:''}
        ${pack.fact?`<p class="micro-copy fun-fact"><b>עובדה מעניינת:</b> ${escapeHtml(pack.fact)}</p>`:''}
      </div>
    </div>`;
  }
  function insightHtml(pack){
    const deep=pack.deep||{};
    return `<div class="insight-grid">
      <div><b>כלל לזכור</b><span>${escapeHtml(deep.memory||pack.checks[0])}</span></div>
      <div><b>מלכודת</b><span>${escapeHtml(deep.trap||pack.warning)}</span></div>
    </div>`;
  }
  function walkthroughHtml(pack){
    const steps=pack.walkthrough&&pack.walkthrough.length?pack.walkthrough:pack.checks.map((text,i)=>({title:`שלב ${i+1}`,text,formula:''}));
    return `<div class="coach-steps">${steps.map((step,i)=>`<div class="coach-step" style="--d:${i}">
      <i>${i+1}</i>
      <div><b>${escapeHtml(step.title)}</b><span>${escapeHtml(step.text)}</span>${step.formula?`<code>${escapeHtml(step.formula)}</code>`:''}</div>
    </div>`).join('')}</div>`;
  }
  function practiceHtml(pack){
    const tasks=pack.practice&&pack.practice.length?pack.practice:[pack.challenge];
    return `<div class="practice-set">${tasks.map((task,i)=>`<div class="practice-card"><span>תרגיל ${i+1}</span><b>${escapeHtml(task)}</b></div>`).join('')}</div>`;
  }
  function messageHtml(message){
    const speaker=message.who==='user'?'נקרא ✓✓':(message.speaker||currentOwnerName());
    return `<article class="bubble ${message.who}">${message.html}${actionsHtml(message.actions)}<time>${escapeHtml(speaker)} · עכשיו</time></article>`;
  }
  function renderMessages(){
    const typer=currentOwnerName();
    const typing=state.busy?`<div class="typing-bubble" aria-label="${escapeHtml(typer)} מקליד תשובה"><span>${escapeHtml(typer)} מקליד</span><div class="dots"><i></i><i></i><i></i></div></div>`:'';
    els.messages.innerHTML='<div class="day-label">היום · מסלול ווצאפ</div>'+state.messages.map(messageHtml).join('')+typing;
    requestAnimationFrame(()=>{els.messages.scrollTop=els.messages.scrollHeight});
    setTimeout(()=>{els.messages.scrollTop=els.messages.scrollHeight},90);
  }
  function pushUser(text){state.messages.push({who:'user',html:`<p>${escapeHtml(text)}</p>`});renderMessages()}
  async function pushBot(html,actions=[],delay=700){
    if(state.busy)return;
    state.busy=true;renderMessages();
    await new Promise(resolve=>setTimeout(resolve,delay));
    state.busy=false;state.messages.push({who:'bot',html,actions,speaker:currentOwnerName()});renderMessages();
  }

  function realContactBannerHtml(p){
    const c=contactForPage(p),link=waLinkForPage(p);
    if(!c||!link)return '';
    return `<a class="real-contact-banner" href="${escapeHtml(link)}" target="_blank" rel="noopener">
      <span class="real-contact-ico">💬</span>
      <span class="real-contact-copy"><b>המשיכו איתי בוואטסאפ האמיתי</b><span>${escapeHtml(c.name)} עונה שם על שאלות אמיתיות בזמן אמת</span></span>
      <span class="real-contact-arr">›</span>
    </a>`;
  }
  function openingFor(p){
    const topic=cleanTitle(p),pack=packFor(p),owner=ownerForPage(p);
    return `<img class="message-visual" src="${escapeHtml(chapterArt(p,'wide'))}" alt="תמונת פרק ${escapeHtml(topic)}"><span class="message-tag">${escapeHtml(pageLabel(p))} · ${escapeHtml(p.group||'מסלול')}</span><h3>${escapeHtml(topic)}</h3><p>אני ${escapeHtml(owner)}. נלמד את הנושא דרך דוגמה אמיתית מהבחינה, בקצב שלך.</p>${realContactBannerHtml(p)}<p><b>מה רמת הידע שלך בנושא?</b></p>${termsHtml(pack.terms)}`;
  }
  function startConversation(){
    const p=state.current,memory=memoryFor(p.file),hasProgress=memory.stage!=='start';
    state.currentQuiz=null;
    const progressNote=hasProgress?`<div class="return-note"><b>זוכר אותך.</b> עצרת בשלב ${stageLabel(memory.stage)} ויש לך ${memory.correct} תשובות נכונות בפרק.</div>`:'';
    state.messages=[{who:'bot',html:openingFor(p)+progressNote,speaker:ownerForPage(p),actions:hasProgress?[
      {label:'המשך מאיפה שעצרתי',action:'continue'},
      {label:'הסבר עם תמונה',action:'deep'},
      {label:'צעד־צעד',action:'steps'},
      {label:'דוגמה מהחיים',action:'analogy'},
      {label:'תרגול קצר',action:'practice'},
      {label:'התחל מחדש',action:'restart'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ]:[
      {label:'הסבר עם תמונה',action:'deep'},
      {label:'למד אותי צעד־צעד',action:'steps'},
      {label:'אני מתחיל מאפס',action:'start-new'},
      {label:'אני מכיר קצת',action:'start-some'},
      {label:'דוגמה מהחיים',action:'analogy'},
      {label:'תרגול קצר',action:'practice'},
      {label:'בחן אותי קודם',action:'quiz',wide:true}
    ]}];
    renderMessages();
  }

  function stageLabel(stage){return ({deep:'הסבר תמונתי',steps:'צעד־צעד',practice:'תרגול',explain:'הסבר',example:'דוגמה',analogy:'דוגמה מהחיים',diagram:'מפת התהליך',checks:'בדיקה',challenge:'אתגר',quiz:'שאלה',summary:'סיכום',complete:'סיום'})[stage]||'התחלה'}

  function setHeader(){
    const p=state.current;if(!p)return;
    const contact=contactForPage(p),owner=ownerForPage(p);
    els.chatTitle.textContent=p.chapter?`פרק ${p.chapter}: ${cleanTitle(p)}`:cleanTitle(p);
    els.chatStatus.textContent=`${owner} מחובר · ${p.group||'מסלול לימוד'}`;
    if(els.chatAvatar)els.chatAvatar.textContent=owner.charAt(0)||'ר';
    if(els.input)els.input.placeholder=`שאל את ${owner} על הפרק`;
    if(els.waContact){
      const link=waLinkForPage(p);
      els.waContact.href=link||'#';
      els.waContact.hidden=!contact;
      if(contact){
        els.waContact.title=`נציג אמיתי: שלחו הודעה ל${contact.name} בוואטסאפ`;
        els.waContact.setAttribute('aria-label',els.waContact.title);
      }
    }
    els.openLesson.href=lessonUrl(p);
    els.doneBtn.classList.toggle('is-done',state.done.has(p.file));
    els.doneBtn.textContent=state.done.has(p.file)?'✓':'○';
    document.dispatchEvent(new CustomEvent('lesson:changed',{detail:{file:p.file}}));
  }
  function selectLesson(p,openChat=true){
    if(!p)return;
    state.current=p;save();setHeader();startConversation();renderLessonList();
    if(openChat&&matchMedia('(max-width:760px)').matches)document.body.classList.add('chat-open');
  }
  function nextLesson(){
    if(!chapterPages.length)return pages[0];
    const currentIndex=chapterPages.findIndex(p=>state.current&&p.file===state.current.file);
    for(let offset=1;offset<=chapterPages.length;offset++){
      const candidate=chapterPages[(Math.max(currentIndex,0)+offset)%chapterPages.length];
      if(!state.done.has(candidate.file))return candidate;
    }
    return chapterPages[(Math.max(currentIndex,0)+1)%chapterPages.length];
  }

  async function explain(level){
    const pack=packFor(state.current),topic=cleanTitle(state.current);
    state.level=level;setStage('explain');
    const intro=level==='new'?'תסביר לי מאפס':'אני מכיר קצת, תן לי את העיקר';
    const explanation=level==='new'?pack.beginner:pack.advanced;
    pushUser(intro);
    await pushBot(`<span class="message-tag">${level==='new'?'בגובה העיניים':'עולים רמה'}</span><p><b>${escapeHtml(topic)}:</b> ${escapeHtml(explanation)}</p>`,[
      {label:'למה זה עובד?',action:'deep'},
      {label:'צעד־צעד',action:'steps'},
      {label:'תן דוגמה נוספת',action:'example'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ]);
  }
  async function showDeep(){
    const p=state.current,pack=packFor(p);setStage('deep');pushUser('תסביר לי עם תמונה');
    await pushBot(`<span class="message-tag">הבנה אמיתית</span>${conceptHtml(p,pack)}${insightHtml(pack)}<p class="micro-copy">המטרה כאן היא שתדע להסביר את הכלל במילים שלך, לא רק לזכור פעולה טכנית.</p>`,[
      {label:'דוגמה מהחיים',action:'analogy'},
      {label:'עכשיו צעד־צעד',action:'steps'},
      {label:'תן דוגמה',action:'example'},
      {label:'תרגול קצר',action:'practice',wide:true}
    ],750);
  }
  async function showAnalogy(){
    const pack=packFor(state.current);setStage('analogy');pushUser('תן לי דוגמה מהחיים');
    await pushBot(`<span class="message-tag">ככה זה נראה מחוץ למחברת</span><div class="life-note"><b>דוגמה מהחיים</b><p>${escapeHtml(pack.real||pack.beginner)}</p></div><p class="micro-copy">אם אתה זוכר את התמונה מהחיים, קל יותר לזכור גם את הכלל המתמטי מאחוריה.</p>`,[
      {label:'עכשיו צעד־צעד',action:'steps'},
      {label:'תן דוגמה מהמבחן',action:'example'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ],700);
  }
  async function showStepCoach(){
    const pack=packFor(state.current);setStage('steps');pushUser('למד אותי צעד־צעד');
    await pushBot(`<span class="message-tag">${escapeHtml(currentOwnerName())} מפרק את זה לשלבים</span>${walkthroughHtml(pack)}<p class="micro-copy">קרא שלב, עצור רגע, ואז עבור לשלב הבא. ככה בונים הרגל פתרון.</p>`,[
      {label:'תן לי תרגול',action:'practice'},
      {label:'מה הטעות הנפוצה?',action:'safety'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ],750);
  }
  async function showPracticeSet(){
    const pack=packFor(state.current);setStage('practice');pushUser('תן לי תרגול קצר');
    await pushBot(`<span class="message-tag">תרגול מודרך</span><p>נסה לפתור את התרגילים האלה בלי למהר. אם נתקעת, חזור לשלבי העבודה מעל.</p>${practiceHtml(pack)}`,[
      {label:'אני רוצה פתרון דרך',action:'steps'},
      {label:'עוד שאלות אמריקאיות',action:'quiz'},
      {label:'סיכום לפני מעבר',action:'summary',wide:true}
    ],750);
  }
  async function showExample(){
    const pack=packFor(state.current),memory=memoryFor(state.current.file),examples=pack.examples||[pack.case];
    const example=examples[memory.example%examples.length];memory.example+=1;setStage('example');pushUser('תן לי דוגמה נוספת');
    await pushBot(`<span class="message-tag">תרגיל לדוגמה · ${((memory.example-1)%examples.length)+1}/${examples.length}</span><p>${escapeHtml(example)}</p>`,[
      {label:'תסביר את הדרך',action:'steps'},
      {label:'מה בודקים עכשיו?',action:'checks'},
      {label:'אתגר קצר',action:'challenge',wide:true}
    ]);
  }
  async function showDiagram(){
    const pack=packFor(state.current);setStage('diagram');pushUser('תראה לי איך זה עובד');
    await pushBot(`<span class="message-tag">מפת התהליך</span>${diagramHtml(pack.diagram||pack.terms)}<p class="micro-copy">עקוב אחרי השלבים מימין לשמאל. כשיש טעות, בודקים באיזה שלב היא נכנסה.</p>`,[
      {label:'מקרה אמיתי',action:'example'},
      {label:'איך בודקים?',action:'checks'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ]);
  }
  async function showChallenge(){
    const pack=packFor(state.current);setStage('challenge');pushUser('תן לי אתגר קצר');
    await pushBot(`<span class="message-tag">דקה לחשוב כמו פותר מבחנים</span><div class="challenge-box"><b>המשימה שלך</b><p>${escapeHtml(pack.challenge)}</p></div>`,[
      {label:'כתבתי תשובה',action:'checks'},
      {label:'תן לי כיוון',action:'example'},
      {label:'עבור לשאלה',action:'quiz',wide:true}
    ]);
  }
  async function showChecks(){
    const pack=packFor(state.current);setStage('checks');pushUser('איך בודקים את זה?');
    await pushBot(`<span class="message-tag">סדר בדיקה</span>${listHtml(pack.checks)}<div class="safety-note"><b>חשוב:</b> ${escapeHtml(pack.warning)}</div>`,[
      {label:'בחן אותי',action:'quiz'},
      {label:'סיכום קצר',action:'summary'},
      {label:'מפת התהליך',action:'diagram',wide:true}
    ]);
  }
  async function showLocation(){
    const pack=packFor(state.current);setStage('location');pushUser('איפה זה מופיע בבחינה?');
    await pushBot(`<span class="message-tag">איפה זה פוגש אותך</span><p>${escapeHtml(pack.location)}</p>`,[
      {label:'איך בודקים?',action:'checks'},
      {label:'מה הטעות הנפוצה?',action:'safety'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ]);
  }
  async function showSafety(){
    const pack=packFor(state.current);setStage('safety');pushUser('מה הטעות הכי נפוצה כאן?');
    await pushBot(`<span class="message-tag">שימו לב לזה</span><div class="safety-note">${escapeHtml(pack.warning)}</div>`,[
      {label:'הבנתי, תמשיך',action:'checks'},
      {label:'סיכום קצר',action:'summary'}
    ]);
  }
  function quizForCurrent(){
    const pack=packFor(state.current),questions=pack.questions||[pack.quiz],memory=memoryFor(state.current.file);
    let available=questions.map((_,i)=>i).filter(i=>!memory.asked.includes(i));
    if(!available.length){memory.asked=[];available=questions.map((_,i)=>i)}
    const index=available[0];
    state.currentQuiz={file:state.current.file,index};
    save();
    return {quiz:questions[index],index,total:questions.length};
  }
  async function showQuiz(){
    const {quiz,index,total}=quizForCurrent();setStage('quiz');
    if(!state.messages.some(m=>m.html&&m.html.includes('בדיקת הבנה')))pushUser('בחן אותי');
    const options=`<div class="quiz-options">${quiz.options.map((option,i)=>`<button type="button" data-quiz="${i}">${escapeHtml(option)}</button>`).join('')}</div>`;
    await pushBot(`<span class="message-tag">בדיקת הבנה · שאלה ${index+1}/${total}</span><p><b>${escapeHtml(quiz.q)}</b></p>${options}`,[],650);
  }
  async function answerQuiz(index){
    if(!state.currentQuiz||state.currentQuiz.file!==state.current.file)return;
    const pack=packFor(state.current),questions=pack.questions||[pack.quiz],quizIndex=state.currentQuiz.index,quiz=questions[quizIndex],choice=quiz.options[index];
    state.currentQuiz=null;
    pushUser(choice);
    const correct=index===quiz.correct,memory=memoryFor(state.current.file);
    if(!memory.asked.includes(quizIndex))memory.asked.push(quizIndex);
    if(correct)memory.correct+=1;else memory.wrong+=1;
    save();
    await pushBot(`<div class="feedback ${correct?'good':'try'}"><b>${correct?'בדיוק.':'כמעט.'}</b> ${escapeHtml(quiz.why)}</div>`,[
      {label:correct?'עוד שאלה':'הסבר ממוקד',action:correct?'quiz':'remediate'},
      {label:correct?'סיכום המשימה':'נסה שאלה אחרת',action:correct?'summary':'quiz'}
    ],600);
  }
  function readExamStats(){try{return JSON.parse(localStorage.getItem(STORAGE.exam)||'{}')}catch(e){return {}}}
  function saveExamStats(result){
    const stats=readExamStats();
    stats.count=(stats.count||0)+1;
    stats.last=result;
    if(!stats.best||result.percent>stats.best.percent)stats.best=result;
    localStorage.setItem(STORAGE.exam,JSON.stringify(stats));
    return stats;
  }
  function examQuestionPool(){
    const pool=[];
    chapterPages.forEach(p=>{
      const pack=packFor(p),questions=pack.questions||[pack.quiz];
      questions.forEach((quiz,index)=>{
        if(quiz&&quiz.q&&Array.isArray(quiz.options)&&Number.isFinite(quiz.correct)){
          pool.push({page:p,quiz,index,route:routeForPage(p)});
        }
      });
    });
    return pool;
  }
  function pickExamQuestions(){
    const pool=examQuestionPool(),selected=[],used=new Set(),stats=readExamStats(),start=((stats.count||0)*7)%Math.max(pool.length,1);
    ['zero','fractions','algebra','equations','calculator'].forEach(route=>{
      const item=pool.find((x,i)=>i>=start&&x.route===route&&!used.has(`${x.page.file}:${x.index}`))||pool.find(x=>x.route===route&&!used.has(`${x.page.file}:${x.index}`));
      if(item){selected.push(item);used.add(`${item.page.file}:${item.index}`)}
    });
    for(let offset=0;selected.length<10&&offset<pool.length*2;offset++){
      const item=pool[(start+offset)%pool.length],key=`${item.page.file}:${item.index}`;
      if(!used.has(key)){selected.push(item);used.add(key)}
    }
    return selected.slice(0,10);
  }
  function formatExamTime(ms){
    const seconds=Math.max(1,Math.round(ms/1000)),m=Math.floor(seconds/60),s=String(seconds%60).padStart(2,'0');
    return `${m}:${s}`;
  }
  function examMeterHtml(exam){
    const total=exam.questions.length,answered=exam.answers.length,percent=Math.round(answered/total*100);
    return `<div class="exam-meter"><b>שאלה ${Math.min(answered+1,total)} מתוך ${total}</b><div class="exam-track"><i style="width:${percent}%"></i></div></div>`;
  }
  function examBreakdownHtml(answers){
    const groups={};
    answers.forEach(a=>{const key=a.group||'כללי';if(!groups[key])groups[key]={total:0,correct:0};groups[key].total+=1;if(a.ok)groups[key].correct+=1});
    return `<div class="exam-breakdown">${Object.keys(groups).map(key=>`<div class="exam-row"><b>${groups[key].correct}/${groups[key].total}</b><span>${escapeHtml(key)}<em>${groups[key].total-groups[key].correct?`${groups[key].total-groups[key].correct} שאלות לחזרה`:'נקי מטעויות'}</em></span></div>`).join('')}</div>`;
  }
  function examWrongHtml(wrong){
    if(!wrong.length)return '<div class="exam-row"><b>✓</b><span>אין טעויות במבחן הזה.<em>אפשר לעבור למבחן חדש או להמשיך לפרק הבא.</em></span></div>';
    return wrong.map((a,i)=>`<div class="exam-row wrong"><b>${i+1}</b><span>${escapeHtml(a.title)} · ${escapeHtml(a.question)}<em>סימנת: ${escapeHtml(a.choice)} · נכון: ${escapeHtml(a.correctAnswer)}</em><em>${escapeHtml(a.why)}</em></span></div>`).join('');
  }
  async function startExam(){
    if(state.busy)return;
    const questions=pickExamQuestions();
    if(!questions.length){toast('אין עדיין מספיק שאלות למבחן');return}
    state.exam={questions,current:0,answers:[],startedAt:Date.now(),finished:false};
    state.current=questions[0].page;save();setHeader();
    const stats=readExamStats(),best=stats.best?`<p class="micro-copy">השיא שלך עד עכשיו: ${stats.best.percent}% בזמן ${escapeHtml(stats.best.time||'')}</p>`:'';
    state.messages=[{who:'bot',speaker:currentOwnerName(),html:`<span class="message-tag">מצב מבחן</span><div class="exam-card"><h3>10 שאלות מכל המסלול</h3><p>עונים ברצף בלי לקבל תשובה באמצע. בסוף מקבלים ציון, פירוט טעויות והמלצה על פרקים לחזרה.</p>${best}</div>`,actions:[]}];
    renderMessages();
    if(matchMedia('(max-width:760px)').matches)document.body.classList.add('chat-open');
    await showExamQuestion();
  }
  async function showExamQuestion(){
    const exam=state.exam;if(!exam||exam.finished)return;
    const item=exam.questions[exam.current];if(!item)return finishExam();
    state.current=item.page;save();setHeader();
    const options=`<div class="quiz-options">${item.quiz.options.map((option,i)=>`<button type="button" data-exam="${i}">${escapeHtml(option)}</button>`).join('')}</div>`;
    await pushBot(`<span class="message-tag">מצב מבחן · ${escapeHtml(pageLabel(item.page))} · ${escapeHtml(cleanTitle(item.page))}</span>${examMeterHtml(exam)}<p><b>${escapeHtml(item.quiz.q)}</b></p>${options}`,[],420);
  }
  async function answerExam(index){
    const exam=state.exam;if(!exam||exam.finished||state.busy)return;
    const item=exam.questions[exam.current];if(!item)return;
    const quiz=item.quiz,choice=quiz.options[index]||'',correct=index===quiz.correct;
    exam.answers.push({
      page:item.page,file:item.page.file,title:cleanTitle(item.page),chapter:item.page.chapter,group:item.page.group,
      question:quiz.q,choice,correctAnswer:quiz.options[quiz.correct],why:quiz.why||'',ok:correct
    });
    exam.current+=1;
    pushUser(choice);
    state.busy=true;renderMessages();
    await new Promise(resolve=>setTimeout(resolve,360));
    state.busy=false;
    if(exam.current>=exam.questions.length)return finishExam();
    await showExamQuestion();
  }
  async function finishExam(){
    const exam=state.exam;if(!exam)return;
    exam.finished=true;
    const total=exam.questions.length,correct=exam.answers.filter(a=>a.ok).length,wrong=exam.answers.filter(a=>!a.ok),percent=Math.round(correct/total*100),time=formatExamTime(Date.now()-exam.startedAt);
    const stats=saveExamStats({percent,correct,total,time,at:new Date().toISOString()});
    const headline=percent>=90?'מצוין. אתה שולט בחומר.':percent>=70?'יפה מאוד. יש כמה נקודות לחיזוק.':'יש בסיס, עכשיו מחזקים את המקומות שנפלו.';
    await pushBot(`<span class="message-tag">סיכום מבחן</span><div class="exam-card"><div class="exam-score"><strong>${percent}%</strong><span><b>${correct} מתוך ${total} נכונות</b><br>${escapeHtml(headline)}<br>זמן: ${escapeHtml(time)}${stats.best&&stats.best.percent===percent?' · שיא חדש':''}</span></div>${examBreakdownHtml(exam.answers)}<div class="exam-review">${examWrongHtml(wrong)}</div></div>`,[
      {label:wrong.length?'חזור על הטעויות':'מבחן חדש',action:wrong.length?'exam-review':'exam-new'},
      {label:'מבחן חדש',action:'exam-new'},
      {label:'חזרה למסלול',action:'home',wide:true}
    ],650);
  }
  async function showExamReview(){
    const exam=state.exam,wrong=exam?exam.answers.filter(a=>!a.ok):[];
    pushUser('חזור על הטעויות שלי');
    if(!wrong.length){
      await pushBot(`<span class="message-tag">חזרה על טעויות</span><p>במבחן הזה לא היו טעויות לחזרה. אפשר לפתוח מבחן חדש או להמשיך במסלול.</p>`,[
        {label:'מבחן חדש',action:'exam-new'},
        {label:'חזרה למסלול',action:'home'}
      ]);
      return;
    }
    await pushBot(`<span class="message-tag">טעויות לחזרה</span><p>אלה המקומות שכדאי לחזק לפני מבחן נוסף:</p><div class="exam-review">${examWrongHtml(wrong)}</div>`,[
      {label:'פתח פרק ראשון לחזרה',action:'exam-open-weak'},
      {label:'מבחן חדש',action:'exam-new'},
      {label:'חזרה למסלול',action:'home',wide:true}
    ]);
  }
  function openWeakExamLesson(){
    const wrong=state.exam&&state.exam.answers.find(a=>!a.ok);
    if(!wrong)return toast('אין טעות לפתוח');
    const page=pages.find(p=>p.file===wrong.file);
    state.exam=null;
    selectLesson(page,true);
  }
  async function showRemediation(){
    const pack=packFor(state.current);pushUser('תסביר לי איפה טעיתי');
    await pushBot(`<span class="message-tag">מחזקים את הנקודה</span><p>${escapeHtml(pack.beginner)}</p>${diagramHtml(pack.diagram||pack.terms)}<p><b>כלל עבודה:</b> ${escapeHtml(pack.checks[0])}, ורק אחר כך ממשיכים למסקנה.</p>`,[
      {label:'נסה אותי שוב',action:'quiz'},
      {label:'תרגיל לדוגמה',action:'example'}
    ]);
  }
  async function showSummary(){
    const p=state.current,pack=packFor(p),memory=memoryFor(p.file);setStage('summary');pushUser('תן לי סיכום קצר');
    await pushBot(`<span class="message-tag">מה לקחת מהמשימה</span><p><b>${escapeHtml(cleanTitle(p))}</b></p>${listHtml([
      pack.simple,
      `סדר העבודה: ${pack.checks.slice(0,3).join(' → ')}`,
      'לא מנחשים. מזהים סימן, בודקים ורק אז מחליטים.'
    ])}<div class="mastery-card"><b>${memory.correct} תשובות נכונות</b><span>${memory.wrong?`${memory.wrong} טעויות שכדאי לחזור עליהן`:'בלי טעויות שנרשמו'}</span></div>`,[
      {label:'סמן שהשלמתי',action:'complete'},
      {label:'המשך לפרק המלא',action:'open'},
      {label:'עבור למשימה הבאה',action:'next',wide:true}
    ]);
  }
  async function completeLesson(){
    state.done.add(state.current.file);setStage('complete');renderProgress();renderLessonList();setHeader();
    pushUser('סיימתי את המשימה');
    await pushBot(`<span class="message-tag">התקדמות נשמרה</span><h3>יפה. הפרק הושלם.</h3><p>אפשר להמשיך למשימה הבאה או לפתוח את החומר המלא לחזרה.</p>`,[
      {label:'המשימה הבאה',action:'next'},
      {label:'פתח פרק מלא',action:'open'},
      {label:'חזרה למסלול',action:'home',wide:true}
    ]);
  }

  async function answerFreeText(raw){
    const text=raw.trim();if(!text||state.busy)return;
    pushUser(text);
    const pack=packFor(state.current),q=text.toLowerCase();
    let html='',actions=[];
    if(/למה|תמונה|ציור|הסבר עמוק|רעיון/.test(q)){
      state.messages.pop();renderMessages();return showDeep();
    }else if(/צעד|שלב|דרך|לאט|בהדרגה/.test(q)){
      state.messages.pop();renderMessages();return showStepCoach();
    }else if(/מהחיים|בחיים|דוגמה מהיום.?יום/.test(q)){
      state.messages.pop();renderMessages();return showAnalogy();
    }else if(/תרגול|תרגילים|עוד שאלות|תתאמן|אימון/.test(q)){
      state.messages.pop();renderMessages();return showPracticeSet();
    }else if(/לא הבנתי|לא ברור|פשוט יותר|מסובך/.test(q)){
      html=`<span class="message-tag">הסבר פשוט יותר</span><p>${escapeHtml(pack.beginner)}</p><p>תחשוב על זה ככה: קודם מבינים איזה כלל צריך, אחר כך מבצעים אותו צעד-צעד.</p>`;
      actions=[{label:'הסבר עם תמונה',action:'deep'},{label:'צעד־צעד',action:'steps'},{label:'בחן אותי',action:'quiz',wide:true}];
    }else if(/דוגמה|מקרה|תרגיל/.test(q)){
      html=`<span class="message-tag">דוגמה נוספת</span><p>${escapeHtml(pack.case)}</p>`;
      actions=[{label:'איך בודקים?',action:'checks'},{label:'בחן אותי',action:'quiz'}];
    }else if(/איפה|מתי|מופיע/.test(q)){
      html=`<span class="message-tag">איפה זה פוגש אותך</span><p>${escapeHtml(pack.location)}</p>`;
      actions=[{label:'איך בודקים?',action:'checks'},{label:'מה הטעות הנפוצה?',action:'safety'}];
    }else if(/איך בודקים|מה בודקים|בדיקה|מה עושים/.test(q)){
      html=`<span class="message-tag">בדיקה מסודרת</span>${listHtml(pack.checks)}<div class="safety-note">${escapeHtml(pack.warning)}</div>`;
      actions=[{label:'בחן אותי',action:'quiz'},{label:'סיכום',action:'summary'}];
    }else if(/טעות|לא נכון|איפה טועים/.test(q)){
      html=`<span class="message-tag">שימו לב לזה</span><div class="safety-note">${escapeHtml(pack.warning)}</div>`;
      actions=[{label:'הבנתי',action:'checks'},{label:'אתגר קצר',action:'challenge'}];
    }else if(/מצב מבחן|מבחן מלא|סימולציה|10 שאלות|עשר שאלות/.test(q)){
      state.messages.pop();renderMessages();return startExam();
    }else if(/בחן|שאלה|מבחן/.test(q)){
      state.messages.pop();renderMessages();return showQuiz();
    }else if(/המשך|הבא|סיכום/.test(q)){
      state.messages.pop();renderMessages();return showSummary();
    }else{
      html=`<span class="message-tag">לפי הפרק הנוכחי</span><p>${escapeHtml(pack.simple)}</p><p>לשאלה שלך הייתי מתחיל מהצעדים האלה:</p>${listHtml(pack.checks.slice(0,3))}<p><small>ותמיד — בודקים כל שלב לפני שממשיכים לשלב הבא.</small></p>`;
      actions=[{label:'תסביר פשוט',action:'start-new'},{label:'תן דוגמה',action:'example'},{label:'בחן אותי',action:'quiz',wide:true}];
    }
    await pushBot(html,actions,700);
  }

  async function handleAction(action){
    if(state.busy)return;
    if(action==='restart'){state.learning[state.current.file]={asked:[],correct:0,wrong:0,stage:'start',example:0};save();return startConversation()}
    if(action==='continue'){
      const stage=memoryFor(state.current.file).stage;
      if(stage==='deep')return showAnalogy();
      if(stage==='analogy')return showStepCoach();
      if(stage==='steps')return showPracticeSet();
      if(stage==='practice')return showQuiz();
      if(['explain','location','safety'].includes(stage))return showExample();
      if(['example','diagram'].includes(stage))return showChecks();
      if(['checks','challenge','quiz'].includes(stage))return showQuiz();
      if(stage==='summary')return showSummary();
      if(stage==='complete')return selectLesson(nextLesson(),true);
      return explain(state.level);
    }
    if(action==='start-new')return explain('new');
    if(action==='start-some')return explain('some');
    if(action==='deep')return showDeep();
    if(action==='analogy')return showAnalogy();
    if(action==='steps')return showStepCoach();
    if(action==='practice')return showPracticeSet();
    if(action==='example')return showExample();
    if(action==='diagram')return showDiagram();
    if(action==='challenge')return showChallenge();
    if(action==='checks')return showChecks();
    if(action==='location')return showLocation();
    if(action==='safety')return showSafety();
    if(action==='quiz')return showQuiz();
    if(action==='exam'||action==='exam-new')return startExam();
    if(action==='exam-review')return showExamReview();
    if(action==='exam-open-weak')return openWeakExamLesson();
    if(action==='remediate')return showRemediation();
    if(action==='summary')return showSummary();
    if(action==='complete')return completeLesson();
    if(action==='next')return selectLesson(nextLesson(),true);
    if(action==='open')return location.href=lessonUrl(state.current);
    if(action==='home'){state.exam=null;document.body.classList.remove('chat-open');return}
  }

  function routeForPage(p){
    const t=pageText(p);
    if(/מחשבון|casio|calculator|fx/i.test(t))return 'calculator';
    if(/שברים|אחוז/i.test(t))return 'fractions';
    if(/סוגריים|כינוס|אלגבר/i.test(t))return 'algebra';
    if(/משווא|מילול|פונקציה|גרף|גיאומטר/i.test(t))return 'equations';
    return 'zero';
  }
  const TUTOR_NAME='רונן';
  const REAL_CONTACTS=[
    {name:'איתי בן אריה',phone:'972533465573'},
    {name:'יעקב צפניה',phone:'972538267942'},
    {name:'מיכאל מושיאב',phone:'972556770878'},
    {name:'זכריה',phone:'972509090559'},
    {name:'Moshe Greydi',phone:'972547929840'},
    {name:'RL',phone:'972538212898'},
    {name:'אלעד',phone:'972539000325'},
    {name:'יהודה',phone:'972537984826'}
  ];
  const STUDENT_NAMES=REAL_CONTACTS.map(c=>c.name);
  const statusData=chapterPages.map((p,i)=>{
    const lesson=lessonContent[p&&p.file]||{};
    const visual=visuals.visualFor?visuals.visualFor(p):{symbol:p.chapter||'•'};
    const slides=visuals.storySlides?visuals.storySlides(p,lesson):[{title:cleanTitle(p),text:chapterStatusText(p),formula:visual.formula||''}];
    return {
      page:p,
      icon:visual.symbol,
      owner:REAL_CONTACTS[i%REAL_CONTACTS.length].name,
      phone:REAL_CONTACTS[i%REAL_CONTACTS.length].phone,
      title:`${pageLabel(p)} · ${cleanTitle(p)}`,
      text:chapterStatusText(p),
      route:routeForPage(p),
      file:p.file,
      thumb:chapterArt(p,'thumb'),
      image:chapterArt(p,'story'),
      slides
    };
  });
  function contactForPage(p){
    if(!p)return null;
    const status=statusData.find(s=>s.file===p.file);
    if(status)return {name:status.owner,phone:status.phone};
    const index=chapterPages.findIndex(x=>x.file===p.file);
    return index>=0?REAL_CONTACTS[index%REAL_CONTACTS.length]:null;
  }
  function ownerForPage(p){
    const c=contactForPage(p);
    return c?c.name:TUTOR_NAME;
  }
  function currentOwnerName(){return ownerForPage(state.current)}
  function waLinkForPage(p){
    const c=contactForPage(p);
    if(!c)return null;
    const msg=`היי, אני מתעניין בפרויקט יואב, כרגע אני מנסה להבין משהו בפרק ${cleanTitle(p)}`;
    return `https://wa.me/${c.phone}?text=${encodeURIComponent(msg)}`;
  }
  const STATUS_DURATION=6800;
  function readSeenOrder(){try{return JSON.parse(localStorage.getItem('mathbro-status-seen')||'[]')}catch(e){return []}}
  let seenOrder=readSeenOrder();
  function isSeenStatus(i){return seenOrder.includes(i)}
  function markSeenStatus(i){
    const at=seenOrder.indexOf(i);if(at>-1)seenOrder.splice(at,1);
    seenOrder.push(i);
    localStorage.setItem('mathbro-status-seen',JSON.stringify(seenOrder));
  }
  let statusTimer=null,statusStartedAt=0,statusRemaining=STATUS_DURATION,statusPointerAt=0,statusPointerX=0,suppressStatusClick=false;
  function renderStatuses(){
    // real WhatsApp behaviour: unseen statuses first (original order), seen ones pushed to the end in view order
    const unseen=statusData.map((_,i)=>i).filter(i=>!isSeenStatus(i));
    const order=[...unseen,...seenOrder.filter(i=>i<statusData.length)];
    els.statusList.innerHTML=order.map(i=>{
      const s=statusData[i];
      return `<button class="status-card ${isSeenStatus(i)?'seen':''}" data-status="${i}" type="button" aria-label="הסטטוס של ${escapeHtml(s.owner)}: ${escapeHtml(s.title)}"><div class="status-ring"><div class="status-face status-face-icon"><img src="${escapeHtml(s.thumb)}" alt=""></div></div><span>${escapeHtml(s.owner)}</span><small>${escapeHtml(cleanTitle(s.page))}</small></button>`;
    }).join('');
  }
  function scheduleStatus(ms=STATUS_DURATION){
    clearTimeout(statusTimer);statusRemaining=ms;statusStartedAt=Date.now();
    els.statusViewer.style.setProperty('--status-ms', `${ms}ms`);
    statusTimer=setTimeout(()=>moveStatus(1,true),ms);
  }
  function openStatus(index,slideIndex=0){
    state.statusIndex=Math.max(0,Math.min(index,statusData.length-1));const s=statusData[state.statusIndex];
    state.statusSlide=Math.max(0,Math.min(slideIndex,(s.slides.length||1)-1));
    const slide=s.slides[state.statusSlide]||s.slides[0]||{};
    markSeenStatus(state.statusIndex);renderStatuses();
    els.statusBars.innerHTML=s.slides.map((_,i)=>`<i class="${i<state.statusSlide?'done':i===state.statusSlide?'current':''}"><span></span></i>`).join('');
    els.statusIcon.innerHTML=`<img src="${escapeHtml(s.thumb)}" alt="">`;
    if(els.statusOwnerName)els.statusOwnerName.textContent=s.owner||'מתמטיקה לחרדים';
    const image=visuals.storyArt?visuals.storyArt(s.page,slide,state.statusSlide):s.image;
    els.statusPhoto.innerHTML=`<img src="${escapeHtml(image)}" alt="תמונת סטטוס ${escapeHtml(cleanTitle(s.page))}">`;
    els.statusTitle.textContent=slide.title||s.title;els.statusText.textContent=slide.text||s.text;
    els.statusLearn.dataset.route=s.route||'zero';
    els.statusLearn.dataset.file=s.file||'';
    els.statusTime.textContent=`${pageLabel(s.page)} · תמונה ${state.statusSlide+1}/${s.slides.length}`;
    els.statusModal.hidden=false;els.statusViewer.classList.remove('paused');scheduleStatus();
  }
  function moveStatus(direction,automatic=false){
    if(els.statusModal.hidden)return;
    const s=statusData[state.statusIndex],slideTarget=state.statusSlide+direction;
    if(slideTarget>=0&&slideTarget<s.slides.length){openStatus(state.statusIndex,slideTarget);return}
    const target=state.statusIndex+direction;
    if(target>=statusData.length){closeStatus();return}
    if(target<0){openStatus(0,0);return}
    const nextSlides=statusData[target].slides||[];
    openStatus(target,direction<0?Math.max(0,nextSlides.length-1):0);
    if(!automatic)navigator.vibrate?.(8);
  }
  function pauseStatus(){
    if(els.statusModal.hidden)return;
    clearTimeout(statusTimer);statusRemaining=Math.max(100, statusRemaining-(Date.now()-statusStartedAt));els.statusViewer.classList.add('paused');
  }
  function resumeStatus(){if(els.statusModal.hidden)return;els.statusViewer.classList.remove('paused');scheduleStatus(statusRemaining)}
  function closeStatus(){clearTimeout(statusTimer);els.statusModal.hidden=true;els.statusViewer.classList.remove('paused')}
  function routePage(route){
    const matchers={
      zero:p=>p.chapter===1,
      fractions:p=>/שברים|אחוז/i.test(pageText(p)),
      algebra:p=>/סוגריים|כינוס|אלגבר/i.test(pageText(p)),
      equations:p=>/משווא|מילול|פונקציה|גרף|גיאומטר/i.test(pageText(p)),
      calculator:p=>/מחשבון|casio|calculator|fx/i.test(pageText(p))
    };
    return pages.find(matchers[route]||matchers.zero)||pages[0];
  }

  function filteredPages(){
    const q=state.query.toLowerCase();
    return pages.filter(p=>{
      const typeOk=state.filter==='all'||(state.filter==='chapters'&&p.chapter)||(state.filter==='tools'&&!p.chapter)||(state.filter==='done'&&state.done.has(p.file));
      const qOk=!q||pageText(p).includes(q)||cleanTitle(p).toLowerCase().includes(q);
      return typeOk&&qOk;
    });
  }
  function lessonStat(p){
    const memory=state.learning[p.file];
    if(!memory||(!memory.correct&&!memory.wrong))return '';
    return `<em class="lesson-score">${memory.correct} נכון${memory.wrong?` · ${memory.wrong} לחזרה`:''}</em>`;
  }
  function renderLessonList(){
    const list=filteredPages(),limit=state.showAll?list.length:INITIAL_LESSON_LIMIT,visible=list.slice(0,limit);
    els.resultCount.textContent=`${list.length} תוצאות`;
    els.list.innerHTML=visible.length?visible.map(p=>`<button class="lesson-item ${state.current&&state.current.file===p.file?'active':''} ${state.done.has(p.file)?'done':''}" data-file="${escapeHtml(p.file)}" type="button"><span class="lesson-thumb"><img src="${escapeHtml(chapterArt(p,'thumb'))}" alt=""></span><span class="lesson-copy"><b>${escapeHtml(ownerForPage(p))} · ${escapeHtml(cleanTitle(p))}</b><small>${escapeHtml(pageLabel(p))} · ${escapeHtml(p.group||'כלי')} · ${escapeHtml(p.level||'')}</small>${lessonStat(p)}</span></button>`).join(''):'<div class="empty-list">לא מצאתי פרק מתאים. נסה מילה אחרת.</div>';
    els.showMore.hidden=list.length<=INITIAL_LESSON_LIMIT;els.showMore.textContent=state.showAll?'הצג פחות':'הצג עוד פרקים';
  }
  function renderProgress(){
    const completed=chapterPages.filter(p=>state.done.has(p.file)).length,total=chapterPages.length||80,percent=Math.round(completed/total*100);
    els.progressText.textContent=`${completed} מתוך ${total} פרקים`;els.progressPercent.textContent=`${percent}%`;els.progressBar.style.width=`${percent}%`;
  }
  function toast(text){els.toast.textContent=text;els.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove('show'),1600)}

  els.list.addEventListener('click',e=>{const b=e.target.closest('[data-file]');if(!b)return;selectLesson(pages.find(p=>p.file===b.dataset.file),true)});
  els.search.addEventListener('input',e=>{state.query=e.target.value;state.showAll=false;renderLessonList()});
  document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.filter=b.dataset.filter;state.showAll=false;renderLessonList()}));
  els.showMore.addEventListener('click',()=>{state.showAll=!state.showAll;renderLessonList()});
  els.continueBtn.addEventListener('click',()=>selectLesson(nextLesson(),true));
  els.examStart?.addEventListener('click',()=>startExam());
  els.bannerStart?.addEventListener('click',()=>selectLesson(nextLesson(),true));
  document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>selectLesson(routePage(b.dataset.route),true)));
  els.statusList.addEventListener('click',e=>{const b=e.target.closest('[data-status]');if(b)openStatus(Number(b.dataset.status))});
  els.statusClose.addEventListener('click',e=>{e.stopPropagation();closeStatus()});
  els.statusPrev.addEventListener('click',()=>{if(suppressStatusClick){suppressStatusClick=false;return}moveStatus(-1)});
  els.statusNext.addEventListener('click',()=>{if(suppressStatusClick){suppressStatusClick=false;return}moveStatus(1)});
  els.statusLearn.addEventListener('click',e=>{e.stopPropagation();const file=e.currentTarget.dataset.file,route=e.currentTarget.dataset.route||'zero';closeStatus();selectLesson(pages.find(p=>p.file===file)||routePage(route),true)});
  els.statusViewer.addEventListener('pointerdown',e=>{if(e.target.closest('.status-close,.status-learn'))return;statusPointerAt=Date.now();statusPointerX=e.clientX;pauseStatus()});
  els.statusViewer.addEventListener('pointerup',e=>{
    if(e.target.closest('.status-close,.status-learn'))return;
    const held=Date.now()-statusPointerAt,swipe=e.clientX-statusPointerX;
    if(Math.abs(swipe)>48){suppressStatusClick=true;moveStatus(swipe>0?-1:1);return}
    if(held>300){suppressStatusClick=true;resumeStatus();return}
    resumeStatus();
  });
  els.statusViewer.addEventListener('pointercancel',resumeStatus);
  els.backBtn.addEventListener('click',()=>document.body.classList.remove('chat-open'));
  els.doneBtn.addEventListener('click',()=>{if(!state.current)return;if(state.done.has(state.current.file)){state.done.delete(state.current.file);toast('הפרק הוחזר למסלול')}else{state.done.add(state.current.file);toast('הפרק סומן כהושלם')}save();renderProgress();renderLessonList();setHeader()});
  els.messages.addEventListener('click',e=>{const exam=e.target.closest('[data-exam]');if(exam)return answerExam(Number(exam.dataset.exam));const quiz=e.target.closest('[data-quiz]');if(quiz)return answerQuiz(Number(quiz.dataset.quiz));const action=e.target.closest('[data-action]');if(action)handleAction(action.dataset.action)});
  els.composer.addEventListener('submit',e=>{e.preventDefault();const text=els.input.value;els.input.value='';answerFreeText(text)});
  document.addEventListener('keydown',e=>{if(els.statusModal.hidden)return;if(e.key==='Escape')closeStatus();if(e.key==='ArrowLeft')moveStatus(-1);if(e.key==='ArrowRight')moveStatus(1)});
  document.addEventListener('visibilitychange',()=>{if(els.statusModal.hidden)return;document.hidden?pauseStatus():resumeStatus()});

  // ── status row: click-and-drag horizontal scroll for mouse/desktop users ──
  (function enableDragScroll(){
    const list=els.statusList;if(!list)return;
    let isDown=false,lastX=0,totalDx=0,moved=false;
    list.addEventListener('pointerdown',e=>{
      isDown=true;moved=false;totalDx=0;lastX=e.clientX;
    });
    window.addEventListener('pointermove',e=>{
      if(!isDown)return;
      const step=e.clientX-lastX;lastX=e.clientX;totalDx+=step;
      if(Math.abs(totalDx)>4){moved=true;list.classList.add('dragging');list.scrollLeft-=step}
    });
    window.addEventListener('pointerup',e=>{
      if(!isDown)return;isDown=false;list.classList.remove('dragging');
      if(moved){
        const btn=e.target.closest('[data-status]');
        if(btn){const guard=ev=>{ev.stopPropagation();btn.removeEventListener('click',guard,true)};btn.addEventListener('click',guard,true)}
      }
    });
  })();

  // ── floating tools: calculator + scratchpad ──
  (function initTools(){
    const fab=$('toolsFab'),panel=$('toolsPanel'),closeBtn=$('toolsPanelClose');
    if(!fab||!panel)return;
    fab.addEventListener('click',()=>{panel.hidden=!panel.hidden});
    closeBtn.addEventListener('click',()=>{panel.hidden=true});
    panel.querySelectorAll('.tools-tab').forEach(tab=>{
      tab.addEventListener('click',()=>{
        panel.querySelectorAll('.tools-tab').forEach(t=>t.classList.toggle('active',t===tab));
        panel.querySelectorAll('[data-tabpanel]').forEach(p=>{p.hidden=p.dataset.tabpanel!==tab.dataset.tab});
      });
    });

    // safe calculator — state machine, no eval()
    const display=$('calcDisplay');
    let calc={cur:'0',prev:null,op:null,fresh:true};
    function calcRender(){display.textContent=calc.cur}
    function calcCompute(a,b,op){
      a=parseFloat(a);b=parseFloat(b);
      if(op==='+')return a+b; if(op==='−')return a-b;
      if(op==='×')return a*b;
      if(op==='÷')return b===0?'שגיאה':a/b;
      return b;
    }
    panel.querySelector('.calc-grid').addEventListener('click',e=>{
      const btn=e.target.closest('button');if(!btn)return;
      const kind=btn.dataset.calc;
      if(kind==='num'){
        const d=btn.textContent;
        calc.cur=(calc.fresh||calc.cur==='0')?d:calc.cur+d;calc.fresh=false;
      }else if(kind==='dot'){
        if(calc.fresh){calc.cur='0.';calc.fresh=false}
        else if(!calc.cur.includes('.'))calc.cur+='.';
      }else if(kind==='clear'){
        calc={cur:'0',prev:null,op:null,fresh:true};
      }else if(kind==='back'){
        calc.cur=calc.cur.length>1?calc.cur.slice(0,-1):'0';
      }else if(kind==='percent'){
        calc.cur=String(parseFloat(calc.cur)/100);
      }else if(kind==='op'){
        if(calc.op&&!calc.fresh){calc.cur=String(calcCompute(calc.prev,calc.cur,calc.op))}
        calc.prev=calc.cur;calc.op=btn.dataset.op;calc.fresh=true;
      }else if(kind==='equals'){
        if(calc.op){calc.cur=String(calcCompute(calc.prev,calc.cur,calc.op));calc.op=null;calc.prev=null;calc.fresh=true}
      }
      calcRender();
    });

    // scratchpad — per-chapter, autosaved
    const draftPad=$('draftPad'),draftSaved=$('draftSaved'),draftClear=$('draftClear');
    function draftKey(){return 'mathbro-draft:'+((state.current&&state.current.file)||'general')}
    function loadDraft(){draftPad.value=localStorage.getItem(draftKey())||'';draftSaved.textContent=''}
    draftPad.addEventListener('input',()=>{
      localStorage.setItem(draftKey(),draftPad.value);
      draftSaved.textContent='נשמר ✓';clearTimeout(draftPad._t);draftPad._t=setTimeout(()=>draftSaved.textContent='',1200);
    });
    draftClear.addEventListener('click',()=>{draftPad.value='';localStorage.removeItem(draftKey());draftSaved.textContent=''});
    panel.querySelector('[data-tab="draft"]').addEventListener('click',loadDraft);
    document.addEventListener('lesson:changed',loadDraft);
  })();

  function init(){
    renderStatuses();renderProgress();renderLessonList();
    const saved=pages.find(p=>p.file===localStorage.getItem(STORAGE.current));
    state.current=saved||chapterPages[0]||pages[0];setHeader();startConversation();
    const params=new URLSearchParams(location.search);
    const chapter=Number(params.get('lesson'));
    if(chapter){const p=chapterPages.find(x=>x.chapter===chapter);if(p)selectLesson(p,params.get('demo-home')!=='1')}
    if(params.get('demo-chat')==='1'){document.body.classList.add('chat-open')}
    if(params.get('demo-status')==='1')setTimeout(()=>openStatus(0),200);
    if(params.get('demo-quiz')==='1')setTimeout(()=>showQuiz(),200);
    if(params.get('demo-exam')==='1')setTimeout(()=>startExam(),220);
    if(params.get('demo-answer')==='1')setTimeout(async()=>{await showQuiz();setTimeout(()=>{const pack=packFor(state.current),quiz=(pack.questions||[pack.quiz])[state.currentQuiz.index];answerQuiz(quiz.correct)},550)},220);
    if(params.get('demo-text'))setTimeout(()=>answerFreeText(params.get('demo-text')),260);
    if(params.get('demo-complete')==='1')setTimeout(()=>completeLesson(),260);
  }
  init();
})();
