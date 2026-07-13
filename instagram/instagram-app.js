(function(){
  'use strict';

  const pages = (window.MATHBRO_PAGES||[]).filter(p=>Number.isFinite(p.chapter));
  const lessons = window.MATHBRO_LESSONS||{};
  const visuals = window.MATHBRO_VISUALS||{};
  const $=id=>document.getElementById(id);

  const HANDLES=['binyamin_m','moshe.h','tzafania23','zecharia_k','shilo.a','shlomo_b','itay.n','sruli22',
    'yaakov_s','avraham.k','yitzchak_r','david.m','yehuda23','naftali_b','asher.k','reuven_s',
    'efraim.d','chaim_b23','mordechai.l','baruch_s','eliyahu.k','rafael23','yisrael_b','yosef.m'];

  const TIME_LABELS=['עכשיו','15 דקות','שעה','2 שעות','4 שעות','8 שעות','12 שעות','יום','2 ימים'];

  function cleanTitle(p){ return visuals.cleanTitle?visuals.cleanTitle(p):String(p.title||''); }
  function lessonFor(p){ return lessons[p.file]||{}; }
  function handleFor(i){ return HANDLES[i%HANDLES.length]; }
  function avatarFor(p){ return visuals.chapterArt?visuals.chapterArt(p,'thumb'):''; }
  function mediaFor(p){ return visuals.chapterArt?visuals.chapterArt(p,'story'):avatarFor(p); }
  function likesFor(i){ return 640 + ((i*173+41)%2100); }
  function timeFor(i){ return TIME_LABELS[i%TIME_LABELS.length]; }
  function escapeHtml(v){ return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  const posts = pages.map((p,i)=>{
    const lesson=lessonFor(p);
    const v=lesson.visual||{};
    const questions=lesson.questions||[];
    return {
      page:p, index:i, handle:handleFor(i), avatar:avatarFor(p), media:mediaFor(p),
      title:cleanTitle(p), tag:v.tag||'', formula:v.formula||'',
      caption:lesson.beginner||lesson.advanced||'', comment:(questions[0]&&questions[0].q)||'',
      comments:questions.slice(0,6).map((q,qi)=>({handle:handleFor(i+qi*3+7),text:q.q})),
      likes:likesFor(i), time:timeFor(i),
      liked:false, saved:false,
    };
  });

  // ── header nav avatar (uses the first chapter's art, purely decorative) ──
  if(posts[0]) $('navAvatar').innerHTML = `<img src="${escapeHtml(posts[0].avatar)}" alt="">`;

  // ── stories row ──
  const SEEN_KEY='ig-story-seen';
  function readSeen(){ try{return new Set(JSON.parse(localStorage.getItem(SEEN_KEY)||'[]'))}catch(e){return new Set()} }
  const seen = readSeen();
  function saveSeen(){ localStorage.setItem(SEEN_KEY, JSON.stringify([...seen])); }

  function renderStories(){
    $('storiesRow').innerHTML = posts.map((post,i)=>`
      <button class="ig-story ${seen.has(i)?'seen':''}" data-story="${i}" type="button" aria-label="הסטורי של ${escapeHtml(post.handle)}">
        <span class="ig-story-ring"><span class="ig-story-avatar"><img src="${escapeHtml(post.avatar)}" alt=""></span></span>
        <span class="ig-story-name">${escapeHtml(post.handle)}</span>
      </button>
    `).join('');
  }
  renderStories();

  // ── feed ──
  const HEART_OUTLINE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  const HEART_FILLED='<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.7"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  const COMMENT_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  const SEND_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>';
  const SAVE_OUTLINE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  const SAVE_FILLED='<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.7"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  const MORE_ICON='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';

  function postHtml(post){
    const lessonUrl = `../learn/${post.page.file.replace(/^learn\//,'')}`;
    const captionShort = post.caption.length>90 ? post.caption.slice(0,90)+'…' : post.caption;
    return `<article class="ig-post" data-post="${post.index}">
      <div class="ig-post-head">
        <span class="ig-post-avatar"><span><img src="${escapeHtml(post.avatar)}" alt=""></span></span>
        <div class="ig-post-meta">
          <div class="ig-post-user">${escapeHtml(post.handle)}</div>
          <div class="ig-post-loc">${escapeHtml(post.title)}</div>
        </div>
        <span class="ig-post-more">${MORE_ICON}</span>
      </div>
      <div class="ig-post-media" data-like-target>
        <img src="${escapeHtml(post.media)}" alt="${escapeHtml(post.title)}">
        <div class="ig-heart-burst">${HEART_FILLED}</div>
      </div>
      <div class="ig-actions">
        <div class="ig-actions-left">
          <button class="ig-action-btn ig-like-btn" data-like-btn aria-label="לייק">${HEART_OUTLINE}</button>
          <button class="ig-action-btn" data-open-comments aria-label="תגובה">${COMMENT_ICON}</button>
          <a class="ig-action-btn" href="../whatsapp/instagram-dm.html?lesson=${post.page.chapter}" aria-label="שלחו הודעה">${SEND_ICON}</a>
        </div>
        <button class="ig-action-btn ig-save ig-save-btn" data-save-btn aria-label="שמירה">${SAVE_OUTLINE}</button>
      </div>
      <div class="ig-likes" data-likes-count>${post.likes.toLocaleString('en-US')} likes</div>
      <div class="ig-caption"><b>${escapeHtml(post.handle)}</b>${escapeHtml(captionShort)}</div>
      ${post.comment?`<div class="ig-view-comments">הצג את כל 27 התגובות</div>
      <div class="ig-top-comment"><b>${escapeHtml(handleFor(post.index+7))}</b>${escapeHtml(post.comment)}</div>`:''}
      <div class="ig-time">לפני ${escapeHtml(post.time)}</div>
      <div class="ig-add-comment">
        <span class="emoji">🙂</span>
        <input type="text" placeholder="הוסיפו תגובה..." data-comment-input>
        <button class="ig-post-btn" data-comment-post>פרסם</button>
      </div>
    </article>`;
  }

  $('feed').innerHTML = posts.map(postHtml).join('');

  // ── like / save / double-tap interactions ──
  document.getElementById('feed').addEventListener('click', e=>{
    const article = e.target.closest('.ig-post');
    if(!article) return;
    const post = posts[Number(article.dataset.post)];

    if(e.target.closest('[data-like-btn]')){ toggleLike(article, post); }
    if(e.target.closest('[data-save-btn]')){ toggleSave(article); }
    if(e.target.closest('[data-comment-post]')){
      const input = article.querySelector('[data-comment-input]');
      if(input.value.trim()){ input.value=''; }
    }
    if(e.target.closest('.ig-view-comments')||e.target.closest('[data-open-comments]')){
      openComments(post);
    }
  });

  const commentsModal=$('commentsModal'), commentsList=$('commentsList'), commentsChatLink=$('commentsChatLink');
  function openComments(post){
    commentsList.innerHTML = post.comments && post.comments.length
      ? post.comments.map(c=>`<div class="ig-comment-row">
          <span class="ig-comment-avatar"><img src="${escapeHtml(post.avatar)}" alt=""></span>
          <span class="ig-comment-body"><b>${escapeHtml(c.handle)}</b>${escapeHtml(c.text)}<div class="ig-comment-time">${escapeHtml(post.time)}</div></span>
        </div>`).join('')
      : `<div class="ig-comments-empty">אין עדיין תגובות — תהיו הראשונים לשאול</div>`;
    commentsChatLink.href = `../whatsapp/instagram-dm.html?lesson=${post.page.chapter}`;
    commentsModal.classList.add('open');
    commentsModal.hidden = false;
  }
  function closeComments(){ commentsModal.classList.remove('open'); commentsModal.hidden = true; }
  $('commentsClose').addEventListener('click', closeComments);
  commentsModal.addEventListener('click', e=>{ if(e.target===commentsModal) closeComments(); });
  document.getElementById('feed').addEventListener('dblclick', e=>{
    const media = e.target.closest('[data-like-target]');
    if(!media) return;
    const article = media.closest('.ig-post');
    const post = posts[Number(article.dataset.post)];
    if(!post.liked) toggleLike(article, post);
    const burst = media.querySelector('.ig-heart-burst');
    burst.classList.remove('pop'); void burst.offsetWidth; burst.classList.add('pop');
  });
  document.getElementById('feed').addEventListener('input', e=>{
    if(e.target.matches('[data-comment-input]')){
      const btn = e.target.closest('.ig-add-comment').querySelector('[data-comment-post]');
      btn.classList.toggle('active', e.target.value.trim().length>0);
    }
  });

  function toggleLike(article, post){
    post.liked = !post.liked;
    const btn = article.querySelector('[data-like-btn]');
    btn.classList.toggle('liked', post.liked);
    btn.innerHTML = post.liked ? HEART_FILLED : HEART_OUTLINE;
    const count = article.querySelector('[data-likes-count]');
    count.textContent = (post.likes + (post.liked?1:0)).toLocaleString('en-US') + ' likes';
  }
  function toggleSave(article){
    const btn = article.querySelector('[data-save-btn]');
    const saved = btn.classList.toggle('saved');
    btn.innerHTML = saved ? SAVE_FILLED : SAVE_OUTLINE;
  }

  // ── story viewer ──
  const modal=$('storyModal'), stage=$('storyStage'), bars=$('storyBars');
  const storyAvatar=$('storyAvatar'), storyUser=$('storyUser'), storyImg=$('storyImg'), storyLearnBtn=$('storyLearnBtn');
  let curStory=0, curSlide=0, timer=null, remaining=5000, startedAt=0;
  const DUR=5000;

  function slidesFor(post){
    const l=lessonFor(post.page);
    return visuals.storySlides?visuals.storySlides(post.page,l):[{title:post.title,text:post.caption,formula:post.formula}];
  }

  function renderSlide(){
    const post=posts[curStory];
    const slides=slidesFor(post);
    curSlide=Math.max(0,Math.min(curSlide,slides.length-1));
    const slide=slides[curSlide];
    bars.innerHTML = slides.map((_,i)=>`<i class="${i<curSlide?'done':i===curSlide?'current':''}"><span></span></i>`).join('');
    storyAvatar.src = post.avatar;
    storyUser.textContent = post.handle;
    const img = visuals.storyArt ? visuals.storyArt(post.page, slide, curSlide, 'מסלול אינסטגרם') : post.avatar;
    storyImg.src = img;
    storyLearnBtn.href = `../whatsapp/instagram-dm.html?lesson=${post.page.chapter}`;
    seen.add(curStory); saveSeen(); renderStories();
    schedule(DUR);
  }
  function schedule(ms){
    clearTimeout(timer); remaining=ms; startedAt=Date.now();
    stage.style.setProperty('--dur', ms+'ms');
    timer=setTimeout(()=>advance(1,true), ms);
  }
  function pause(){ clearTimeout(timer); remaining=Math.max(150, remaining-(Date.now()-startedAt)); stage.classList.add('paused'); }
  function resume(){ stage.classList.remove('paused'); schedule(remaining); }
  function advance(dir){
    const slides=slidesFor(posts[curStory]);
    const nextSlide=curSlide+dir;
    if(nextSlide>=0 && nextSlide<slides.length){ curSlide=nextSlide; renderSlide(); return; }
    const nextStory=curStory+dir;
    if(nextStory<0){ curStory=0; curSlide=0; renderSlide(); return; }
    if(nextStory>=posts.length){ closeStory(); return; }
    curStory=nextStory; curSlide = dir<0 ? (slidesFor(posts[curStory]).length-1) : 0;
    renderSlide();
  }
  function openStory(i){
    curStory=Math.max(0,Math.min(i,posts.length-1)); curSlide=0;
    modal.classList.add('open'); stage.classList.remove('paused');
    renderSlide();
  }
  function closeStory(){ clearTimeout(timer); modal.classList.remove('open'); stage.classList.remove('paused'); }

  $('storiesRow').addEventListener('click', e=>{
    const b=e.target.closest('[data-story]'); if(b) openStory(Number(b.dataset.story));
  });
  $('storyClose').addEventListener('click', e=>{ e.stopPropagation(); closeStory(); });
  $('storyPrev').addEventListener('click', ()=>advance(-1));
  $('storyNext').addEventListener('click', ()=>advance(1));
  stage.addEventListener('pointerdown', e=>{ if(e.target.closest('.ig-story-close,.ig-story-learn,.ig-story-reply')) return; pause(); });
  stage.addEventListener('pointerup', e=>{ if(e.target.closest('.ig-story-close,.ig-story-learn,.ig-story-reply')) return; resume(); });
  document.addEventListener('keydown', e=>{
    if(!modal.classList.contains('open')) return;
    if(e.key==='Escape') closeStory();
    if(e.key==='ArrowLeft') advance(-1);
    if(e.key==='ArrowRight') advance(1);
  });
})();
