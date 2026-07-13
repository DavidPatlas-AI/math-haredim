(function(){
  'use strict';
  const pages=(window.MATHBRO_PAGES||[]).filter(p=>Number.isFinite(p.chapter));
  const lessons=window.MATHBRO_LESSONS||{};
  const visuals=window.MATHBRO_VISUALS||{};
  const $=id=>document.getElementById(id);
  const DONE_KEY='mathbro-done';

  function lessonFor(p){ return lessons[p.file]||{}; }
  function cleanTitle(p){ return visuals.cleanTitle?visuals.cleanTitle(p):String(p.title||''); }
  function pageText(p){ return `${p.title||''} ${p.group||''} ${p.level||''}`.toLowerCase(); }
  function routeForPage(p){
    const t=pageText(p);
    if(/מחשבון|casio|calculator|fx/.test(t))return 'calculator';
    if(/שברים|אחוז/.test(t))return 'fractions';
    if(/סוגריים|כינוס|אלגבר/.test(t))return 'algebra';
    if(/משווא|מילול|פונקציה|גרף|גיאומטר/.test(t))return 'equations';
    return 'zero';
  }
  function escapeHtml(v){ return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function teaserFor(p){
    const l=lessonFor(p);
    const t=(l.beginner||l.advanced||'').replace(/\s+/g,' ').trim();
    return t.length>110?t.slice(0,110)+'…':t;
  }

  const articles = pages.map((p,i)=>({
    page:p, index:i, title:cleanTitle(p),
    image:visuals.chapterArt?visuals.chapterArt(p,'wide'):'',
    thumb:visuals.chapterArt?visuals.chapterArt(p,'thumb'):'',
    teaser:teaserFor(p), route:routeForPage(p),
  }));

  // ── top bar: real Hebrew weekday + real progress stats ──
  const WEEKDAYS=['יום ראשון','יום שני','יום שלישי','יום רביעי','יום חמישי','יום שישי','שבת'];
  function readDone(){ try{return new Set(JSON.parse(localStorage.getItem(DONE_KEY)||'[]'))}catch(e){return new Set()} }
  function renderTopBar(){
    const now=new Date();
    $('todayLabel').textContent = `📅 ${WEEKDAYS[now.getDay()]}, ${now.toLocaleDateString('he-IL')}`;
    const done=readDone();
    const doneCount=articles.filter(a=>done.has(a.page.file)).length;
    $('progressStat').textContent = `📚 ${doneCount} מתוך ${articles.length} פרקים הושלמו`;
    $('doneStat').textContent = `🎯 ${Math.round(doneCount/articles.length*100)}% התקדמות`;
    $('sideProgressText').textContent = `${doneCount} מתוך ${articles.length} פרקים הושלמו`;
    $('sideProgressBar').style.width = `${Math.round(doneCount/articles.length*100)}%`;
  }

  // ── breaking-news ticker ──
  function renderTicker(){
    $('tickerText').innerHTML = articles.slice(0,10).map(a=>`<span>📖 ${escapeHtml(a.title)}: ${escapeHtml(a.teaser)}</span>`).join('');
  }

  // ── hero slider ──
  let slideIndex=0, slideTimer=null;
  const heroArticles = articles.slice(0,3);
  function renderSlider(){
    $('slidesTrack').innerHTML = heroArticles.map(a=>`
      <div class="slide-item">
        <img src="${escapeHtml(a.image)}" alt="">
        <div class="slide-caption">
          <h2>${escapeHtml(a.title)}</h2>
          <p>${escapeHtml(a.teaser)}</p>
        </div>
      </div>`).join('');
  }
  function goSlide(dir){
    slideIndex=(slideIndex+dir+heroArticles.length)%heroArticles.length;
    $('slidesTrack').style.transform=`translateX(${slideIndex*100}%)`;
  }
  function scheduleSlide(){ clearInterval(slideTimer); slideTimer=setInterval(()=>goSlide(1),5000); }
  $('prevSlide').addEventListener('click',()=>{goSlide(-1);scheduleSlide();});
  $('nextSlide').addEventListener('click',()=>{goSlide(1);scheduleSlide();});
  $('slidesTrack').addEventListener('click',e=>{
    const item=e.target.closest('.slide-item'); if(!item)return;
    const i=[...$('slidesTrack').children].indexOf(item);
    location.href=`article.html?lesson=${heroArticles[i].page.chapter}`;
  });

  // ── articles grid ──
  let currentFilter='all', currentQuery='';
  function renderGrid(){
    const q=currentQuery.trim().toLowerCase();
    const visible=articles.filter(a=>(currentFilter==='all'||a.route===currentFilter)&&(!q||a.title.toLowerCase().includes(q)||a.teaser.toLowerCase().includes(q)));
    $('articlesGrid').innerHTML = visible.length ? visible.map(a=>`
      <a class="article-card" href="article.html?lesson=${a.page.chapter}">
        <div class="card-img"><img src="${escapeHtml(a.thumb)}" alt=""></div>
        <div class="card-body">
          <h3>${escapeHtml(a.title)}</h3>
          <div class="post-date">פרק ${a.page.chapter} · ${escapeHtml(a.page.group||'')}</div>
        </div>
      </a>`).join('') : `<div class="no-results">לא נמצאו פרקים מתאימים</div>`;
  }

  $('navLinks').addEventListener('click',e=>{
    const a=e.target.closest('a'); if(!a)return; e.preventDefault();
    $('navLinks').querySelectorAll('a').forEach(x=>x.classList.toggle('active',x===a));
    currentFilter=a.dataset.group; renderGrid();
  });
  $('newsSearch').addEventListener('input',e=>{ currentQuery=e.target.value; renderGrid(); });

  renderTopBar(); renderTicker(); renderSlider(); renderGrid(); scheduleSlide();
})();
