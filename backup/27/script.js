// ==========================================================================
// UNI:CITY — script.js
// ==========================================================================

const mobilePageContent = document.querySelector('.mobile-page-content');
const homeContent = mobilePageContent ? mobilePageContent.innerHTML : '';
const appMain = document.querySelector('.app-main');

function ensureCartScript(callback) {
  if (typeof initCartPage === 'function' || typeof window.initCartPage === 'function') {
    if (callback) callback();
    return;
  }
  const existing = document.getElementById('cart-script');
  if (existing) {
    if (callback) callback();
    return;
  }
  const s = document.createElement('script');
  s.id = 'cart-script';
  s.src = './cart.js';
  s.onload = () => {
    if (callback) callback();
  };
  document.body.appendChild(s);
}

function ensureCheckoutScript(callback) {
  if (typeof initCheckoutPage === 'function' || typeof window.initCheckoutPage === 'function') {
    if (callback) callback();
    return;
  }
  const existing = document.getElementById('checkout-script');
  if (existing) {
    if (callback) callback();
    return;
  }
  const s = document.createElement('script');
  s.id = 'checkout-script';
  s.src = './checkout.js';
  s.onload = () => {
    if (callback) callback();
  };
  document.body.appendChild(s);
}

function ensureMarkingGuideScript(callback) {
  if (typeof initMarkingGuidePage === 'function' || typeof window.initMarkingGuidePage === 'function') {
    if (callback) callback();
    return;
  }
  const existing = document.getElementById('marking-guide-script');
  if (existing) {
    if (callback) callback();
    return;
  }
  const s = document.createElement('script');
  s.id = 'marking-guide-script';
  s.src = './marking_guide.js';
  s.onload = () => {
    if (callback) callback();
  };
  document.body.appendChild(s);
}

async function loadClubPage() {
  if (!mobilePageContent || !appMain) return;

  try {
    const response = await fetch('./club.html');
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const clubContent = doc.querySelector('.club-page-content');

    if (!clubContent) return;

    mobilePageContent.classList.add('page-leave');

    setTimeout(() => {
      mobilePageContent.innerHTML = clubContent.outerHTML;
      mobilePageContent.dataset.page = 'club';
      appMain.scrollTop = 0;
      syncBottomNav('club');

      mobilePageContent.classList.remove('page-leave');
      mobilePageContent.classList.add('page-enter');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mobilePageContent.classList.remove('page-enter');
          mobilePageContent.classList.add('page-enter-active');

          setTimeout(() => {
            mobilePageContent.classList.remove('page-enter-active');
          }, 320);
        });
      });

      if (typeof initClubPage === 'function') {
        initClubPage();
      }
    }, 220);
  } catch (err) {
    console.error("Error loading club page:", err);
  }
}

async function loadUniformListPage(filter) {
  if (!mobilePageContent || !appMain) return;

  try {
    const response = await fetch('./uni_list.html');
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const uniListContent = doc.querySelector('.uni-list-page-content');

    if (!uniListContent) return;

    mobilePageContent.classList.add('page-leave');

    setTimeout(() => {
      mobilePageContent.innerHTML = uniListContent.outerHTML;
      mobilePageContent.dataset.page = 'uni-list';
      appMain.scrollTop = 0;
      syncBottomNav('uni-list');

      mobilePageContent.classList.remove('page-leave');
      mobilePageContent.classList.add('page-enter');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mobilePageContent.classList.remove('page-enter');
          mobilePageContent.classList.add('page-enter-active');

          setTimeout(() => {
            mobilePageContent.classList.remove('page-enter-active');
          }, 320);
        });
      });

      if (typeof initUniformListPage === 'function') {
        initUniformListPage(filter);
      }
    }, 220);
  } catch (err) {
    console.error("Error loading uniform list page:", err);
  }
}

async function loadProductDetailPage(productId) {
  if (!mobilePageContent || !appMain) return;

  if (!document.getElementById('product-detail-style')) {
    const link = document.createElement('link');
    link.id = 'product-detail-style';
    link.rel = 'stylesheet';
    link.href = './product_detail.css';
    document.head.appendChild(link);
  }

  try {
    const response = await fetch('./product_detail.html');
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const detailContent = doc.querySelector('.product-detail-page-content');

    if (!detailContent) return;

    mobilePageContent.classList.add('page-leave');

    setTimeout(() => {
      mobilePageContent.innerHTML = detailContent.outerHTML;
      mobilePageContent.dataset.page = 'product-detail';
      appMain.scrollTop = 0;
      syncBottomNav('product-detail');

      mobilePageContent.classList.remove('page-leave');
      mobilePageContent.classList.add('page-enter');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mobilePageContent.classList.remove('page-enter');
          mobilePageContent.classList.add('page-enter-active');

          setTimeout(() => {
            mobilePageContent.classList.remove('page-enter-active');
          }, 320);
        });
      });

      if (typeof initProductDetailPage === 'function') {
        initProductDetailPage(productId);
      } else if (typeof window.initProductDetailPage === 'function') {
        window.initProductDetailPage(productId);
      }
    }, 220);
  } catch (err) {
    console.error("Error loading product detail page:", err);
  }
}
window.loadProductDetailPage = loadProductDetailPage;

