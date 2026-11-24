/* ============================================================
   李默含 — AIGC 影像导演 · Main Interactive Controller
   ============================================================ */

(function () {
  'use strict';

  // ---- 1. Video Portfolio Data (严格按素材指定顺序组织) ----
  const VIDEOS = [
    {
      title: '儒道至圣',
      role: 'AIGC 视觉导演 · 制作组长',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/01-rudao.mp4',
      smoothFile: 'ag-mobile-rudao.mp4',
      thumb: 'ag-thumb-rudao.jpg',
      preview: 'ag-preview-rudao.mp4',
      aspect: 'landscape' // 1920x1080 (16:9)
    },
    {
      title: '全族单身狗',
      role: 'AIGC 视觉导演',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/02-bachelor.mp4',
      smoothFile: 'ag-mobile-bachelor.mp4',
      thumb: 'ag-thumb-bachelor.jpg',
      preview: 'ag-preview-bachelor.mp4',
      aspect: 'landscape' // 1920x1080 (16:9)
    },
    {
      title: '求娇',
      role: 'AIGC 视觉导演',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/03-qiujiao.mp4',
      smoothFile: 'ag-mobile-qiujiao.mp4',
      thumb: 'ag-thumb-qiujiao.jpg',
      preview: 'ag-preview-qiujiao.mp4',
      aspect: 'landscape' // 1920x1080 (16:9)
    },
    {
      title: '灭族之夜',
      role: 'AIGC 视觉导演',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/04-nightfall.mp4',
      smoothFile: 'ag-mobile-nightfall.mp4',
      thumb: 'ag-thumb-nightfall.jpg',
      preview: 'ag-preview-nightfall.mp4',
      aspect: 'portrait'  // 1080x1920 (9:16)
    },
    {
      title: '少夫人乌鸦嘴又显灵了',
      role: 'AIGC 视觉导演',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/05-prophecy.mp4',
      smoothFile: 'ag-mobile-prophecy.mp4',
      thumb: 'ag-thumb-prophecy.jpg',
      preview: 'ag-preview-prophecy.mp4',
      aspect: 'landscape' // 1920x1080 (16:9)
    },
    {
      title: '雪与兰',
      role: '独立创作 · 导演 / 剪辑 / 声音设计',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/06-snoworchid.mp4',
      smoothFile: 'ag-mobile-snoworchid.mp4',
      thumb: 'ag-thumb-snoworchid.jpg',
      preview: 'ag-preview-snoworchid.mp4',
      aspect: 'ultrawide' // 2520x1080 (21:9)
    }
  ];

  // ---- 2. DOM Elements Cache ----
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const heroAcrylic = document.getElementById('heroAcrylic');
  const heroVideo = document.getElementById('heroVideo');
  const scrollHint = document.getElementById('scrollHint');
  
  const playerModal = document.getElementById('playerModal');
  const playerBackdrop = document.getElementById('playerBackdrop');
  const playerVideo = document.getElementById('playerVideo');
  const playerTitle = document.getElementById('playerTitle');
  const playerCounter = document.getElementById('playerCounter');
  const playerClose = document.getElementById('playerClose');
  const playerPrev = document.getElementById('playerPrev');
  const playerNext = document.getElementById('playerNext');
  const playerVideoWrap = document.getElementById('playerVideoWrap');
  const playerQuality = document.getElementById('playerQuality');
  const playerStatus = document.getElementById('playerStatus');
  
  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const copyEmailBtn = document.getElementById('copyEmail');

  let currentVideoIndex = 0;
  let isPlayerOpen = false;
  let loadSequence = 0;
  let pendingSeekTime = null;
  let resumeHeroAfterPlayer = false;
  let lastPlayerTrigger = null;

  const mobileMedia = window.matchMedia('(max-width: 767px), (pointer: coarse)');
  const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const qualityStorageKey = 'lmh-player-quality';

  function prefersLightweightMedia() {
    return mobileMedia.matches || Boolean(connection && connection.saveData);
  }

  let selectedQuality = prefersLightweightMedia() ? 'smooth' : 'hd';
  try {
    const savedQuality = sessionStorage.getItem(qualityStorageKey);
    if (savedQuality === 'smooth' || savedQuality === 'hd') selectedQuality = savedQuality;
  } catch (e) { /* Storage may be unavailable in private browsing. */ }
  playerQuality.value = selectedQuality;

  function heroIsVisible() {
    if (!heroVideo || document.hidden) return false;
    const rect = heroVideo.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function playHeroIfAppropriate() {
    if (heroVideo && !isPlayerOpen && !prefersLightweightMedia() && heroIsVisible()) {
      heroVideo.play().catch(() => {});
    }
  }

  function pauseCardPreviews() {
    document.querySelectorAll('.work-card-preview').forEach(preview => preview.pause());
  }

  function configureBackgroundMedia() {
    const lightweight = prefersLightweightMedia();
    document.documentElement.classList.toggle('media-lightweight', lightweight);
    if (!heroVideo) return;
    const source = heroVideo.querySelector('source');
    if (!source) return;
    if (lightweight) {
      heroVideo.pause();
      pauseCardPreviews();
      if (source.hasAttribute('src')) {
        source.removeAttribute('src');
        heroVideo.load();
      }
    } else {
      if (!source.hasAttribute('src')) {
        source.src = source.dataset.src;
        heroVideo.load();
      }
      playHeroIfAppropriate();
    }
  }

  configureBackgroundMedia();
  if (mobileMedia.addEventListener) mobileMedia.addEventListener('change', configureBackgroundMedia);
  else if (mobileMedia.addListener) mobileMedia.addListener(configureBackgroundMedia);
  if (connection && connection.addEventListener) connection.addEventListener('change', configureBackgroundMedia);

  let resumeHeroAfterVisibility = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeHeroAfterVisibility = Boolean(heroVideo && !heroVideo.paused);
      if (heroVideo) heroVideo.pause();
      pauseCardPreviews();
    } else if (resumeHeroAfterVisibility) {
      playHeroIfAppropriate();
      resumeHeroAfterVisibility = false;
    }
  });

  // ---- 3. Navigation & Scroll State ----
  function updateNav() {
    const isScrolled = window.scrollY > 40;
    nav.classList.toggle('scrolled', isScrolled);
  }

  // Hamburger menu toggle
  function toggleMobileMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    navToggle.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => toggleMobileMenu());
  }
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => toggleMobileMenu(false));
  }

  // Close mobile menu on anchor click
  document.querySelectorAll('[data-close-menu]').forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  // ---- 4. Hero Acrylic Scroll Effect (磨砂亚克力随滑动变化) ----
  function updateHeroAcrylic() {
    if (!heroAcrylic) return;
    const heroHeight = window.innerHeight || 800;
    const scrollY = window.scrollY || 0;
    
    // Progress from 0 to 1 as user scrolls past first half of hero
    const progress = Math.min(scrollY / (heroHeight * 0.6), 1);
    
    // Acrylic starts at 0.85 opacity and fades to 0
    const opacity = 0.85 * (1 - progress);
    heroAcrylic.style.opacity = opacity.toFixed(3);
    
    // Dynamically adjust blur and saturation
    const blur = (20 * (1 - progress)).toFixed(1);
    const saturate = (160 - 40 * progress).toFixed(0);
    heroAcrylic.style.backdropFilter = `blur(${blur}px) saturate(${saturate}%)`;
    heroAcrylic.style.webkitBackdropFilter = `blur(${blur}px) saturate(${saturate}%)`;
    
    // Fade scroll hint early
    if (scrollHint) {
      const hintOpacity = Math.max(0, 1 - scrollY / 120);
      scrollHint.style.opacity = hintOpacity.toFixed(2);
      scrollHint.style.pointerEvents = hintOpacity < 0.1 ? 'none' : 'auto';
    }
  }

  // Optimized RAF Scroll Loop
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateNav();
        updateHeroAcrylic();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Initial call
  updateNav();
  updateHeroAcrylic();

  // ---- 5. Scroll Reveal with Immediate In-Viewport Fallback ----
  const revealElements = document.querySelectorAll('.work-card, .highlight-card, .exp-item');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px 50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if no observer
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // Safety trigger on DOMContentLoaded and load to ensure no hidden items
  function ensureVisible() {
    const windowH = window.innerHeight;
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < windowH + 100) {
        el.classList.add('revealed');
      }
    });
  }
  window.addEventListener('load', ensureVisible);
  setTimeout(ensureVisible, 600);

  // ---- 6. Work Cards Hover Preview Loop ----
  document.querySelectorAll('.work-card').forEach(card => {
    const preview = card.querySelector('.work-card-preview');
    if (!preview) return;

    let hoverTimer = null;

    card.addEventListener('mouseenter', () => {
      if (isPlayerOpen || prefersLightweightMedia() || !hoverMedia.matches) return;
      hoverTimer = setTimeout(() => {
        if (isPlayerOpen || prefersLightweightMedia() || !hoverMedia.matches || document.hidden) return;
        preview.currentTime = 0;
        preview.play().catch(() => {});
      }, 150);
    });

    card.addEventListener('mouseleave', () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      preview.pause();
      preview.currentTime = 0;
    });
  });

  // ---- 7. Video Player Modal (有声播放、切换画幅、控制条) ----
  function setPlayerStatus(message) {
    playerStatus.textContent = message;
  }

  function requestPlayback(sequence) {
    const playPromise = playerVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        if (!isPlayerOpen || sequence !== loadSequence || error.name === 'AbortError') return;
        setPlayerStatus(error.name === 'NotAllowedError'
          ? '点击画面中的播放按钮继续'
          : '暂时无法播放，请切换清晰度重试。');
      });
    }
  }

  function loadAndPlayVideo(index, playbackState) {
    const state = playbackState || {
      time: 0,
      shouldPlay: true,
      volume: playerVideo.volume,
      muted: playerVideo.muted
    };
    const sequence = ++loadSequence;
    playerVideo.pause();
    currentVideoIndex = (index + VIDEOS.length) % VIDEOS.length;
    const videoData = VIDEOS[currentVideoIndex];

    // Update metadata in modal
    playerTitle.textContent = `${videoData.title} — ${videoData.role}`;
    playerCounter.textContent = `${currentVideoIndex + 1} / ${VIDEOS.length}`;

    // Adjust container aspect ratio class
    playerVideoWrap.className = 'player-video-wrap';
    if (videoData.aspect === 'portrait') {
      playerVideoWrap.classList.add('portrait');
    } else if (videoData.aspect === 'ultrawide') {
      playerVideoWrap.classList.add('ultrawide');
    }

    // Only the chosen file is requested; phones use the same-origin lighter copy.
    pendingSeekTime = state.time;
    setPlayerStatus('正在加载…');
    playerVideo.preload = 'metadata';
    playerVideo.src = selectedQuality === 'smooth' ? videoData.smoothFile : videoData.file;
    playerVideo.poster = videoData.thumb;
    playerVideo.volume = state.volume;
    playerVideo.muted = state.muted;
    playerVideo.load();
    // Keep this within the click gesture for mobile browsers' sound policy.
    if (state.shouldPlay) requestPlayback(sequence);
  }

  function openPlayer(index) {
    lastPlayerTrigger = document.activeElement;
    resumeHeroAfterPlayer = Boolean(heroVideo && !heroVideo.paused);
    if (heroVideo) heroVideo.pause();
    pauseCardPreviews();
    isPlayerOpen = true;
    playerModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    loadAndPlayVideo(index);
    playerClose.focus({ preventScroll: true });
  }

  function closePlayer() {
    isPlayerOpen = false;
    ++loadSequence;
    pendingSeekTime = null;
    playerVideo.pause();
    playerVideo.removeAttribute('src');
    playerVideo.preload = 'none';
    playerVideo.load(); // Flush buffer
    playerModal.classList.remove('open');
    document.body.style.overflow = '';
    setPlayerStatus('');
    if (resumeHeroAfterPlayer) playHeroIfAppropriate();
    resumeHeroAfterPlayer = false;
    if (lastPlayerTrigger && lastPlayerTrigger.isConnected) lastPlayerTrigger.focus({ preventScroll: true });
  }

  function nextVideo() {
    loadAndPlayVideo(currentVideoIndex + 1);
  }

  function prevVideo() {
    loadAndPlayVideo(currentVideoIndex - 1);
  }

  // Player Event Listeners
  if (playerClose) playerClose.addEventListener('click', closePlayer);
  if (playerBackdrop) playerBackdrop.addEventListener('click', closePlayer);
  if (playerNext) playerNext.addEventListener('click', nextVideo);
  if (playerPrev) playerPrev.addEventListener('click', prevVideo);

  playerQuality.addEventListener('change', () => {
    const quality = playerQuality.value;
    if (quality !== 'smooth' && quality !== 'hd') return;
    if (quality === selectedQuality) return;
    const playbackState = {
      time: pendingSeekTime !== null ? pendingSeekTime : playerVideo.currentTime,
      shouldPlay: !playerVideo.paused && !playerVideo.ended,
      volume: playerVideo.volume,
      muted: playerVideo.muted
    };
    selectedQuality = quality;
    try { sessionStorage.setItem(qualityStorageKey, selectedQuality); } catch (e) {}
    if (isPlayerOpen) loadAndPlayVideo(currentVideoIndex, playbackState);
  });

  playerVideo.addEventListener('loadedmetadata', () => {
    if (!isPlayerOpen || pendingSeekTime === null) return;
    const maxTime = Number.isFinite(playerVideo.duration) ? Math.max(0, playerVideo.duration - 0.05) : pendingSeekTime;
    const time = Math.min(Math.max(0, pendingSeekTime), maxTime);
    if (time > 0) playerVideo.currentTime = time;
    pendingSeekTime = null;
  });
  playerVideo.addEventListener('waiting', () => {
    if (isPlayerOpen) setPlayerStatus('正在缓冲…');
  });
  ['canplay', 'playing'].forEach(eventName => {
    playerVideo.addEventListener(eventName, () => {
      if (isPlayerOpen) setPlayerStatus('');
    });
  });
  playerVideo.addEventListener('error', () => {
    if (isPlayerOpen && playerVideo.error) setPlayerStatus('暂时无法播放，请切换清晰度重试。');
  });

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (!isPlayerOpen) return;
    
    if (e.key === 'Escape') {
      closePlayer();
    } else if (e.target === playerQuality || e.target === playerVideo) {
      // Let the native quality menu and video controls handle their own keys.
      return;
    } else if (e.key === 'ArrowRight') {
      nextVideo();
    } else if (e.key === 'ArrowLeft') {
      prevVideo();
    } else if (e.key === ' ' && e.target === document.body) {
      e.preventDefault();
      if (playerVideo.paused) requestPlayback(loadSequence);
      else playerVideo.pause();
    }
  });

  // Hero Play CTA
  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => {
      openPlayer(0); // 《儒道至圣》最高优先播放
    });
  }

  // Work Cards Click to Play
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Ignore if user clicked a direct external link
      if (e.target.closest('a')) return;
      const index = parseInt(card.dataset.videoIndex, 10);
      if (!isNaN(index)) {
        openPlayer(index);
      }
    });
  });

  // ---- 8. 一键复制邮箱功能 ----
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = copyEmailBtn.dataset.copy || '3380294467@qq.com';
      const labelSpan = copyEmailBtn.querySelector('span');
      const originalText = labelSpan ? labelSpan.textContent : '一键复制邮箱';

      function showSuccess() {
        copyEmailBtn.classList.add('copied');
        if (labelSpan) labelSpan.textContent = '邮箱已复制到剪贴板';
        setTimeout(() => {
          copyEmailBtn.classList.remove('copied');
          if (labelSpan) labelSpan.textContent = originalText;
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showSuccess).catch(() => {
          fallbackCopy(email, showSuccess);
        });
      } else {
        fallbackCopy(email, showSuccess);
      }
    });
  }

  function fallbackCopy(text, callback) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      callback();
    } catch (e) {
      alert('已选中邮箱：' + text);
    }
    document.body.removeChild(tempInput);
  }

  // ---- 9. Smooth Anchor Scrolling ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 68;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---- 10. URL Query Param Direct Play (e.g. ?play=0) ----
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const playParam = urlParams.get('play');
    if (playParam !== null) {
      const idx = parseInt(playParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < VIDEOS.length) {
        setTimeout(() => openPlayer(idx), 400);
      }
    }
  } catch (e) {}

})();
