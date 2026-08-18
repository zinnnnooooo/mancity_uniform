(() => {
  const backBtn = document.getElementById('backBtn');

  backBtn?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'uni_list.html';
    }
  });
})();