async function loadCartPage() {
  if (!mobilePageContent || !appMain) return;

  if (!document.getElementById('cart-style')) {
    const link = document.createElement('link');
    link.id = 'cart-style';
    link.rel = 'stylesheet';
    link.href = './cart.css';
    document.head.appendChild(link);
  }

  try {
    const response = await fetch('./cart.html');
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const cartContent = doc.querySelector('.cart-page-content');

    if (!cartContent) return;

    mobilePageContent.classList.add('page-leave');

    setTimeout(() => {
      mobilePageContent.innerHTML = cartContent.outerHTML;
      mobilePageContent.dataset.page = 'cart';
      appMain.scrollTop = 0;
      syncBottomNav('cart');

      mobilePageContent.classList.remove('page-leave');
      mobilePageContent.classList.add('page-enter');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mobilePageContent.classList.remove('page-enter');
          mobilePageContent.classList.add('page-enter-active');

          setTimeout(() => {
            mobilePageContent.classList.remove('page-enter-active');
          }, 320);
        });
      });

      ensureCartScript(() => {
        if (typeof initCartPage === 'function') {
          initCartPage();
        } else if (typeof window.initCartPage === 'function') {
          window.initCartPage();
        }
      });
    }, 220);
  } catch (err) {
    console.error("Error loading cart page:", err);
  }
}
window.loadCartPage = loadCartPage;

async function loadCheckoutPage() {
  if (!mobilePageContent || !appMain) return;

  if (!document.getElementById('checkout-style')) {
    const link = document.createElement('link');
    link.id = 'checkout-style';
    link.rel = 'stylesheet';
    link.href = './checkout.css';
    document.head.appendChild(link);
  }

  try {
    const response = await fetch('./checkout.html');
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const checkoutContent = doc.querySelector('.checkout-page-content');

    if (!checkoutContent) return;

    mobilePageContent.classList.add('page-leave');

    setTimeout(() => {
      mobilePageContent.innerHTML = checkoutContent.outerHTML;
      mobilePageContent.dataset.page = 'checkout';
      appMain.scrollTop = 0;
      syncBottomNav('checkout');

      mobilePageContent.classList.remove('page-leave');
      mobilePageContent.classList.add('page-enter');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mobilePageContent.classList.remove('page-enter');
          mobilePageContent.classList.add('page-enter-active');

          setTimeout(() => {
            mobilePageContent.classList.remove('page-enter-active');
          }, 320);
        });
      });

      ensureCheckoutScript(() => {
        if (typeof initCheckoutPage === 'function') {
          initCheckoutPage();
        } else if (typeof window.initCheckoutPage === 'function') {
          window.initCheckoutPage();
        }
      });
    }, 220);
  } catch (err) {
    console.error("Error loading checkout page:", err);
  }
}
window.loadCheckoutPage = loadCheckoutPage;

async function loadMarkingGuidePage() {
  if (!mobilePageContent || !appMain) return;

  if (!document.getElementById('marking-guide-style')) {
    const link = document.createElement('link');
    link.id = 'marking-guide-style';
    link.rel = 'stylesheet';
    link.href = './marking_guide.css';
    document.head.appendChild(link);
  }

  try {
    const response = await fetch('./marking_guide.html');
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const guideContent = doc.querySelector('.marking-guide-page-content');

    if (!guideContent) return;

    mobilePageContent.classList.add('page-leave');

    setTimeout(() => {
      mobilePageContent.innerHTML = guideContent.outerHTML;
      mobilePageContent.dataset.page = 'marking-guide';
      appMain.scrollTop = 0;
      syncBottomNav('marking-guide');

      mobilePageContent.classList.remove('page-leave');
      mobilePageContent.classList.add('page-enter');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mobilePageContent.classList.remove('page-enter');
          mobilePageContent.classList.add('page-enter-active');

          setTimeout(() => {
            mobilePageContent.classList.remove('page-enter-active');
          }, 320);
        });
      });

      const btnGuideBack = mobilePageContent.querySelector('#btnGuideBack');
      if (btnGuideBack) {
        btnGuideBack.onclick = (e) => {
          e.preventDefault();
          if (typeof loadUniformListPage === 'function') {
            loadUniformListPage();
          }
        };
      }

      const btnGoShop = mobilePageContent.querySelector('#btnGoShop');
      if (btnGoShop) {
        btnGoShop.onclick = (e) => {
          e.preventDefault();
          if (typeof loadUniformListPage === 'function') {
            loadUniformListPage();
          }
        };
      }
    }, 220);
  } catch (err) {
    console.error("Error loading marking guide page:", err);
  }
}
window.loadMarkingGuidePage = loadMarkingGuidePage;

