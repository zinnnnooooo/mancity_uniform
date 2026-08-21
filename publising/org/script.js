// ==========================================================================
// UNI:CITY — script.js
// ==========================================================================

const mobilePageContent = document.querySelector('.mobile-page-content');
const homeContent = mobilePageContent ? mobilePageContent.innerHTML : '';
const appMain = document.querySelector('.app-main');

// --------------------------------------------------------------------------
// LOGIN UI TOGGLE — 로그인 화면 활성 시 공통 Navigation 숨기기
// --------------------------------------------------------------------------

/**
 * 로그인 화면 진입: .mobile-app에 is-login-active 클래스 추가
 * → CSS에서 Header / Bottom Nav / Scrollbar 숨김 처리
 */
function _activateLoginUI() {
  const mobileApp = document.querySelector('.mobile-app');
  if (mobileApp) mobileApp.classList.add('is-login-active');
}

/**
 * 로그인 화면 해제: .mobile-app에서 is-login-active 클래스 제거
 * → Header / Bottom Nav / Scrollbar 복구
 */
function _deactivateLoginUI() {
  const mobileApp = document.querySelector('.mobile-app');
  if (mobileApp) mobileApp.classList.remove('is-login-active');
}

/**
 * 로그아웃 확인 팝업창을 모바일 프리뷰에 표시합니다.
 * @param {Function} onConfirm 예 버튼을 눌렀을 때 실행될 콜백 함수
 */
