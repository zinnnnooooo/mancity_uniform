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