function syncBottomNav(pageName) {
  const bottomNavs = document.querySelectorAll('.bottom-nav');
  bottomNavs.forEach((nav) => {
    if (pageName === 'checkout' || pageName === 'cart') {
      nav.style.display = 'none';
      return;
    }
    nav.style.display = '';

    nav.querySelectorAll('.bottom-nav__item').forEach((item) => {
      const label = item.querySelector('.bottom-nav__label');
      if (!label) return;
      const text = label.textContent.trim().toLowerCase();

      item.classList.remove('is-active');

      if (pageName === 'home' && text === 'home') {
        item.classList.add('is-active');
      } else if (pageName === 'cart' && text === 'cart') {
        item.classList.add('is-active');
      } else if (pageName === 'mypage' && text === 'my page') {
        item.classList.add('is-active');
      }
    });
  });
}

async function loadMyPage() {
  if (!mobilePageContent || !appMain) return;

  if (!document.getElementById('mypage-style')) {
    const link = document.createElement('link');
    link.id = 'mypage-style';
    link.rel = 'stylesheet';
    link.href = './mypage.css';
    document.head.appendChild(link);
  }

  try {
    const response = await fetch('./mypage.html');
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const mypageContent = doc.querySelector('.mypage-page-content');

    if (!mypageContent) return;

    mobilePageContent.classList.add('page-leave');

    setTimeout(() => {
      mobilePageContent.innerHTML = mypageContent.outerHTML;
      mobilePageContent.dataset.page = 'mypage';
      appMain.scrollTop = 0;
      syncBottomNav('mypage');

      mobilePageContent.classList.remove('page-leave');
      mobilePageContent.classList.add('page-enter');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mobilePageContent.classList.remove('page-enter');
          mobilePageContent.classList.add('page-enter-active');

          setTimeout(() => {
            mobilePageContent.classList.remove('page-enter-active');
          }, 320);
        });
      });

      if (typeof initMyPage === 'function') {
        initMyPage();
      } else if (typeof window.initMyPage === 'function') {
        window.initMyPage();
      }
    }, 220);
  } catch (err) {
    console.error("Error loading My Page:", err);
  }
}
window.loadMyPage = loadMyPage;

let menuBackdropEl = null;
let menuDrawerEl = null;
let lockedScrollTop = 0;

function preventDefaultScroll(e) {
  const isInsideDrawer = e.target.closest('#menuDrawer');
  if (!isInsideDrawer) {
    e.preventDefault();
  }
}

const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
function preventKeyScroll(e) {
  const isInsideDrawer = document.activeElement && document.activeElement.closest('#menuDrawer');
  if (!isInsideDrawer && scrollKeys.includes(e.key)) {
    e.preventDefault();
  }
}

function handleBackgroundScroll(e) {
  const appMain = document.querySelector('.app-main');
  if (appMain && appMain.scrollTop !== lockedScrollTop) {
    appMain.scrollTop = lockedScrollTop;
  }
}

async function initMobileMenu() {
  const mobileApp = document.querySelector('.mobile-app');
  if (!mobileApp) return;

  if (!document.getElementById('ham-menu-style')) {
    const link = document.createElement('link');
    link.id = 'ham-menu-style';
    link.rel = 'stylesheet';
    link.href = './ham_menu.css';
    document.head.appendChild(link);
  }

  if (!document.getElementById('menuBackdrop')) {
    menuBackdropEl = document.createElement('div');
    menuBackdropEl.className = 'mobile-menu-backdrop';
    menuBackdropEl.id = 'menuBackdrop';
    mobileApp.appendChild(menuBackdropEl);
    menuBackdropEl.addEventListener('click', closeMobileMenu);
  } else {
    menuBackdropEl = document.getElementById('menuBackdrop');
  }

  if (!document.getElementById('menuDrawer')) {
    menuDrawerEl = document.createElement('div');
    menuDrawerEl.className = 'mobile-menu-drawer';
    menuDrawerEl.id = 'menuDrawer';
    mobileApp.appendChild(menuDrawerEl);
  } else {
    menuDrawerEl = document.getElementById('menuDrawer');
  }

  try {
    const response = await fetch('./ham_menu.html');
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const panel = doc.querySelector('.menu-panel');
    if (panel && menuDrawerEl) {
      menuDrawerEl.innerHTML = panel.innerHTML;
    }

    const closeBtn = menuDrawerEl.querySelector('#menuCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMobileMenu);
    }

    menuDrawerEl.querySelectorAll('.menu-item').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          closeMobileMenu();

          if (href.includes('club.html')) {
            if (typeof loadClubPage === 'function') loadClubPage();
          } else if (href.includes('uni_list.html')) {
            let filter = null;
            if (href.includes('?')) {
              const url = new URL(href, window.location.origin);
              const tab = url.searchParams.get('tab') || 'all';
              const val = url.searchParams.get('val');
              filter = { mainTab: tab };
              if (tab === 'type') filter.type = val;
              if (tab === 'collection') filter.collection = val;
            }
            if (typeof loadUniformListPage === 'function') loadUniformListPage(filter);
          } else if (href.includes('cart.html')) {
            if (typeof loadCartPage === 'function') loadCartPage();
          } else if (href.includes('checkout.html')) {
            if (typeof loadCheckoutPage === 'function') loadCheckoutPage();
          } else if (href.includes('marking_guide.html')) {
            if (typeof loadMarkingGuidePage === 'function') loadMarkingGuidePage();
          } else if (href.includes('mypage.html')) {
            if (typeof loadMyPage === 'function') loadMyPage();
          } else {
            window.location.href = href;
          }
        });
      }
    });

  } catch (err) {
    console.error("Error loading menu content:", err);
  }
}