function showLogoutConfirmPopup(onConfirm) {
  if (typeof onConfirm !== 'function') return;

  // 기존 팝업 제거 (중복 방지)
  const existing = document.getElementById('logoutConfirmOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'logoutConfirmOverlay';
  overlay.className = 'logout-confirm-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="logout-confirm-popup">
      <p class="logout-confirm-popup__text">정말 로그아웃 하시겠습니까?</p>
      <div class="logout-confirm-popup__buttons">
        <button type="button" class="logout-confirm-btn logout-confirm-btn--no" id="logoutNoBtn">아니오</button>
        <button type="button" class="logout-confirm-btn logout-confirm-btn--yes" id="logoutYesBtn">예</button>
      </div>
    </div>
  `;

  const mobilePreview = document.querySelector('.mobile-preview');
  const mountTarget = mobilePreview || document.body;
  mountTarget.appendChild(overlay);

  // 애니메이션 프레임 적용
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
    });
  });

  const closePopup = () => {
    overlay.classList.remove('is-visible');
    overlay.classList.add('is-hiding');
    setTimeout(() => {
      overlay.remove();
    }, 280);
  };

  // 아니오 버튼 바인딩
  const noBtn = overlay.querySelector('#logoutNoBtn');
  if (noBtn) {
    noBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closePopup();
    });
  }

  // 예 버튼 바인딩
  const yesBtn = overlay.querySelector('#logoutYesBtn');
  if (yesBtn) {
    yesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closePopup();
      onConfirm();
    });
  }
}

/**
 * 로그인/로그아웃 버튼 렌더링 및 상태 동기화
 * @param {string} containerId
 */
function renderAccountButton(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const isLoggedIn = (typeof AuthManager !== 'undefined') ? AuthManager.isLoggedIn() : false;

  if (isLoggedIn) {
    container.innerHTML = `
      <button type="button" class="account-btn account-btn--logout" id="${containerId}Btn">로그아웃</button>
    `;
  } else {
    container.innerHTML = `
      <button type="button" class="account-btn account-btn--login" id="${containerId}Btn">로그인</button>
    `;
  }

  const btn = document.getElementById(`${containerId}Btn`);
  if (btn) {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (isLoggedIn) {
        // 즉시 로그아웃 하지 않고 확인 팝업 띄움
        showLogoutConfirmPopup(async () => {
          // 로그아웃 처리: Firebase signOut (Google 사용자) + localStorage 정리
          const currentUser = (typeof AuthManager !== 'undefined') ? AuthManager.getUser() : null;
          const isGoogleUser = currentUser && currentUser.provider === 'google';

          if (isGoogleUser && typeof firebase !== 'undefined') {
            try {
              await firebase.auth().signOut();
              console.log('[Firebase] 햄버거 메뉴 로그아웃 성공');
            } catch (err) {
              console.error('[Firebase] 햄버거 메뉴 로그아웃 실패:', err);
            }
          }

          if (typeof AuthManager !== 'undefined') {
            AuthManager.clearUser();
          } else {
            localStorage.removeItem('unicity_user');
          }

          // 장바구니 Badge 갱신
          if (typeof updateCartBadgeCount === 'function') {
            updateCartBadgeCount();
          }

          // 햄버거 메뉴 닫기
          if (typeof closeMobileMenu === 'function') {
            closeMobileMenu();
          }

          // 로그아웃 후 비로그인 둘러보기 상태로 Main 페이지(Home)로 이동
          if (mobilePageContent) {
            mobilePageContent.innerHTML = homeContent;
            mobilePageContent.dataset.page = 'home';
            if (appMain) appMain.scrollTop = 0;
            syncBottomNav('home');
            updateHeaderMenuButton('home');
            updateCartBadgeCount();
            if (typeof initMainMobileInteractions === 'function') {
              initMainMobileInteractions();
            }
            if (typeof initMainParallax === 'function') {
              initMainParallax();
            }
          }

          // UI 버튼 동기화
          updateHeaderAuthButton();
          renderAccountButton('hamAccountContainer');
          renderAccountButton('mypageAccountContainer');
        });
      } else {
        // 로그인 처리 (로그인 화면으로 이동)
        if (typeof closeMobileMenu === 'function') {
          closeMobileMenu();
        }
        if (typeof loadLoginPage === 'function') {
          loadLoginPage();
        }
      }
    });
  }
  updateHeaderAuthButton();
}

function initHeaderAuthButton() {
  const headerAuthBtn = document.getElementById('headerAuthBtn');
  if (!headerAuthBtn) return;

  headerAuthBtn.addEventListener('click', () => {
    if (typeof _authGateActive !== 'undefined' && _authGateActive) return;

    const isLoggedIn = (typeof AuthManager !== 'undefined') ? AuthManager.isLoggedIn() : false;
    if (isLoggedIn) {
      showLogoutConfirmPopup(async () => {
        const currentUser = (typeof AuthManager !== 'undefined') ? AuthManager.getUser() : null;
        const isGoogleUser = currentUser && currentUser.provider === 'google';

        if (isGoogleUser && typeof firebase !== 'undefined') {
          try {
            await firebase.auth().signOut();
            console.log('[Firebase] 헤더 로그아웃 성공');
          } catch (err) {
            console.error('[Firebase] 헤더 로그아웃 실패:', err);
          }
        }

        if (typeof AuthManager !== 'undefined') {
          AuthManager.clearUser();
        } else {
          localStorage.removeItem('unicity_user');
        }

        if (typeof updateCartBadgeCount === 'function') {
          updateCartBadgeCount();
        }

        // 로그아웃 후 비로그인 둘러보기 상태로 Main 페이지(Home)로 이동
        if (mobilePageContent) {
          mobilePageContent.innerHTML = homeContent;
          mobilePageContent.dataset.page = 'home';
          if (appMain) appMain.scrollTop = 0;
          syncBottomNav('home');
          updateHeaderMenuButton('home');
          if (typeof initMainMobileInteractions === 'function') {
            initMainMobileInteractions();
          }
          if (typeof initMainParallax === 'function') {
            initMainParallax();
          }
        }

        updateHeaderAuthButton();
        renderAccountButton('hamAccountContainer');
        renderAccountButton('mypageAccountContainer');
      });
    } else {
      if (typeof loadLoginPage === 'function') {
        loadLoginPage();
      }
    }
  });

  updateHeaderAuthButton();
}

function updateHeaderAuthButton() {
  const headerAuthBtn = document.getElementById('headerAuthBtn');
  if (!headerAuthBtn) return;

  const isLoggedIn = (typeof AuthManager !== 'undefined') ? AuthManager.isLoggedIn() : false;
  if (isLoggedIn) {
    headerAuthBtn.innerHTML = '<img src="img/logout.svg" alt="로그아웃" style="width: 100%; height: 100%; object-fit: contain; object-position: right center; display: block;">';
    headerAuthBtn.classList.remove('app-header__auth-btn--login');
    headerAuthBtn.classList.add('app-header__auth-btn--logout');
  } else {
    headerAuthBtn.innerHTML = '<img src="img/login.svg" alt="로그인" style="width: 100%; height: 100%; object-fit: contain; object-position: right center; display: block;">';
    headerAuthBtn.classList.remove('app-header__auth-btn--logout');
    headerAuthBtn.classList.add('app-header__auth-btn--login');
  }
}


/**
 * 상단 왼쪽 햄버거/뒤로가기 버튼 갱신
 * @param {string} pageName
 */
function updateHeaderMenuButton(pageName) {
  const menuBtn = document.querySelector('.app-header__menu');
  if (!menuBtn) return;
  const placeholder = menuBtn.querySelector('.icon-placeholder');
  if (!placeholder) return;

  if (pageName === 'home' || !pageName) {
    placeholder.textContent = '☰';
    menuBtn.setAttribute('aria-label', '메뉴 열기');
  } else {
    placeholder.textContent = '←';
    menuBtn.setAttribute('aria-label', '홈으로 가기');
  }
}

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
      updateCartBadgeCount();
      updateHeaderMenuButton('club');

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
      updateCartBadgeCount();
      updateHeaderMenuButton('uni-list');

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
      updateCartBadgeCount();
      updateHeaderMenuButton('product-detail');

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

      // 장바구니 담기 버튼 클릭 시 Badge 갱신
      setTimeout(() => {
        const addToCartBtns = mobilePageContent.querySelectorAll('[id*="btnCart"], [id*="btnAdd"], .btn-add-to-cart, .js-add-to-cart');
        addToCartBtns.forEach((btn) => {
          btn.addEventListener('click', () => setTimeout(updateCartBadgeCount, 100));
        });
      }, 300);
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
      updateCartBadgeCount();
      updateHeaderMenuButton('cart');

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

        // 장바구니 삭제/수량 변경 시 Badge 갱신
        setTimeout(() => {
          const cartListEl = mobilePageContent.querySelector('[id*="cartList"], .cart-list, [class*="cart-item"]')?.closest('ul, div') || mobilePageContent;
          cartListEl.addEventListener('click', () => setTimeout(updateCartBadgeCount, 50));
        }, 300);
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
      updateCartBadgeCount();
      updateHeaderMenuButton('checkout');

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
      updateCartBadgeCount();
      updateHeaderMenuButton('marking-guide');

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

      ensureMarkingGuideScript(() => {
        if (typeof initMarkingGuidePage === 'function') {
          initMarkingGuidePage();
        } else if (typeof window.initMarkingGuidePage === 'function') {
          window.initMarkingGuidePage();
        }
      });
    }, 220);
  } catch (err) {
    console.error("Error loading marking guide page:", err);
  }
}
window.loadMarkingGuidePage = loadMarkingGuidePage;

// ==========================================================================
// 장바구니 Badge 수량 갱신
// ==========================================================================
function updateCartBadgeCount() {
  const badgeEl = document.getElementById('cartBadge');
  if (!badgeEl) return;

  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('unicity_cart')) || [];
  } catch (e) {
    cart = [];
  }

  const totalCount = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  if (totalCount > 0) {
    badgeEl.textContent = totalCount > 99 ? '99+' : String(totalCount);
    badgeEl.classList.add('is-active');
  } else {
    badgeEl.classList.remove('is-active');
  }
}
window.updateCartBadgeCount = updateCartBadgeCount;

function syncBottomNav(pageName) {
  const bottomNavs = document.querySelectorAll('.bottom-nav');
  bottomNavs.forEach((nav) => {
    if (pageName === 'checkout') {
      nav.style.display = 'none';
      return;
    }
    // 로그인 화면: display는 복원 상태로 두고 CSS 클래스(is-login-active)가 숨김 처리
    if (pageName === 'login') {
      nav.style.display = '';
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
      } else if (pageName === 'wishlist' && text === 'wishlist') {
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
      updateCartBadgeCount();
      updateHeaderMenuButton('mypage');
      renderAccountButton('mypageAccountContainer');

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

// --------------------------------------------------------------------------
// loadLoginPage — 로그인 페이지를 모바일 페이지 전환 구조로 불러옵니다.
// 다른 loadXxxPage() 함수와 동일한 패턴을 사용합니다.
// --------------------------------------------------------------------------
async function loadLoginPage() {
  if (!mobilePageContent || !appMain) return;

  // login.css 동적 로드 (중복 방지)
  if (!document.getElementById('login-style')) {
    const link = document.createElement('link');
    link.id = 'login-style';
    link.rel = 'stylesheet';
    link.href = './login.css';
    document.head.appendChild(link);
  }

  try {
    const response = await fetch('./login.html');
    if (!response.ok) throw new Error(`login.html fetch 실패: ${response.status}`);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const loginContent = doc.querySelector('.login-page-content');

    if (!loginContent) {
      console.error('[loadLoginPage] .login-page-content 를 찾을 수 없습니다.');
      return;
    }

    mobilePageContent.classList.add('page-leave');

    setTimeout(() => {
      mobilePageContent.innerHTML = loginContent.outerHTML;
      mobilePageContent.dataset.page = 'login';
      appMain.scrollTop = 0;
      syncBottomNav('login');
      updateCartBadgeCount();

      // ── 로그인 화면 활성화: 공통 Nav UI 숨김 ──
      _activateLoginUI();
      updateHeaderMenuButton('login');

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

      // login.js initLoginPage() 호출
      if (typeof initLoginPage === 'function') {
        initLoginPage({
          // 로그인 성공 → Nav UI 복구 후 Main(Home)으로 이동
          onLoginSuccess: (userData) => {
            _deactivateLoginUI();
            if (mobilePageContent) {
              mobilePageContent.innerHTML = homeContent;
              mobilePageContent.dataset.page = 'home';
              if (appMain) appMain.scrollTop = 0;
              syncBottomNav('home');
              updateHeaderMenuButton('home');
              updateCartBadgeCount();
              if (typeof initMainMobileInteractions === 'function') {
                initMainMobileInteractions();
              }
              if (typeof initMainParallax === 'function') {
                initMainParallax();
              }
            }
            updateHeaderAuthButton();
            renderAccountButton('hamAccountContainer');
            renderAccountButton('mypageAccountContainer');
          },
          // 로그아웃 → 비로그인 둘러보기 상태로 Main(Home)으로 이동
          onLogout: () => {
            _deactivateLoginUI();
            if (mobilePageContent) {
              mobilePageContent.innerHTML = homeContent;
              mobilePageContent.dataset.page = 'home';
              if (appMain) appMain.scrollTop = 0;
              syncBottomNav('home');
              updateHeaderMenuButton('home');
              updateCartBadgeCount();
              if (typeof initMainMobileInteractions === 'function') {
                initMainMobileInteractions();
              }
              if (typeof initMainParallax === 'function') {
                initMainParallax();
              }
            }
            updateHeaderAuthButton();
            renderAccountButton('hamAccountContainer');
            renderAccountButton('mypageAccountContainer');
          },
          // 비회원 둘러보기 → Nav UI 복구 후 홈으로 이동
          onGuest: () => {
            _deactivateLoginUI();
            if (mobilePageContent) {
              mobilePageContent.innerHTML = homeContent;
              mobilePageContent.dataset.page = 'home';
              if (appMain) appMain.scrollTop = 0;
              syncBottomNav('home');
              updateHeaderMenuButton('home');
              updateCartBadgeCount();
              if (typeof initMainMobileInteractions === 'function') {
                initMainMobileInteractions();
              }
            }
          },
        });
      }
    }, 220);

  } catch (err) {
    console.error('[loadLoginPage] 오류:', err);
  }
}
window.loadLoginPage = loadLoginPage;


// --------------------------------------------------------------------------
// loadWishlistPage — 위시리스트 페이지를 모바일 페이지 전환 구조로 불러옵니다.
// --------------------------------------------------------------------------
function loadWishlistPage() {
  if (!mobilePageContent || !appMain) return;

  mobilePageContent.classList.add('page-leave');

  setTimeout(() => {
    mobilePageContent.innerHTML = `
      <div class="wishlist-page-content">
        <header class="topbar" style="display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #0c111c;">
          <button class="icon-btn" id="btnBack" aria-label="뒤로가기" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; padding: 4px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span class="topbar__logo" style="font-family: 'Archivo Black', sans-serif; font-weight: 800; font-size: 16px; color: #fff; letter-spacing: 0.5px;">UNI:CITY</span>
          <div class="topbar__side topbar__side--right" style="width: 32px;"></div>
        </header>
        
        <main style="padding: 24px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100% - 56px); box-sizing: border-box;">
          <h2 style="font-family: 'Archivo', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 12px; color: #fff; width: 100%; text-align: left; letter-spacing: -0.5px;">WISHLIST</h2>
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 80px; width: 100%;">
            <span style="font-size: 40px; margin-bottom: 16px; color: rgba(255,255,255,0.2);">♡</span>
            <p style="color: #888; font-size: 14px; text-align: center; line-height: 1.5; margin: 0;">위시리스트에 담긴 상품이 없습니다.<br>마음에 드는 상품을 찜해보세요!</p>
          </div>
        </main>
      </div>
    `;
    
    mobilePageContent.dataset.page = 'wishlist';
    appMain.scrollTop = 0;
    syncBottomNav('wishlist');
    updateCartBadgeCount();
    updateHeaderMenuButton('wishlist');

    // 뒤로가기 버튼 리스너 바인딩
    const backBtn = mobilePageContent.querySelector('#btnBack');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (mobilePageContent) {
          mobilePageContent.classList.add('page-leave');
          setTimeout(() => {
            mobilePageContent.innerHTML = homeContent;
            mobilePageContent.dataset.page = 'home';
            if (appMain) appMain.scrollTop = 0;
            syncBottomNav('home');
            updateHeaderMenuButton('home');
            updateCartBadgeCount();

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
      });
    }

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
  }, 220);
}
window.loadWishlistPage = loadWishlistPage;


// ==========================================================================
// AUTH GATE — 최초 진입 시 로그인 화면 우선 표시
// ==========================================================================

/** 로그인 게이트 활성 여부 플래그 */
let _authGateActive = false;

/**
 * 로그인 게이트를 표시합니다.
 * - 애니메이션 없이 즉시 로그인 화면으로 교체
 * - 성공/비회원 클릭 시 홈으로 복귀, 게이트 해제
 * - 로그아웃 시 게이트 재활성화
 */
async function _loadLoginGate() {
  _authGateActive = true;

  if (!mobilePageContent || !appMain) return;

  // login.css 동적 로드
  if (!document.getElementById('login-style')) {
    const link = document.createElement('link');
    link.id = 'login-style';
    link.rel = 'stylesheet';
    link.href = './login.css';
    document.head.appendChild(link);
  }

  try {
    const response = await fetch('./login.html');
    if (!response.ok) throw new Error(`login.html fetch 실패: ${response.status}`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const loginContent = doc.querySelector('.login-page-content');
    if (!loginContent) return;

    // 최초 진입 — 애니메이션 없이 즉시 교체
    mobilePageContent.innerHTML = loginContent.outerHTML;
    mobilePageContent.dataset.page = 'login';
    appMain.scrollTop = 0;
    syncBottomNav('login');
    updateCartBadgeCount();

    // ── 로그인 화면 활성화: 공통 Nav UI 숨김 ──
    _activateLoginUI();
    updateHeaderMenuButton('login');

    if (typeof initLoginPage === 'function') {
      initLoginPage({
        // 로그인 성공 → Nav UI 복구 후 게이트 해제 후 홈으로
        onLoginSuccess: () => {
          _authGateActive = false;
          _deactivateLoginUI();
          mobilePageContent.innerHTML = homeContent;
          mobilePageContent.dataset.page = 'home';
          if (appMain) appMain.scrollTop = 0;
          syncBottomNav('home');
          updateHeaderMenuButton('home');
          updateCartBadgeCount();
          if (typeof initMainMobileInteractions === 'function') initMainMobileInteractions();
          if (typeof initMainParallax === 'function') initMainParallax();
        },
        // 로그아웃 → 게이트 재활성화
        onLogout: () => {
          _loadLoginGate();
        },
        // 비회원 둘러보기 → Nav UI 복구 후 게이트 해제 후 홈으로
        onGuest: () => {
          _authGateActive = false;
          _deactivateLoginUI();
          mobilePageContent.innerHTML = homeContent;
          mobilePageContent.dataset.page = 'home';
          if (appMain) appMain.scrollTop = 0;
          syncBottomNav('home');
          updateHeaderMenuButton('home');
          updateCartBadgeCount();
          if (typeof initMainMobileInteractions === 'function') initMainMobileInteractions();
        },
      });
    }
  } catch (err) {
    console.error('[authGate] 오류:', err);
    _authGateActive = false; // 오류 시 게이트 해제 (서비스 중단 방지)
    _deactivateLoginUI();    // 오류 시에도 Nav UI 복구
  }
}

/**
 * auth-checking 상태 해제: index.html에 심어둔 visibility:hidden 스타일을 제거합니다.
 * Firebase 인증 결과를 받은 모든 분기에서 반드시 호출해야 합니다.
 */
function _revealMobileApp() {
  const style = document.getElementById('auth-checking-style');
  if (style) style.remove();

  // URL 파라미터 기반 딥링킹 (독립 페이지에서 리다이렉트 시 대응)
  const urlParams = new URLSearchParams(window.location.search);
  const targetPage = urlParams.get('page');
  if (targetPage === 'cart') {
    if (typeof loadCartPage === 'function') loadCartPage();
  } else if (targetPage === 'mypage') {
    if (typeof loadMyPage === 'function') loadMyPage();
  } else if (targetPage === 'wishlist') {
    if (typeof loadWishlistPage === 'function') loadWishlistPage();
  }
}

/**
 * 최초 진입 시 Firebase 인증 상태를 확인하고 필요하면 게이트를 표시합니다.
 * Firebase onAuthStateChanged로 실제 인증 여부를 확인합니다.
 * script.js 초기화 구간에서 호출됩니다.
 */
function initAuthGate() {
  // Firebase SDK가 로드되어 있고 ENV가 준비된 경우: Firebase 인증 상태 우선 확인
  if (typeof firebase !== 'undefined' && window.ENV && window.ENV.FIREBASE_API_KEY) {
    try {
      // Firebase 앱 초기화 (이미 초기화된 경우 재사용)
      let fbApp;
      if (firebase.apps && firebase.apps.length > 0) {
        fbApp = firebase.apps[0];
      } else {
        fbApp = firebase.initializeApp({
          apiKey:            window.ENV.FIREBASE_API_KEY,
          authDomain:        window.ENV.FIREBASE_AUTH_DOMAIN,
          projectId:         window.ENV.FIREBASE_PROJECT_ID,
          storageBucket:     window.ENV.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
          appId:             window.ENV.FIREBASE_APP_ID,
          measurementId:     window.ENV.FIREBASE_MEASUREMENT_ID,
        });
      }

      const auth = firebase.auth();
      let gateChecked = false;

      auth.onAuthStateChanged((firebaseUser) => {
        if (gateChecked) return; // 최초 1회만 처리
        gateChecked = true;

        if (firebaseUser) {
          // Firebase에 로그인된 사용자가 있음 → localStorage 동기화 후 게이트 없이 진입
          const existing = (typeof AuthManager !== 'undefined') ? AuthManager.getUser() : null;
          if (!existing || !existing.isLoggedIn) {
            if (typeof AuthManager !== 'undefined') {
              AuthManager.setUser({
                uid:          firebaseUser.uid,
                provider:     'google',
                name:         firebaseUser.displayName || 'Google 사용자',
                email:        firebaseUser.email || null,
                profileImage: firebaseUser.photoURL || null,
              });
            }
          }
          // 로그인 상태 → Main 화면 노출 (기본 홈 콘텐츠가 이미 로드됨)
          console.log('[AuthGate] Firebase 로그인 확인 — 게이트 생략');
          _revealMobileApp();
        } else {
          // Firebase에 로그인 없음
          if (typeof AuthManager !== 'undefined') {
            const localUser = AuthManager.getUser();
            if (localUser && localUser.provider === 'google') {
              // localStorage에 Google 사용자가 있는데 Firebase에 없으면 정리
              AuthManager.clearUser();
            }
          }
          // 비로그인: 로그인 게이트 없이 바로 메인 화면 진입
          _revealMobileApp();
        }
      });
    } catch (err) {
      console.error('[AuthGate] Firebase 초기화 오류:', err);
      // Firebase 오류 시에도 무조건 메인 화면 진입
      _revealMobileApp();
    }
  } else {
    // Firebase SDK 미로드 시에도 무조건 메인 화면 진입
    _revealMobileApp();
  }
}



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
      renderAccountButton('hamAccountContainer');
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

  renderAccountButton('hamAccountContainer');

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
      
      const page = mobilePageContent ? mobilePageContent.dataset.page : 'home';
      if (page === 'home' || !page) {
        openMobileMenu();
      } else {
        // Main(홈)이 아닐 때: 뒤로가기 동작 (Main으로 복귀)
        const homeBtn = document.querySelector('.bottom-nav__item[aria-label="홈"]');
        if (homeBtn) {
          homeBtn.click();
        } else {
          // Fallback 직접 홈 화면 렌더링
          if (mobilePageContent && mobilePageContent.dataset.page !== 'home') {
            mobilePageContent.classList.add('page-leave');

            setTimeout(() => {
              mobilePageContent.innerHTML = homeContent;
              mobilePageContent.dataset.page = 'home';
              if (appMain) appMain.scrollTop = 0;
              syncBottomNav('home');
              updateCartBadgeCount();
              updateHeaderMenuButton('home');

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
        }
      }
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

  // Retro Collection click redirection to Uniform List page
  document.querySelectorAll('.retro-collection').forEach((retro) => {
    if (retro.dataset.clickBound) return;
    retro.dataset.clickBound = 'true';
    retro.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof loadUniformListPage === 'function') {
        loadUniformListPage();
      }
    });
  });

  // Mobile quick nav '구단 소개' click redirection to Club Intro page
  document.querySelectorAll('.mq-btn--intro').forEach((btn) => {
    if (btn.dataset.clickBound) return;
    btn.dataset.clickBound = 'true';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof loadClubPage === 'function') {
        loadClubPage();
      }
    });
  });

  // Mobile quick nav '유니폼 구매하기' click redirection to Uniform List page
  document.querySelectorAll('.mq-btn--shop').forEach((btn) => {
    if (btn.dataset.clickBound) return;
    btn.dataset.clickBound = 'true';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof loadUniformListPage === 'function') {
        loadUniformListPage();
      }
    });
  });

  // Mobile quick nav '장바구니' click redirection to Cart page
  document.querySelectorAll('.mq-btn--cart').forEach((btn) => {
    if (btn.dataset.clickBound) return;
    btn.dataset.clickBound = 'true';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof loadCartPage === 'function') {
        loadCartPage();
      }
    });
  });
}


document.querySelectorAll('.bottom-nav').forEach((nav) => {
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.bottom-nav__item');
    if (!item) return;

    // 로그인 게이트 활성화 중 — 모든 네비게이션 차단
    if (_authGateActive) return;

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
          updateHeaderMenuButton('home');
          updateCartBadgeCount();

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
    } else if (label && label.textContent.trim().toLowerCase() === 'wishlist') {
      if (mobilePageContent && mobilePageContent.dataset.page !== 'wishlist') {
        loadWishlistPage();
      }
    }
  });
});

// 초기 로드 시 Badge 갱신
updateCartBadgeCount();

// 헤더 로그인/로그아웃 버튼 초기화
initHeaderAuthButton();

// 최초 진입 시 로그인 게이트 확인
initAuthGate();

// 데스크톱 검색 기능 연동
document.querySelectorAll('.dc-search__form').forEach((form) => {
  const input = form.querySelector('.dc-search__input');
  if (!input) {
    form.addEventListener('submit', (e) => e.preventDefault());
    return;
  }

  // 추천 결과 목록 컨테이너 동적 생성
  let resultsContainer = document.getElementById('dcSearchResults');
  if (!resultsContainer) {
    resultsContainer = document.createElement('ul');
    resultsContainer.id = 'dcSearchResults';
    resultsContainer.className = 'dc-search-results';
    form.parentNode.appendChild(resultsContainer);
  }

  // 검색창 영역 클릭 시 즉시 입력 포커싱
  form.addEventListener('click', (e) => {
    if (e.target !== input && !e.target.closest('.dc-search__btn')) {
      input.focus();
    }
  });

  function getSearchResults(query) {
    const cleanQuery = query.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanQuery) return [];
    
    const products = window.PRODUCTS || [];
    return products.filter(p => {
      const name = (p.name || '').toLowerCase().replace(/\s+/g, '');
      const season = (p.season || '').toLowerCase().replace(/\s+/g, '');
      const type = (p.type || '').toLowerCase().replace(/\s+/g, '');
      const collection = (p.collection || '').toLowerCase().replace(/\s+/g, '');
      const id = (p.id || '').toLowerCase().replace(/\s+/g, '');
      
      return name.includes(cleanQuery) || 
             season.includes(cleanQuery) || 
             type.includes(cleanQuery) || 
             collection.includes(cleanQuery) || 
             id.includes(cleanQuery);
    });
  }

  function renderResults(results) {
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
      const li = document.createElement('li');
      li.className = 'dc-search-results__empty';
      li.textContent = '검색 결과가 없습니다.';
      resultsContainer.appendChild(li);
    } else {
      results.forEach(product => {
        const li = document.createElement('li');
        li.className = 'dc-search-results__item';
        li.dataset.productId = product.id;
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = product.name || '유니폼';
        
        const seasonSpan = document.createElement('span');
        seasonSpan.className = 'dc-search-results__season';
        seasonSpan.textContent = product.season ? `${product.season} 시즌` : '';
        
        li.appendChild(nameSpan);
        li.appendChild(seasonSpan);
        resultsContainer.appendChild(li);
      });
    }
    
    resultsContainer.classList.add('is-visible');
  }

  function hideResults() {
    resultsContainer.classList.remove('is-visible');
  }

  // 실시간 입력 이벤트
  input.addEventListener('input', () => {
    const val = input.value;
    if (!val.trim()) {
      hideResults();
      return;
    }
    const results = getSearchResults(val);
    renderResults(results);
  });

  // 포커스 획득 시 결과가 있으면 노출
  input.addEventListener('focus', () => {
    if (input.value.trim()) {
      const results = getSearchResults(input.value);
      renderResults(results);
    }
  });

  // 추천 항목 클릭 시
  resultsContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.dc-search-results__item');
    if (!item) return;
    
    const productId = item.dataset.productId;
    if (productId && typeof window.loadProductDetailPage === 'function') {
      window.loadProductDetailPage(productId);
      input.value = '';
      hideResults();
    }
  });

  // 폼 제출(Enter) 시
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value;
    const results = getSearchResults(val);
    
    if (results.length === 1) {
      if (typeof window.loadProductDetailPage === 'function') {
        window.loadProductDetailPage(results[0].id);
        input.value = '';
        hideResults();
      }
    }
  });

  // 외부 클릭 시 추천 영역 숨김
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target) && !resultsContainer.contains(e.target)) {
      hideResults();
    }
  });
});

// ==========================================================================
// 1. 데스크톱 카드 3D 틸트 (Hover 3D Tilt Effect) 복구
// ==========================================================================
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

// ==========================================================================
// 2. 네온 에너지 커스텀 커서 (Neon Energy Custom Cursor) 복구
// ==========================================================================
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

// ==========================================================================
// 3. 인터랙티브 텍스트 (Interactive Split Typography) 복구
// ==========================================================================
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

// ==========================================================================
// 4. 모바일 스크롤 패럴랙스 (Mobile Scroll Parallax) 복구
// ==========================================================================
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
// 5. products_data.js 기반 데스크톱 좌측 인기 유니폼 1:1 매핑 슬라이더
// ==========================================================================
(function () {
  const cards = document.querySelectorAll('.dc-product-card');
  const dots = document.querySelectorAll('.dc-carousel-indicator__dot');
  if (cards.length === 0) return;

  // products_data.js에 존재하는 유효한 20개 유니폼 1:1 등록[cite: 15]
  const productPages = [
    [
      { id: "uniform_21", img: "../../img/uniform_21.png", alt: "22/23 홈 레플리카 유니폼", season: "22/23 SEASON", name: "홈 레플리카 유니폼", price: "189,000원" },
      { id: "uniform_10", img: "../../img/uniform_10.png", alt: "23/24 어웨이 레플리카 유니폼", season: "23/24 SEASON", name: "어웨이 레플리카 유니폼", price: "115,000원" },
      { id: "uniform_19", img: "../../img/uniform_19.png", alt: "15/16 어웨이 레플리카 유니폼", season: "15/16 SEASON", name: "어웨이 레플리카 유니폼", price: "103,000원" },
      { id: "uniform_20", img: "../../img/uniform_20.png", alt: "홈 레트로 유니폼", season: "88/89 SEASON", name: "홈 레트로 유니폼", price: "85,000원" }
    ],
    [
      { id: "uniform_30", img: "../../img/uniform_30.png", alt: "125주년 기념 유니폼", season: "SPECIAL", name: "125주년 기념 유니폼", price: "350,000원" },
      { id: "uniform_31", img: "../../img/uniform_31.png", alt: "26/27 홈 레플리카 유니폼", season: "26/27 SEASON", name: "홈 레플리카 유니폼", price: "129,000원" },
      { id: "uniform_22", img: "../../img/uniform_22.png", alt: "15/16 홈 레플리카 유니폼", season: "15/16 SEASON", name: "홈 레플리카 유니폼", price: "110,000원" },
      { id: "uniform_25", img: "../../img/uniform_25.png", alt: "19/20 써드 레플리카 유니폼", season: "19/20 SEASON", name: "써드 레플리카 유니폼", price: "75,000원" }
    ],
    [
      { id: "uniform_29", img: "../../img/uniform_29.png", alt: "어웨이 레트로 유니폼", season: "97/98 SEASON", name: "어웨이 레트로 유니폼", price: "100,000원" },
      { id: "uniform_27", img: "../../img/uniform_27.png", alt: "홈 레플리카 유니폼", season: "13/14 SEASON", name: "홈 레플리카 유니폼", price: "83,000원" },
      { id: "uniform_24", img: "../../img/uniform_24.png", alt: "25/26 어웨이 레플리카 유니폼", season: "25/26 SEASON", name: "어웨이 레플리카 유니폼", price: "109,000원" },
      { id: "uniform_9", img: "../../img/uniform_9.png", alt: "23/24 홈 레플리카 유니폼", season: "23/24 SEASON", name: "홈 레플리카 유니폼", price: "155,000원" }
    ],
    [
      { id: "uniform_35", img: "../../img/uniform_35.png", alt: "25/26 홈 레플리카 유니폼", season: "25/26 SEASON", name: "홈 레플리카 유니폼", price: "148,000원" },
      { id: "uniform_36", img: "../../img/uniform_36.png", alt: "25/26 써드 레플리카 유니폼", season: "25/26 SEASON", name: "써드 레플리카 유니폼", price: "95,000원" },
      { id: "uniform_39", img: "../../img/uniform_39.png", alt: "24/25 홈 레플리카 유니폼", season: "24/25 SEASON", name: "홈 레플리카 유니폼", price: "152,000원" },
      { id: "uniform_40", img: "../../img/uniform_40.png", alt: "24/25 어웨이 레플리카 유니폼", season: "24/25 SEASON", name: "어웨이 레플리카 유니폼", price: "112,000원" }
    ],
    [
      { id: "uniform_6", img: "../../img/uniform_6.png", alt: "26/27 어웨이 레플리카 유니폼", season: "26/27 SEASON", name: "어웨이 레플리카 유니폼", price: "129,000원" },
      { id: "uniform_7", img: "../../img/uniform_7.png", alt: "26/27 써드 레플리카 유니폼", season: "26/27 SEASON", name: "써드 레플리카 유니폼", price: "129,000원" },
      { id: "uniform_11", img: "../../img/uniform_11.png", alt: "23/24 써드 레플리카 유니폼", season: "23/24 SEASON", name: "써드 레플리카 유니폼", price: "98,000원" },
      { id: "uniform_44", img: "../../img/uniform_44.png", alt: "22/23 어웨이 레플리카 유니폼", season: "22/23 SEASON", name: "어웨이 레플리카 유니폼", price: "119,000원" }
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

          if (data && data.id) {
            card.setAttribute('data-product-id', data.id);
            card.dataset.productId = data.id;
          }
          if (img && data) {
            img.style.display = 'block';
            img.src = data.img;
            img.alt = data.alt;
          }
          if (season && data) season.textContent = data.season;
          if (name && data) name.textContent = data.name;
          if (price && data) price.textContent = data.price;

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

// 유니폼 카드 클릭 시 정확한 data-product-id를 읽어 상세페이지로 이동
document.addEventListener('click', (e) => {
  const card = e.target.closest('.dc-product-card, .popular-card, .product-card, [data-product-id]');
  if (!card) return;

  if (e.target.closest('.dc-carousel-indicator__dot') || e.target.closest('.dc-carousel-btn')) {
    return;
  }

  if (e.target.closest('button') || e.target.closest('a') && !e.target.closest('.product-card-link')) {
    return;
  }

  const pid = card.getAttribute('data-product-id') || card.dataset.productId;
  if (pid) {
    e.preventDefault();
    e.stopPropagation();
    window.openProductDetail(pid);
  }
});