(() => {
  const backBtn = document.getElementById('backBtn');
  const trackingBtn = document.getElementById('trackingBtn');

  backBtn?.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'uni_list.html';
  });

  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const open = !item.classList.contains('is-open');

      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });

  trackingBtn?.addEventListener('click', () => {
    alert('주문 / 배송 조회 페이지는 추후 연결됩니다.');
  });

  document.querySelectorAll('.bottom-nav a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
})();