function openMobileMenu() {
  if (!menuDrawerEl || !menuBackdropEl) return;

  const page = mobilePageContent ? mobilePageContent.dataset.page : 'home';
  menuDrawerEl.querySelectorAll('.menu-item').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    link.classList.remove('is-active');

    if (page === 'club' && href.includes('club.html')) {
      link.classList.add('is-active');
    } else if (page === 'cart' && href.includes('cart.html')) {
      link.classList.add('is-active');
    } else if (page === 'mypage' && href.includes('mypage.html')) {
      link.classList.add('is-active');
    } else if (page === 'marking-guide' && href.includes('marking_guide.html')) {
      link.classList.add('is-active');
    }
  });

  menuBackdropEl.style.display = 'block';
  menuDrawerEl.style.display = 'block';

  menuDrawerEl.getBoundingClientRect();
  menuBackdropEl.getBoundingClientRect();

  menuDrawerEl.classList.add('is-active');
  menuBackdropEl.classList.add('is-active');

  const appMain = document.querySelector('.app-main');
  if (appMain) {
    lockedScrollTop = appMain.scrollTop;
    appMain.addEventListener('scroll', handleBackgroundScroll, { passive: true });
  }

  window.addEventListener('wheel', preventDefaultScroll, { passive: false });
  window.addEventListener('touchmove', preventDefaultScroll, { passive: false });
  window.addEventListener('keydown', preventKeyScroll, { passive: false });
}

function closeMobileMenu() {
  if (!menuDrawerEl || !menuBackdropEl) return;

  menuDrawerEl.classList.remove('is-active');
  menuBackdropEl.classList.remove('is-active');

  const appMain = document.querySelector('.app-main');
  if (appMain) {
    appMain.removeEventListener('scroll', handleBackgroundScroll);
  }

  window.removeEventListener('wheel', preventDefaultScroll);
  window.removeEventListener('touchmove', preventDefaultScroll);
  window.removeEventListener('keydown', preventKeyScroll);

  setTimeout(() => {
    if (menuDrawerEl && !menuDrawerEl.classList.contains('is-active')) {
      menuBackdropEl.style.display = 'none';
      menuDrawerEl.style.display = 'none';
    }
  }, 350);
}

function setupMobileMenu() {
  initMobileMenu();

  const hamburgerBtn = document.querySelector('.app-header__menu');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openMobileMenu();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupMobileMenu);
} else {
  setupMobileMenu();
}

const aboutCard = document.querySelector('.dc-nav-card--about');
if (aboutCard) {
  aboutCard.addEventListener('click', (e) => {
    e.preventDefault();
    loadClubPage();
  });
}

const shopCard = document.querySelector('.dc-nav-card--shop');
if (shopCard) {
  shopCard.addEventListener('click', (e) => {
    e.preventDefault();
    loadUniformListPage();
  });
}

const cartCard = document.querySelector('.dc-nav-card--cart');
if (cartCard) {
  cartCard.addEventListener('click', (e) => {
    e.preventDefault();
    loadCartPage();
  });
}

const headerCartBtn = document.querySelector('.app-header__cart');
if (headerCartBtn) {
  headerCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loadCartPage();
  });
}

function initMainMobileInteractions() {
  document.querySelectorAll('.popular-uniform__filter').forEach((filter) => {
    if (filter.dataset.filterBound) return;
    filter.dataset.filterBound = 'true';

    filter.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      filter.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
    });
  });
}

document.querySelectorAll('.bottom-nav').forEach((nav) => {
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.bottom-nav__item');
    if (!item) return;
    nav.querySelectorAll('.bottom-nav__item').forEach((i) => i.classList.remove('is-active'));
    item.classList.add('is-active');

    const label = item.querySelector('.bottom-nav__label');
    if (label && label.textContent.trim().toLowerCase() === 'home') {
      if (mobilePageContent && mobilePageContent.dataset.page !== 'home') {
        mobilePageContent.classList.add('page-leave');

        setTimeout(() => {
          mobilePageContent.innerHTML = homeContent;
          mobilePageContent.dataset.page = 'home';
          if (appMain) appMain.scrollTop = 0;
          syncBottomNav('home');

          mobilePageContent.classList.remove('page-leave');
          mobilePageContent.classList.add('page-enter');

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              mobilePageContent.classList.remove('page-enter');
              mobilePageContent.classList.add('page-enter-active');

              setTimeout(() => {
                mobilePageContent.classList.remove('page-enter-active');
              }, 320);
            });
          });

          if (typeof initMainMobileInteractions === 'function') {
            initMainMobileInteractions();
          }
          if (typeof initMainParallax === 'function') {
            initMainParallax();
          }
        }, 220);
      }
    } else if (label && label.textContent.trim().toLowerCase() === 'cart') {
      if (mobilePageContent && mobilePageContent.dataset.page !== 'cart') {
        loadCartPage();
      }
    } else if (label && label.textContent.trim().toLowerCase() === 'my page') {
      if (mobilePageContent && mobilePageContent.dataset.page !== 'mypage') {
        loadMyPage();
      }
    }
  });
});

