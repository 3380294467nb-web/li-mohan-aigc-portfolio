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
      thumb: 'ag-thumb-rudao.jpg',
      preview: 'ag-preview-rudao.mp4',
      aspect: 'landscape' // 1920x1080 (16:9)
    },
    {
      title: '全族单身狗',
      role: 'AIGC 视觉导演',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/02-bachelor.mp4',
      thumb: 'ag-thumb-bachelor.jpg',
      preview: 'ag-preview-bachelor.mp4',
      aspect: 'landscape' // 1920x1080 (16:9)
    },
    {
      title: '求娇',
      role: 'AIGC 视觉导演',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/03-qiujiao.mp4',
      thumb: 'ag-thumb-qiujiao.jpg',
      preview: 'ag-preview-qiujiao.mp4',
      aspect: 'landscape' // 1920x1080 (16:9)
    },
    {
      title: '灭族之夜',
      role: 'AIGC 视觉导演',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/04-nightfall.mp4',
      thumb: 'ag-thumb-nightfall.jpg',
      preview: 'ag-preview-nightfall.mp4',
      aspect: 'portrait'  // 1080x1920 (9:16)
    },
    {
      title: '少夫人乌鸦嘴又显灵了',
      role: 'AIGC 视觉导演',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/05-prophecy.mp4',
      thumb: 'ag-thumb-prophecy.jpg',
      preview: 'ag-preview-prophecy.mp4',
      aspect: 'landscape' // 1920x1080 (16:9)
    },
    {
      title: '雪与兰',
      role: '独立创作 · 导演 / 剪辑 / 声音设计',
      file: 'https://github.com/3380294467nb-web/li-mohan-aigc-portfolio/releases/download/portfolio-20261124/06-snoworchid.mp4',
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
  
  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const copyEmailBtn = document.getElementById('copyEmail');

  let currentVideoIndex = 0;
  let isPlayerOpen = false;

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
      hoverTimer = setTimeout(() => {
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
  function loadAndPlayVideo(index) {
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

    // Load video file
    playerVideo.src = videoData.file;
    playerVideo.poster = videoData.thumb;
    playerVideo.muted = false; // 用户主动点击看片，开启有声播放
    playerVideo.volume = 1.0;

    // Start playback
    const playPromise = playerVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback: If autoplay with sound is blocked by browser policy, mute and play
        playerVideo.muted = true;
        playerVideo.play().catch(() => {});
      });
    }
  }

  function openPlayer(index) {
    isPlayerOpen = true;
    playerModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    loadAndPlayVideo(index);
  }

  function closePlayer() {
    isPlayerOpen = false;
    playerVideo.pause();
    playerVideo.removeAttribute('src');
    playerVideo.load(); // Flush buffer
    playerModal.classList.remove('open');
    document.body.style.overflow = '';
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

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (!isPlayerOpen) return;
    
    if (e.key === 'Escape') {
      closePlayer();
    } else if (e.key === 'ArrowRight') {
      nextVideo();
    } else if (e.key === 'ArrowLeft') {
      prevVideo();
    } else if (e.key === ' ' && e.target === document.body) {
      e.preventDefault();
      if (playerVideo.paused) playerVideo.play();
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
