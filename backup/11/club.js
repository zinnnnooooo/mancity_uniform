/* ==========================================================================
   club.html 전용 JS (club.js)
   - 상단 뒤로가기 버튼 동작
   - 하단 CTA 버튼 클릭 시 uni_list.html로 이동
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.history.back();
    });
  }

  var ctaBtn = document.getElementById("ctaBtn");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", function () {
      navigateTo("uni_list.html");
    });
  }
});