document.querySelectorAll('.dc-search__form').forEach((form) => {
  form.addEventListener('submit', (e) => e.preventDefault());
});

if (window.innerWidth >= 481 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dcInteractiveElements = document.querySelectorAll('.dc-search__form, .dc-nav-card, .dc-product-card');

  dcInteractiveElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);

      const width = rect.width;
      const height = rect.height;

      const isSearch = el.classList.contains('dc-search__form');
      const isCard = el.classList.contains('dc-product-card');

      let maxRotateY, maxRotateX;
      if (isSearch) {
        maxRotateY = 5.4;
        maxRotateX = 10.4;
      } else if (isCard) {
        maxRotateY = 9;
        maxRotateX = 18;
      } else {
        maxRotateY = 10;
        maxRotateX = 20;
      }

      const rotateY = ((x - width / 2) / (width / 2)) * maxRotateY;
      const rotateX = -((y - height / 2) / (height / 2)) * maxRotateX;

      el.style.setProperty('--rotate-x', `${rotateX}deg`);
      el.style.setProperty('--rotate-y', `${rotateY}deg`);
    });

    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--mouse-x', `-999px`);
      el.style.setProperty('--mouse-y', `-999px`);
      el.style.setProperty('--rotate-x', `0deg`);
      el.style.setProperty('--rotate-y', `0deg`);
    });
  });
}

if (window.innerWidth >= 481 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  (function () {
    const cursorContainer = document.querySelector('.neon-cursor');
    const cursorCore = document.querySelector('.neon-cursor__core');
    const cursorRing = document.querySelector('.neon-cursor__ring');
    const canvas = document.querySelector('.neon-cursor__trail');
    if (!cursorContainer || !cursorCore || !cursorRing || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    const trailPoints = [];
    const maxTrailLength = 8;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      trailPoints.push({ x: mouseX, y: mouseY, time: Date.now() });
      if (trailPoints.length > maxTrailLength) {
        trailPoints.shift();
      }
    });

    const hoverSelectors = 'a, button, input, textarea, [role="button"], .dc-search__form, .dc-nav-card, .dc-product-card, .popular-uniform__filter .filter-tab, .dc-brand-copy__sub, .dc-brand-copy__main';

    function updateHoverListeners() {
      document.querySelectorAll(hoverSelectors).forEach((el) => {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = 'true';

        el.addEventListener('mouseenter', () => {
          cursorContainer.classList.add('is-hovered');
        });
        el.addEventListener('mouseleave', () => {
          cursorContainer.classList.remove('is-hovered');
        });
      });
    }
    updateHoverListeners();

    const observer = new MutationObserver(() => {
      updateHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousedown', () => {
      cursorContainer.classList.add('is-clicked');

      const ripple = document.createElement('div');
      ripple.className = 'neon-cursor-ripple';
      ripple.style.left = `${mouseX}px`;
      ripple.style.top = `${mouseY}px`;
      cursorContainer.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 450);
    });

    window.addEventListener('mouseup', () => {
      cursorContainer.classList.remove('is-clicked');
    });

    function renderCursor() {
      cursorCore.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      const lerpFactor = 0.18;
      ringX += (mouseX - ringX) * lerpFactor;
      ringY += (mouseY - ringY) * lerpFactor;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (trailPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trailPoints[0].x, trailPoints[0].y);

        for (let i = 1; i < trailPoints.length; i++) {
          const xc = (trailPoints[i].x + trailPoints[i - 1].x) / 2;
          const yc = (trailPoints[i].y + trailPoints[i - 1].y) / 2;
          ctx.quadraticCurveTo(trailPoints[i - 1].x, trailPoints[i - 1].y, xc, yc);
        }

        const gradient = ctx.createLinearGradient(
          trailPoints[0].x, trailPoints[0].y,
          mouseX, mouseY
        );
        gradient.addColorStop(0, 'rgba(108, 171, 221, 0)');
        gradient.addColorStop(0.5, 'rgba(223, 255, 0, 0.15)');
        gradient.addColorStop(1, 'rgba(108, 171, 221, 0.45)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      if (trailPoints.length > 0) {
        const now = Date.now();
        if (now - trailPoints[trailPoints.length - 1].time > 30) {
          trailPoints.shift();
        }
      }

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  })();
}

