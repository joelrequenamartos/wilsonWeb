(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var iconOpen = document.getElementById('navIconOpen');
  var iconClose = document.getElementById('navIconClose');
  if(toggle){
    toggle.addEventListener('click', function(){
      var open = links.getAttribute('data-open') === 'true';
      links.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
      iconOpen.style.display = open ? '' : 'none';
      iconClose.style.display = open ? 'none' : '';
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        links.setAttribute('data-open','false');
        toggle.setAttribute('aria-expanded','false');
        iconOpen.style.display = '';
        iconClose.style.display = 'none';
      });
    });
  }

  var search = document.getElementById('searchBar');
  if(search){
    search.addEventListener('submit', function(e){
      e.preventDefault();
      var el = document.getElementById('tours');
      if(el) el.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    });
  }

  var restTabsEl = document.getElementById('restTabs');
  var restTabs = restTabsEl ? restTabsEl.querySelectorAll('.map-tab') : [];
  var restCards = document.querySelectorAll('#restGrid .rest-card');
  var restEmpty = document.getElementById('restEmpty');
  var restMoreBtn = document.getElementById('restMoreBtn');
  var restLimit = 9;
  var restExpanded = false;
  var restFilter = 'all';

  function applyRestFilter(){
    var matches = [];
    restCards.forEach(function(c){
      var match = (restFilter === 'all' || c.getAttribute('data-cuisine') === restFilter);
      if(match) matches.push(c);
    });
    var capped = restFilter === 'all' && !restExpanded;
    var visibleCount = capped ? Math.min(restLimit, matches.length) : matches.length;
    restCards.forEach(function(c){ c.style.display = 'none'; });
    matches.slice(0, visibleCount).forEach(function(c){ c.style.display = ''; });
    if(restEmpty) restEmpty.hidden = matches.length > 0;
    if(restMoreBtn){
      var hasMore = capped && matches.length > restLimit;
      restMoreBtn.hidden = !(hasMore || (restFilter === 'all' && restExpanded && matches.length > restLimit));
      restMoreBtn.textContent = restExpanded ? 'Ver menos restaurantes' : 'Ver más restaurantes';
    }
  }

  restTabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      restTabs.forEach(function(t){ t.setAttribute('aria-pressed','false'); });
      tab.setAttribute('aria-pressed','true');
      restFilter = tab.getAttribute('data-filter');
      applyRestFilter();
    });
  });

  if(restMoreBtn){
    restMoreBtn.addEventListener('click', function(){
      restExpanded = !restExpanded;
      applyRestFilter();
      if(!restExpanded){
        var restSection = document.getElementById('restaurantes');
        if(restSection) restSection.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
      }
    });
  }

  applyRestFilter();

  var adBanner = document.getElementById('adBanner');
  if(adBanner){
    var adTrack = document.getElementById('adTrack');
    var adSlides = adTrack.children;
    var adDots = document.querySelectorAll('#adDots .ad-dot');
    var adPrev = document.getElementById('adPrev');
    var adNext = document.getElementById('adNext');
    var adPause = document.getElementById('adPause');
    var adPauseIcon = document.getElementById('adPauseIcon');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var adIndex = 0;
    var adTimer = null;
    var adPlaying = !reduceMotion;

    function adRender(){
      adTrack.style.transform = 'translateX(-' + (adIndex * 100) + '%)';
      adDots.forEach(function(d,i){ d.setAttribute('aria-current', i === adIndex ? 'true' : 'false'); });
    }
    function adGo(i){
      adIndex = (i + adSlides.length) % adSlides.length;
      adRender();
    }
    function adNextSlide(){ adGo(adIndex + 1); }
    function adStart(){
      if(adTimer) return;
      adTimer = setInterval(adNextSlide, 4500);
    }
    function adStop(){
      clearInterval(adTimer);
      adTimer = null;
    }
    function adSetPlaying(play){
      adPlaying = play;
      if(play){ adStart(); } else { adStop(); }
      adPause.setAttribute('aria-pressed', String(!play));
      adPause.setAttribute('aria-label', play ? 'Pausar rotación automática' : 'Reanudar rotación automática');
      adPauseIcon.innerHTML = '<use href="#' + (play ? 'i-pause' : 'i-play') + '"/>';
    }

    adPrev.addEventListener('click', function(){ adGo(adIndex - 1); adSetPlaying(false); });
    adNext.addEventListener('click', function(){ adGo(adIndex + 1); adSetPlaying(false); });
    adDots.forEach(function(dot,i){
      dot.addEventListener('click', function(){ adGo(i); adSetPlaying(false); });
    });
    adPause.addEventListener('click', function(){ adSetPlaying(!adPlaying); });
    adBanner.addEventListener('mouseenter', adStop);
    adBanner.addEventListener('mouseleave', function(){ if(adPlaying) adStart(); });
    adBanner.addEventListener('focusin', adStop);
    adBanner.addEventListener('focusout', function(){ if(adPlaying) adStart(); });

    adRender();
    adSetPlaying(adPlaying);
  }

  var tourGallery = document.getElementById('tourGallery');
  if(tourGallery){
    var galleryTrack = document.getElementById('galleryTrack');
    var gallerySlides = galleryTrack.children;
    var galleryDots = document.querySelectorAll('#galleryDots .gallery-dot');
    var galleryPrev = document.getElementById('galleryPrev');
    var galleryNext = document.getElementById('galleryNext');
    var galleryPause = document.getElementById('galleryPause');
    var galleryPauseIcon = document.getElementById('galleryPauseIcon');
    var galleryReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var galleryIndex = 0;
    var galleryTimer = null;
    var galleryPlaying = !galleryReduceMotion && gallerySlides.length > 1;

    function galleryRender(){
      galleryTrack.style.transform = 'translateX(-' + (galleryIndex * 100) + '%)';
      galleryDots.forEach(function(d,i){ d.setAttribute('aria-current', i === galleryIndex ? 'true' : 'false'); });
    }
    function galleryGo(i){
      galleryIndex = (i + gallerySlides.length) % gallerySlides.length;
      galleryRender();
    }
    function galleryNextSlide(){ galleryGo(galleryIndex + 1); }
    function galleryStart(){
      if(galleryTimer || gallerySlides.length < 2) return;
      galleryTimer = setInterval(galleryNextSlide, 4000);
    }
    function galleryStop(){
      clearInterval(galleryTimer);
      galleryTimer = null;
    }
    function gallerySetPlaying(play){
      galleryPlaying = play;
      if(play){ galleryStart(); } else { galleryStop(); }
      if(galleryPause){
        galleryPause.setAttribute('aria-pressed', String(!play));
        galleryPause.setAttribute('aria-label', play ? 'Pausar pase automático' : 'Reanudar pase automático');
        galleryPauseIcon.innerHTML = '<use href="#' + (play ? 'i-pause' : 'i-play') + '"/>';
      }
    }

    if(galleryPrev) galleryPrev.addEventListener('click', function(){ galleryGo(galleryIndex - 1); gallerySetPlaying(false); });
    if(galleryNext) galleryNext.addEventListener('click', function(){ galleryGo(galleryIndex + 1); gallerySetPlaying(false); });
    galleryDots.forEach(function(dot,i){
      dot.addEventListener('click', function(){ galleryGo(i); gallerySetPlaying(false); });
    });
    if(galleryPause) galleryPause.addEventListener('click', function(){ gallerySetPlaying(!galleryPlaying); });
    tourGallery.addEventListener('mouseenter', galleryStop);
    tourGallery.addEventListener('mouseleave', function(){ if(galleryPlaying) galleryStart(); });
    tourGallery.addEventListener('focusin', galleryStop);
    tourGallery.addEventListener('focusout', function(){ if(galleryPlaying) galleryStart(); });

    galleryRender();
    gallerySetPlaying(galleryPlaying);
  }

  var reviewCarousel = document.getElementById('reviewCarousel');
  if(reviewCarousel){
    var reviewTrack = document.getElementById('reviewTrack');
    var reviewSlideEls = Array.prototype.slice.call(reviewTrack.children);
    var reviewViewport = reviewCarousel.querySelector('.review-viewport');
    var reviewPrev = document.getElementById('reviewPrev');
    var reviewNext = document.getElementById('reviewNext');
    var reviewReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reviewRealLength = parseInt(reviewCarousel.getAttribute('data-real-length'), 10) || reviewSlideEls.length;
    var reviewClones = parseInt(reviewCarousel.getAttribute('data-clones'), 10) || 0;
    var reviewIndex = reviewClones;
    var reviewTimer = null;
    var reviewSnapTimer = null;
    var reviewPlaying = !reviewReduceMotion;

    function reviewPosition(instant){
      var slide = reviewSlideEls[reviewIndex];
      var slideWidth = slide.offsetWidth;
      var viewportWidth = reviewViewport.offsetWidth;
      var slideCenter = slide.offsetLeft + slideWidth / 2;
      var offset = viewportWidth / 2 - slideCenter;
      if(instant){
        reviewTrack.style.transition = 'none';
        reviewTrack.style.transform = 'translateX(' + offset + 'px)';
        void reviewTrack.offsetWidth;
        reviewTrack.style.transition = '';
      } else {
        reviewTrack.style.transform = 'translateX(' + offset + 'px)';
      }

      reviewSlideEls.forEach(function(el, i){
        el.classList.remove('is-active', 'is-adjacent');
        if(i === reviewIndex){ el.classList.add('is-active'); }
        else if(i === reviewIndex - 1 || i === reviewIndex + 1){ el.classList.add('is-adjacent'); }
      });
    }
    function reviewSnapIfNeeded(){
      if(reviewIndex >= reviewClones + reviewRealLength){
        reviewIndex -= reviewRealLength;
        reviewPosition(true);
      } else if(reviewIndex < reviewClones){
        reviewIndex += reviewRealLength;
        reviewPosition(true);
      }
    }
    function reviewGo(i){
      reviewIndex = i;
      reviewPosition(false);
      clearTimeout(reviewSnapTimer);
      reviewSnapTimer = setTimeout(reviewSnapIfNeeded, 520);
    }
    function reviewNextSlide(){ reviewGo(reviewIndex + 1); }
    function reviewStart(){
      if(reviewTimer || reviewRealLength < 2) return;
      reviewTimer = setInterval(reviewNextSlide, 3200);
    }
    function reviewStop(){
      clearInterval(reviewTimer);
      reviewTimer = null;
    }

    reviewPrev.addEventListener('click', function(){ reviewGo(reviewIndex - 1); reviewStop(); reviewPlaying = false; });
    reviewNext.addEventListener('click', function(){ reviewGo(reviewIndex + 1); reviewStop(); reviewPlaying = false; });
    reviewSlideEls.forEach(function(el, i){
      el.addEventListener('click', function(){ reviewGo(i); reviewStop(); reviewPlaying = false; });
    });
    reviewCarousel.addEventListener('mouseenter', reviewStop);
    reviewCarousel.addEventListener('mouseleave', function(){ if(reviewPlaying) reviewStart(); });
    reviewCarousel.addEventListener('focusin', reviewStop);
    reviewCarousel.addEventListener('focusout', function(){ if(reviewPlaying) reviewStart(); });
    window.addEventListener('resize', function(){ reviewPosition(true); });

    reviewPosition(true);
    if(reviewPlaying) reviewStart();
  }

  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  var countdownEl = document.getElementById('ebookCountdownTime');
  if(countdownEl){
    var COUNTDOWN_KEY = 'ebookCountdownEnd';
    var COUNTDOWN_MIN = 120 * 60 * 1000;
    var COUNTDOWN_MAX = 180 * 60 * 1000;
    function newCountdownEnd(){
      var end = Date.now() + COUNTDOWN_MIN + Math.random() * (COUNTDOWN_MAX - COUNTDOWN_MIN);
      try{ localStorage.setItem(COUNTDOWN_KEY, String(end)); }catch(e){}
      return end;
    }
    var countdownEnd;
    try{
      var stored = parseInt(localStorage.getItem(COUNTDOWN_KEY), 10);
      countdownEnd = (stored && stored > Date.now()) ? stored : newCountdownEnd();
    }catch(e){
      countdownEnd = newCountdownEnd();
    }
    function pad(n){ return String(n).padStart(2, '0'); }
    function renderCountdown(){
      var diff = countdownEnd - Date.now();
      if(diff <= 0){ countdownEnd = newCountdownEnd(); diff = countdownEnd - Date.now(); }
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      countdownEl.textContent = pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's';
    }
    renderCountdown();
    setInterval(renderCountdown, 1000);
  }

  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:.15});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }
})();
