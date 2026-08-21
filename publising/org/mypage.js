function initMyPage() {
  const backBtn = document.getElementById('backBtn');
  const orderDetailBtn = document.getElementById('orderDetailBtn');

  if (backBtn && !backBtn.dataset.listenerBound) {
    backBtn.dataset.listenerBound = 'true';
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        if (typeof goBack === 'function') {
          goBack('uni_list.html');
        } else {
          window.location.href = 'uni_list.html';
        }
      }
    });
  }

  if (orderDetailBtn && !orderDetailBtn.dataset.listenerBound) {
    orderDetailBtn.dataset.listenerBound = 'true';
    orderDetailBtn.addEventListener('click', () => {
      if (typeof window.loadMypageSubPage === 'function') {
        window.loadMypageSubPage('shipping', '배송추적');
      } else if (typeof parent.loadMypageSubPage === 'function') {
        parent.loadMypageSubPage('shipping', '배송추적');
      }
    });
  }

  document.querySelectorAll('[data-target], [data-action]').forEach((element) => {
    if (element.dataset.listenerBound) return;
    element.dataset.listenerBound = 'true';
    element.addEventListener('click', () => {
      const key = element.dataset.target || element.dataset.action;

      if (key === 'orders') {
        if (typeof window.loadMypageSubPage === 'function') {
          window.loadMypageSubPage('orders', '구매내역');
        } else if (typeof parent.loadMypageSubPage === 'function') {
          parent.loadMypageSubPage('orders', '구매내역');
        }
      } else if (key === 'shipping') {
        if (typeof window.loadMypageSubPage === 'function') {
          window.loadMypageSubPage('shipping', '배송추적');
        } else if (typeof parent.loadMypageSubPage === 'function') {
          parent.loadMypageSubPage('shipping', '배송추적');
        }
      } else if (key === 'wishlist') {
        if (typeof window.loadWishlistPage === 'function') {
          window.loadWishlistPage();
        } else if (typeof parent.loadWishlistPage === 'function') {
          parent.loadWishlistPage();
        }
      } else if (key === 'profile') {
        if (typeof window.loadMypageSubPage === 'function') {
          window.loadMypageSubPage('profile', '개인정보 수정');
        } else if (typeof parent.loadMypageSubPage === 'function') {
          parent.loadMypageSubPage('profile', '개인정보 수정');
        }
      } else if (key === 'support') {
        if (typeof window.loadMypageSubPage === 'function') {
          window.loadMypageSubPage('support', '고객센터');
        } else if (typeof parent.loadMypageSubPage === 'function') {
          parent.loadMypageSubPage('support', '고객센터');
        }
      }
    });
  });
}

// Global exposure
window.initMyPage = initMyPage;

// Standalone mode entry
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith('mypage.html')) {
    initMyPage();
  }
});