if (window.innerWidth >= 481 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const subText = document.querySelector('.dc-brand-copy__sub');
  const mainText = document.querySelector('.dc-brand-copy__main');

  function splitText(element) {
    if (!element) return;
    const text = element.textContent;
    element.textContent = '';

    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.display = 'inline-block';
      span.style.transformOrigin = 'center';
      span.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.4)';
      element.appendChild(span);
    });
  }

  function initInteractiveText(element) {
    if (!element) return;
    splitText(element);

    const spans = element.querySelectorAll('span');

    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      spans.forEach((span) => {
        const spanRect = span.getBoundingClientRect();
        const spanX = spanRect.left + spanRect.width / 2;
        const spanY = spanRect.top + spanRect.height / 2;

        const distanceX = mouseX - spanX;
        const distanceY = mouseY - spanY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        const activeRadius = 120;

        if (distance < activeRadius) {
          const strength = (activeRadius - distance) / activeRadius;
          const translateY = Math.sin(distance * 0.05) * 12 * strength;
          const scale = 1 + 0.15 * strength;
          const rotate = (distanceX / activeRadius) * -20 * strength;

          span.style.transition = 'transform 0.05s ease';
          span.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
        } else {
          span.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.4)';
          span.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        }
      });
    });

    element.addEventListener('mouseleave', () => {
      spans.forEach((span) => {
        span.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1.4)';
        span.style.transform = 'translateY(0) scale(1) rotate(0deg)';
      });
    });

    element.addEventListener('mousedown', (e) => {
      const rect = element.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const textRipple = document.createElement('div');
      textRipple.className = 'dc-text-ripple';
      textRipple.style.left = `${clickX}px`;
      textRipple.style.top = `${clickY}px`;
      element.appendChild(textRipple);

      setTimeout(() => {
        textRipple.remove();
      }, 500);

      const mouseX = e.clientX;

      spans.forEach((span) => {
        const spanRect = span.getBoundingClientRect();
        const spanX = spanRect.left + spanRect.width / 2;
        const distanceX = Math.abs(mouseX - spanX);
        const delay = distanceX * 0.8;
        const maxDistance = 250;

        if (distanceX < maxDistance) {
          const strength = (maxDistance - distanceX) / maxDistance;

          setTimeout(() => {
            span.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            span.style.transform = `translateY(${8 * strength}px) scale(${1 - 0.25 * strength}) rotate(${(mouseX - spanX > 0 ? -1 : 1) * 15 * strength}deg)`;

            setTimeout(() => {
              span.style.transition = 'transform 0.175s cubic-bezier(0.175, 0.885, 0.32, 1.35)';
              span.style.transform = `translateY(${-18 * strength}px) scale(${1 + 0.18 * strength}) rotate(${(mouseX - spanX > 0 ? 1 : -1) * 8 * strength}deg)`;

              setTimeout(() => {
                span.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
                span.style.transform = 'translateY(0) scale(1) rotate(0deg)';
              }, 400);
            }, 100);
          }, delay);
        }
      });
    });
  }

  initInteractiveText(subText);
  initInteractiveText(mainText);
}

let parallaxElements = null;

function initMainParallax() {
  const scrollContainer = document.querySelector('.app-main');
  if (!scrollContainer) return;

  const heroImg = scrollContainer.querySelector('.hero__media img');
  const legacySection = scrollContainer.querySelector('.club-history');
  const legacyEmblem = scrollContainer.querySelector('.club-history__emblem');
  const main3Section = scrollContainer.querySelector('.club-feature-image');
  const main3Img = scrollContainer.querySelector('.club-feature-image img');
  const retroSection = scrollContainer.querySelector('.retro-collection');
  const retroImg = scrollContainer.querySelector('.retro-collection__media img');

  parallaxElements = {
    heroImg,
    legacySection,
    legacyEmblem,
    main3Section,
    main3Img,
    retroSection,
    retroImg
  };
}

