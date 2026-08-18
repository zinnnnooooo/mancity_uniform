(() => {
  const backBtn = document.getElementById('backBtn');
  const orderDetailBtn = document.getElementById('orderDetailBtn');

  backBtn?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'uni_list.html';
    }
  });

  orderDetailBtn?.addEventListener('click', () => {
    alert('주문 상세 페이지는 추후 연결됩니다.');
  });

  const placeholderActions = {
    orders: '구매내역 페이지는 추후 연결됩니다.',
    wishlist: '위시리스트 페이지는 추후 연결됩니다.',
    profile: '개인정보 수정 페이지는 추후 연결됩니다.',
    support: '고객센터 페이지는 추후 연결됩니다.'
  };

  document.querySelectorAll('[data-target], [data-action]').forEach((element) => {
    element.addEventListener('click', () => {
      const key = element.dataset.target || element.dataset.action;

      if (key === 'shipping') {
        window.location.href = 'delivery_info.html';
        return;
      }

      if (placeholderActions[key]) {
        alert(placeholderActions[key]);
      }
    });
  });
})();
