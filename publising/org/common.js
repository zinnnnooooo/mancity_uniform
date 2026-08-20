/* ============================================================
   UNI:CITY — common.js
   공통 초기화 및 화면 이동 헬퍼 (필요 최소한만 정의)
   ============================================================ */

/**
 * 뒤로가기 버튼 공통 동작.
 * 브라우저 히스토리가 있으면 이전 페이지로, 없으면 fallback 페이지로 이동.
 * @param {string} fallback - 히스토리가 없을 때 이동할 경로
 */
function goBack(fallback) {
  if (window.history.length > 1) {
    window.history.back();
  } else if (fallback) {
    window.location.href = fallback;
  }
}

/**
 * 페이지 이동 헬퍼.
 * @param {string} href - 이동할 경로
 */
function navigateTo(href) {
  window.location.href = href;
}

/**
 * data-nav 속성이 있는 요소에 공통 클릭 핸들러를 바인딩.
 * 예: <button data-nav="uni_list.html">이동</button>
 * data-nav="__back__" 인 경우 goBack() 호출.
 */
function bindNavHandlers() {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = el.getAttribute('data-nav');
      if (target === '__back__') {
        goBack('index.html');
      } else if (target) {
        navigateTo(target);
      }
    });
  });
}

/**
 * 아직 연결되지 않은 페이지(placeholder) 클릭 시 공통 안내.
 * data-placeholder 속성이 있는 요소에 바인딩.
 */
function bindPlaceholderHandlers() {
  document.querySelectorAll('[data-placeholder]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindNavHandlers();
  bindPlaceholderHandlers();
  if (typeof updateCartBadgeCount === 'function') {
    updateCartBadgeCount();
  }
  if (typeof initHeaderAuthButton === 'function') {
    initHeaderAuthButton();
  }
});

/**
 * 장바구니 데이터를 읽어와 하단 뱃지 개수를 갱신하는 공통 함수
 */
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

/**
 * 독립 페이지용 로그아웃 확인 팝업창 표시
 */
function showLogoutConfirmPopup(onConfirm) {
  if (typeof onConfirm !== 'function') return;

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

  const mountTarget = document.querySelector('.app-frame') || document.body;
  mountTarget.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('is-visible');
  });

  const closePopup = () => {
    overlay.classList.remove('is-visible');
    overlay.classList.add('is-hiding');
    setTimeout(() => {
      overlay.remove();
    }, 280);
  };

  const noBtn = overlay.querySelector('#logoutNoBtn');
  if (noBtn) {
    noBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closePopup();
    });
  }

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
 * 독립 페이지용 헤더 로그인/로그아웃 버튼 초기화
 */
function initHeaderAuthButton() {
  const headerAuthBtn = document.getElementById('headerAuthBtn');
  if (!headerAuthBtn) return;

  const updateButton = () => {
    let isLoggedIn = false;
    try {
      const user = JSON.parse(localStorage.getItem('unicity_user'));
      isLoggedIn = !!(user && user.isLoggedIn);
    } catch (e) {
      isLoggedIn = false;
    }

    if (isLoggedIn) {
      headerAuthBtn.textContent = '로그아웃';
      headerAuthBtn.style.color = '#FFFFFF';
    } else {
      headerAuthBtn.textContent = '로그인';
      headerAuthBtn.style.color = '#6CABDD';
    }
  };

  headerAuthBtn.addEventListener('click', () => {
    let isLoggedIn = false;
    try {
      const user = JSON.parse(localStorage.getItem('unicity_user'));
      isLoggedIn = !!(user && user.isLoggedIn);
    } catch (e) {
      isLoggedIn = false;
    }

    if (isLoggedIn) {
      showLogoutConfirmPopup(() => {
        // localStorage 정리 후 login.html로 이동
        localStorage.removeItem('unicity_user');
        updateButton();
        window.location.href = 'login.html';
      });
    } else {
      window.location.href = 'login.html';
    }
  });

  updateButton();
}