(function () {
  const scrollContainer = document.querySelector('.app-main');
  if (!scrollContainer) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = motionQuery.matches;

  function clearTransforms() {
    if (!parallaxElements) return;
    const { heroImg, legacyEmblem, main3Img, retroImg } = parallaxElements;
    if (heroImg) {
      heroImg.style.transform = '';
      heroImg.style.filter = '';
    }
    if (legacyEmblem) {
      legacyEmblem.style.transform = '';
    }
    if (main3Img) {
      main3Img.style.transform = '';
    }
    if (retroImg) {
      retroImg.style.transform = '';
    }
  }

  motionQuery.addEventListener('change', (e) => {
    isReducedMotion = e.matches;
    if (isReducedMotion) {
      clearTransforms();
    } else {
      onScroll();
    }
  });

  let ticking = false;

  function updateParallax() {
    const pageContent = document.querySelector('.mobile-page-content');
    if (!pageContent || pageContent.dataset.page !== 'home' || !parallaxElements) {
      ticking = false;
      return;
    }

    if (isReducedMotion) {
      clearTransforms();
      ticking = false;
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const containerCenter = containerRect.top + containerHeight / 2;

    const { heroImg, legacySection, legacyEmblem, main3Section, main3Img, retroSection, retroImg } = parallaxElements;

    if (legacySection && legacyEmblem) {
      const rect = legacySection.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const offsetFromCenter = elementCenter - containerCenter;

      const legacyY = Math.max(-72, Math.min(72, offsetFromCenter * -0.12));
      const legacyX = Math.max(-10, Math.min(10, offsetFromCenter * -0.015));
      const legacyScale = Math.max(1.00, Math.min(1.06, 1.03 - (offsetFromCenter * 0.0001)));
      const legacyRotate = Math.max(-1, Math.min(1, offsetFromCenter * 0.0015));

      legacyEmblem.style.transform = `translate3d(${legacyX}px, calc(-50% + ${legacyY}px), 0) scale(${legacyScale}) rotate(${legacyRotate}deg)`;
    }

    if (main3Section && main3Img) {
      const rect = main3Section.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const offsetFromCenter = elementCenter - containerCenter;

      const main3Y = Math.max(-68, Math.min(68, offsetFromCenter * 0.10));
      const main3Scale = Math.max(1.10, Math.min(1.16, 1.13 - (offsetFromCenter * 0.0001)));

      main3Img.style.transform = `translate3d(0, ${main3Y}px, 0) scale(${main3Scale})`;
    }

    if (retroSection && retroImg) {
      const rect = retroSection.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const offsetFromCenter = elementCenter - containerCenter;

      const retroY = Math.max(-72, Math.min(72, offsetFromCenter * -0.10));
      const retroX = Math.max(-10, Math.min(10, offsetFromCenter * -0.015));
      const retroScale = Math.max(1.10, Math.min(1.16, 1.13 - (offsetFromCenter * 0.0001)));

      retroImg.style.transform = `translate3d(${retroX}px, ${retroY}px, 0) scale(${retroScale})`;
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  scrollContainer.addEventListener('scroll', onScroll);

  window.initMainParallax = initMainParallax;
  window.initMainMobileInteractions = initMainMobileInteractions;

  initMainParallax();
  initMainMobileInteractions();
})();

// ==========================================================================
// 데스크톱 좌측 인기 유니폼 슬라이더 (경로 정상화: ../../img/)
// ==========================================================================
(function () {
  const cards = document.querySelectorAll('.dc-product-card');
  const dots = document.querySelectorAll('.dc-carousel-indicator__dot');
  if (cards.length === 0) return;

  const productPages = [
    [
      {
        id: 'uniform_21',
        img: '../../img/uniform_21.png',
        alt: '22/23 홈 레플리카 유니폼',
        season: '22/23 SEASON',
        name: '홈 레플리카 유니폼',
        price: '189,000원'
      },
      {
        id: 'uniform_10',
        img: '../../img/uniform_10.png',
        alt: '23/24 어웨이 레플리카 유니폼',
        season: '23/24 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '135,000원'
      },
      {
        id: 'uniform_19',
        img: '../../img/uniform_19.png',
        alt: '15/16 어웨이 레플리카 유니폼',
        season: '15/16 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '103,000원'
      },
      {
        id: 'uniform_20',
        img: '../../img/uniform_20.png',
        alt: '홈 레트로 유니폼',
        season: '88/89 SEASON',
        name: '홈 레트로 유니폼',
        price: '85,000원'
      }
    ],
    [
      {
        id: 'uniform_30',
        img: '../../img/uniform_30.png',
        alt: '125주년 기념 유니폼',
        season: 'SPECIAL',
        name: '125주년 기념 유니폼',
        price: '350,000원'
      },
      {
        id: 'uniform_31',
        img: '../../img/uniform_31.png',
        alt: '26/27 홈 레플리카 유니폼',
        season: '26/27 SEASON',
        name: '홈 레플리카 유니폼',
        price: '160,000원'
      },
      {
        id: 'uniform_22',
        img: '../../img/uniform_22.png',
        alt: '15/16 홈 레플리카 유니폼',
        season: '15/16 SEASON',
        name: '홈 레플리카 유니폼',
        price: '110,000원'
      },
      {
        id: 'uniform_25',
        img: '../../img/uniform_25.png',
        alt: '19/20 써드 레플리카 유니폼',
        season: '19/20 SEASON',
        name: '써드 레플리카 유니폼',
        price: '75,000원'
      }
    ],
    [
      {
        id: 'uniform_29',
        img: '../../img/uniform_29.png',
        alt: '어웨이 레트로 유니폼',
        season: '97/98 SEASON',
        name: '어웨이 레트로 유니폼',
        price: '100,000원'
      },
      {
        id: 'uniform_27',
        img: '../../img/uniform_27.png',
        alt: '홈 레플리카 유니폼',
        season: '13/14 SEASON',
        name: '홈 레플리카 유니폼',
        price: '83,000원'
      },
      {
        id: 'uniform_23',
        img: '../../img/uniform_23.png',
        alt: '어웨이 레플리카 유니폼',
        season: '20/21 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '117,000원'
      },
      {
        id: 'uniform_9',
        img: '../../img/uniform_9.png',
        alt: '홈 레플리카 유니폼',
        season: '23/24 SEASON',
        name: '홈 레플리카 유니폼',
        price: '155,000원'
      }
    ],
    [
      {
        id: 'uniform_26',
        img: '../../img/uniform_26.png',
        alt: '홈 레플리카 유니폼',
        season: '17/18 SEASON',
        name: '홈 레플리카 유니폼',
        price: '105,000원'
      },
      {
        id: 'uniform_24',
        img: '../../img/uniform_24.png',
        alt: '어웨이 레플리카 유니폼',
        season: '25/26 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '98,000원'
      },
      {
        id: 'uniform_32',
        img: '../../img/uniform_32.png',
        alt: '홈 레플리카 유니폼',
        season: '11/12 SEASON',
        name: '홈 레플리카 유니폼',
        price: '197,000원'
      },
      {
        id: 'uniform_28',
        img: '../../img/uniform_28.png',
        alt: '홈 레트로 유니폼',
        season: '99/00 SEASON',
        name: '홈 레트로 유니폼',
        price: '100,000원'
      }
    ],
    [
      {
        id: 'uniform_33',
        img: '../../img/uniform_33.png',
        alt: '홈 레플리카 유니폼',
        season: '07/08 SEASON',
        name: '홈 레플리카 유니폼',
        price: '65,000원'
      },
      {
        id: 'uniform_34',
        img: '../../img/uniform_34.png',
        alt: '홈 레플리카 유니폼',
        season: '12/13 SEASON',
        name: '홈 레플리카 유니폼',
        price: '73,000원'
      },
      {
        id: 'uniform_13',
        img: '../../img/uniform_13.png',
        alt: '설날 기념 유니폼',
        season: 'SPECIAL',
        name: '설날 기념 유니폼',
        price: '110,000원'
      },
      {
        id: 'uniform_6',
        img: '../../img/uniform_6.png',
        alt: '어웨이 레플리카 유니폼',
        season: '26/27 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '150,000원'
      }
    ]
  ];

  let currentPage = 0;
  let sliderTimer = null;
  let isTransitioning = false;

  function showPage(pageIndex) {
    if (isTransitioning) return;
    isTransitioning = true;

    currentPage = pageIndex;

    cards.forEach((card, idx) => {
      const delay = idx * 70;
      setTimeout(() => {
        card.style.opacity = '0';

        setTimeout(() => {
          const data = productPages[pageIndex][idx];
          const img = card.querySelector('img');
          const season = card.querySelector('.dc-product-card__season');
          const name = card.querySelector('.dc-product-card__name');
          const price = card.querySelector('.dc-product-card__price');

          if (img && data) {
            img.style.display = 'block'; // 숨김 상태를 정상 복구
            img.src = data.img;
            img.alt = data.alt;
          }
          if (season && data) season.textContent = data.season;
          if (name && data) name.textContent = data.name;
          if (price && data) price.textContent = data.price;
          if (data && data.id) {
            card.setAttribute('data-product-id', data.id);
          }

          card.style.opacity = '1';
        }, 300);
      }, delay);
    });

    dots.forEach((dot, idx) => {
      if (idx === pageIndex) {
        dot.classList.add('is-active');
      } else {
        dot.classList.remove('is-active');
      }
    });

    setTimeout(() => {
      isTransitioning = false;
    }, 850);
  }

  function startTimer() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => {
      const nextPage = (currentPage + 1) % productPages.length;
      showPage(nextPage);
    }, 3000);
  }

  function resetTimer() {
    clearInterval(sliderTimer);
    startTimer();
  }

  dots.forEach((dot, idx) => {
    dot.style.cursor = 'pointer';
    dot.addEventListener('click', () => {
      if (isTransitioning) return;
      if (currentPage !== idx) {
        showPage(idx);
        resetTimer();
      }
    });
  });

  const prevBtn = document.querySelector('.dc-carousel-btn--prev');
  const nextBtn = document.querySelector('.dc-carousel-btn--next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      const prevPage = (currentPage - 1 + productPages.length) % productPages.length;
      showPage(prevPage);
      resetTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      const nextPage = (currentPage + 1) % productPages.length;
      showPage(nextPage);
      resetTimer();
    });
  }

  const productGrid = document.querySelector('.dc-product-grid');
  if (productGrid) {
    productGrid.addEventListener('mouseenter', () => {
      clearInterval(sliderTimer);
    });
    productGrid.addEventListener('mouseleave', () => {
      startTimer();
    });
  }

  startTimer();
})();

window.openProductDetail = function (productId) {
  if (typeof window.loadProductDetailPage === 'function') {
    window.loadProductDetailPage(productId);
  } else {
    window.location.href = 'product_detail.html?id=' + productId;
  }
};

document.addEventListener('click', (e) => {
  const card = e.target.closest('[data-product-id]');
  if (!card) return;

  if (e.target.closest('.dc-carousel-indicator__dot') || e.target.closest('.dc-carousel-btn')) {
    return;
  }

  if (e.target.closest('button') || e.target.closest('a') && !e.target.closest('.product-card-link')) {
    return;
  }

  const pid = card.getAttribute('data-product-id');
  if (pid) {
    e.preventDefault();
    window.openProductDetail(pid);
  }
});