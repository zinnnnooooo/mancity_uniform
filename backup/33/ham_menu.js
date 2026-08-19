/* ==========================================================================
   UNI:CITY — ham_menu.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("menuCloseBtn");
  const menuPanel = document.querySelector(".menu-panel");

  // 1. 메뉴 닫기 버튼 클릭 시 동작
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      // 상위 프레임에 closeMobileMenu 함수가 구현되어 있다면 실행
      if (typeof window.closeMobileMenu === 'function') {
        window.closeMobileMenu();
      } else if (typeof parent.closeMobileMenu === 'function') {
        parent.closeMobileMenu();
      } else {
        // Fallback: 일반 브라우저 환경일 때 뒤로가기
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "index.html";
        }
      }
    });
  }

  // 2. 메뉴 아이템 링크 클릭 시 브라우저 전체 이동(새로고침) 방지 및 모바일 프레임 내부 전환
  if (menuPanel) {
    menuPanel.addEventListener("click", (e) => {
      const menuItem = e.target.closest(".menu-item");
      if (!menuItem) return;

      const href = menuItem.getAttribute("href");

      // href가 없거나 단순 해시(#) 값이면 무시
      if (!href || href === "#") return;

      // 브라우저 전체 창이 새로고침 되며 이동하는 기본 동작을 완벽히 차단
      e.preventDefault();

      // 상위 프레임(script.js)의 SPA 함수들이 열려 있는지 확인 후 프레임 내부 전환 실행
      if (href.includes("marking_guide.html")) {
        if (typeof window.loadMarkingGuidePage === "function") {
          window.loadMarkingGuidePage();
        } else if (typeof parent.loadMarkingGuidePage === "function") {
          parent.loadMarkingGuidePage();
        } else {
          window.location.href = href;
        }
      }
      else if (href.includes("club.html")) {
        if (typeof window.loadClubPage === "function") {
          window.loadClubPage();
        } else if (typeof parent.loadClubPage === "function") {
          parent.loadClubPage();
        } else {
          window.location.href = href;
        }
      }
      else if (href.includes("uni_list.html")) {
        let filter = null;
        if (href.includes("?")) {
          const url = new URL(href, window.location.origin);
          const tab = url.searchParams.get("tab") || "all";
          const val = url.searchParams.get("val");
          filter = { mainTab: tab };
          if (tab === "type") filter.type = val;
          if (tab === "collection") filter.collection = val;
        }

        if (typeof window.loadUniformListPage === "function") {
          window.loadUniformListPage(filter);
        } else if (typeof parent.loadUniformListPage === "function") {
          parent.loadUniformListPage(filter);
        } else {
          window.location.href = href;
        }
      }
      else if (href.includes("cart.html")) {
        if (typeof window.loadCartPage === "function") {
          window.loadCartPage();
        } else if (typeof parent.loadCartPage === "function") {
          parent.loadCartPage();
        } else {
          window.location.href = href;
        }
      }
      else if (href.includes("checkout.html")) {
        if (typeof window.loadCheckoutPage === "function") {
          window.loadCheckoutPage();
        } else if (typeof parent.loadCheckoutPage === "function") {
          parent.loadCheckoutPage();
        } else {
          window.location.href = href;
        }
      }
      else if (href.includes("mypage.html")) {
        if (typeof window.loadMyPage === "function") {
          window.loadMyPage();
        } else if (typeof parent.loadMyPage === "function") {
          parent.loadMyPage();
        } else {
          window.location.href = href;
        }
      }
      else {
        // 기타 구현되지 않은 페이지용 Fallback
        window.location.href = href;
      }
    });
  }
});