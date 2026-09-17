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

  var mapTabsEl = document.getElementById('mapTabs');
  var mapTabs = mapTabsEl ? mapTabsEl.querySelectorAll('.map-tab') : [];
  var pins = document.querySelectorAll('.pin');
  mapTabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      mapTabs.forEach(function(t){ t.setAttribute('aria-pressed','false'); });
      tab.setAttribute('aria-pressed','true');
      var f = tab.getAttribute('data-filter');
      pins.forEach(function(p){
        p.style.display = (f === 'all' || p.getAttribute('data-cat') === f) ? '' : 'none';
      });
    });
  });

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

  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

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
