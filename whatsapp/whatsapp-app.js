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
    continueBtn:$('continueBtn'),bannerStart:$('bannerStartBtn'),progressText:$('progressText'),progressPercent:$('progressPercent'),progressBar:$('progressBar'),
    messages:$('messages'),chatTitle:$('chatTitle'),chatStatus:$('chatStatus'),openLesson:$('openLessonLink'),doneBtn:$('doneBtn'),
    backBtn:$('backBtn'),composer:$('composer'),input:$('messageInput'),toast:$('toast'),statusList:$('statusList'),
    statusModal:$('statusModal'),statusViewer:$('statusViewer'),statusBars:$('statusBars'),statusIcon:$('statusIcon'),statusPhoto:$('statusPhoto'),
    statusTitle:$('statusModalTitle'),statusText:$('statusModalText'),statusTime:$('statusTime'),statusOwnerName:$('statusOwnerName'),statusClose:$('statusClose'),statusPrev:$('statusPrev'),statusNext:$('statusNext'),
    statusLearn:$('statusLearn')
  };

  const STORAGE={done:'mathbro-done',current:'mathbro-current-v2',level:'mathbro-level-v2',learning:'mathbro-learning-v3'};
  function readDone(){try{return new Set(JSON.parse(localStorage.getItem(STORAGE.done)||'[]'))}catch(e){return new Set()}}
  function readLearning(){try{return JSON.parse(localStorage.getItem(STORAGE.learning)||'{}')}catch(e){return {}}}
  const state={
    done:readDone(),current:null,messages:[],busy:false,filter:'all',query:'',showAll:false,level:localStorage.getItem(STORAGE.level)||'new',statusIndex:0,statusSlide:0,
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
    return `<article class="bubble ${message.who}">${message.html}${actionsHtml(message.actions)}<time>${message.who==='user'?'נקרא ✓✓':'רונן'} · עכשיו</time></article>`;
  }
  function renderMessages(){
    const typing=state.busy?'<div class="typing-bubble" aria-label="רונן מקליד תשובה"><span>רונן מקליד</span><div class="dots"><i></i><i></i><i></i></div></div>':'';
    els.messages.innerHTML='<div class="day-label">היום · מסלול ווצאפ</div>'+state.messages.map(messageHtml).join('')+typing;
    requestAnimationFrame(()=>{els.messages.scrollTop=els.messages.scrollHeight});
    setTimeout(()=>{els.messages.scrollTop=els.messages.scrollHeight},90);
  }
  function pushUser(text){state.messages.push({who:'user',html:`<p>${escapeHtml(text)}</p>`});renderMessages()}
  async function pushBot(html,actions=[],delay=700){
    if(state.busy)return;
    state.busy=true;renderMessages();
    await new Promise(resolve=>setTimeout(resolve,delay));
    state.busy=false;state.messages.push({who:'bot',html,actions});renderMessages();
  }

  function openingFor(p){
    const topic=cleanTitle(p),pack=packFor(p),n=p.chapter||'כלי';
    return `<img class="message-visual" src="${escapeHtml(chapterArt(p,'wide'))}" alt="תמונת פרק ${escapeHtml(topic)}"><span class="message-tag">${escapeHtml(pageLabel(p))} · ${escapeHtml(p.group||'מסלול')}</span><h3>${escapeHtml(topic)}</h3><p>אני רונן. נלמד את הנושא דרך דוגמה אמיתית מהבחינה, בקצב שלך.</p><p><b>מה רמת הידע שלך בנושא?</b></p>${termsHtml(pack.terms)}`;
  }
  function startConversation(){
    const p=state.current,memory=memoryFor(p.file),hasProgress=memory.stage!=='start';
    state.currentQuiz=null;
    const progressNote=hasProgress?`<div class="return-note"><b>זוכר אותך.</b> עצרת בשלב ${stageLabel(memory.stage)} ויש לך ${memory.correct} תשובות נכונות בפרק.</div>`:'';
    state.messages=[{who:'bot',html:openingFor(p)+progressNote,actions:hasProgress?[
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
    els.chatTitle.textContent=p.chapter?`פרק ${p.chapter}: ${cleanTitle(p)}`:cleanTitle(p);
    els.chatStatus.textContent=`מחובר · ${p.group||'מסלול לימוד'}`;
    els.openLesson.href=lessonUrl(p);
    els.doneBtn.classList.toggle('is-done',state.done.has(p.file));
    els.doneBtn.textContent=state.done.has(p.file)?'✓':'○';
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
    await pushBot(`<span class="message-tag">רונן מפרק את זה לשלבים</span>${walkthroughHtml(pack)}<p class="micro-copy">קרא שלב, עצור רגע, ואז עבור לשלב הבא. ככה בונים הרגל פתרון.</p>`,[
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
    if(action==='remediate')return showRemediation();
    if(action==='summary')return showSummary();
    if(action==='complete')return completeLesson();
    if(action==='next')return selectLesson(nextLesson(),true);
    if(action==='open')return location.href=lessonUrl(state.current);
    if(action==='home'){document.body.classList.remove('chat-open');return}
  }

  function routeForPage(p){
    const t=pageText(p);
    if(/מחשבון|casio|calculator|fx/i.test(t))return 'calculator';
    if(/שברים|אחוז/i.test(t))return 'fractions';
    if(/סוגריים|כינוס|אלגבר/i.test(t))return 'algebra';
    if(/משווא|מילול|פונקציה|גרף|גיאומטר/i.test(t))return 'equations';
    return 'zero';
  }
  const STUDENT_NAMES=['בנימין','משה','צפניה','זכריה','שילה','שלמה','איתי','שרול','יעקב','אברהם','יצחק','דוד','יהודה','נפתלי','אשר','ראובן','אפרים','חיים','מרדכי','ברוך','אליהו','רפאל','ישראל','יוסף'];
  const statusData=chapterPages.map((p,i)=>{
    const lesson=lessonContent[p&&p.file]||{};
    const visual=visuals.visualFor?visuals.visualFor(p):{symbol:p.chapter||'•'};
    const slides=visuals.storySlides?visuals.storySlides(p,lesson):[{title:cleanTitle(p),text:chapterStatusText(p),formula:visual.formula||''}];
    return {
      page:p,
      icon:visual.symbol,
      owner:STUDENT_NAMES[i%STUDENT_NAMES.length],
      title:`${pageLabel(p)} · ${cleanTitle(p)}`,
      text:chapterStatusText(p),
      route:routeForPage(p),
      file:p.file,
      thumb:chapterArt(p,'thumb'),
      image:chapterArt(p,'story'),
      slides
    };
  });
  const STATUS_DURATION=6800;
  function readSeenStatuses(){try{return new Set(JSON.parse(localStorage.getItem('mathbro-status-seen')||'[]'))}catch(e){return new Set()}}
  const seenStatuses=readSeenStatuses();
  let statusTimer=null,statusStartedAt=0,statusRemaining=STATUS_DURATION,statusPointerAt=0,statusPointerX=0,suppressStatusClick=false;
  function renderStatuses(){
    els.statusList.innerHTML=statusData.map((s,i)=>`<button class="status-card ${seenStatuses.has(i)?'seen':''}" data-status="${i}" type="button" aria-label="הסטטוס של ${escapeHtml(s.owner)}: ${escapeHtml(s.title)}"><div class="status-ring"><div class="status-face status-face-icon"><img src="${escapeHtml(s.thumb)}" alt=""></div></div><span>${escapeHtml(s.owner)}</span><small>${escapeHtml(cleanTitle(s.page))}</small></button>`).join('');
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
    seenStatuses.add(state.statusIndex);localStorage.setItem('mathbro-status-seen',JSON.stringify([...seenStatuses]));renderStatuses();
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
    els.list.innerHTML=visible.length?visible.map(p=>`<button class="lesson-item ${state.current&&state.current.file===p.file?'active':''} ${state.done.has(p.file)?'done':''}" data-file="${escapeHtml(p.file)}" type="button"><span class="lesson-thumb"><img src="${escapeHtml(chapterArt(p,'thumb'))}" alt=""></span><span class="lesson-copy"><b>${escapeHtml(cleanTitle(p))}</b><small>${escapeHtml(pageLabel(p))} · ${escapeHtml(p.group||'כלי')} · ${escapeHtml(p.level||'')}</small>${lessonStat(p)}</span></button>`).join(''):'<div class="empty-list">לא מצאתי פרק מתאים. נסה מילה אחרת.</div>';
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
  els.messages.addEventListener('click',e=>{const quiz=e.target.closest('[data-quiz]');if(quiz)return answerQuiz(Number(quiz.dataset.quiz));const action=e.target.closest('[data-action]');if(action)handleAction(action.dataset.action)});
  els.composer.addEventListener('submit',e=>{e.preventDefault();const text=els.input.value;els.input.value='';answerFreeText(text)});
  document.addEventListener('keydown',e=>{if(els.statusModal.hidden)return;if(e.key==='Escape')closeStatus();if(e.key==='ArrowLeft')moveStatus(-1);if(e.key==='ArrowRight')moveStatus(1)});
  document.addEventListener('visibilitychange',()=>{if(els.statusModal.hidden)return;document.hidden?pauseStatus():resumeStatus()});

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
    if(params.get('demo-answer')==='1')setTimeout(async()=>{await showQuiz();setTimeout(()=>{const pack=packFor(state.current),quiz=(pack.questions||[pack.quiz])[state.currentQuiz.index];answerQuiz(quiz.correct)},550)},220);
    if(params.get('demo-text'))setTimeout(()=>answerFreeText(params.get('demo-text')),260);
    if(params.get('demo-complete')==='1')setTimeout(()=>completeLesson(),260);
  }
  init();
})();
