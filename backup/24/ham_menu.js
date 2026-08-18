/* ==========================================================================
   UNI:CITY — ham_menu.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("menuCloseBtn");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      // 이전 화면 기록이 있으면 뒤로가기, 없으면 유니폼 리스트로 이동
      if (window.history.length > 1) {
        window.history.back();
      } else {
        ucNavigate("uni_list.html");
      }
    });
  }
});
