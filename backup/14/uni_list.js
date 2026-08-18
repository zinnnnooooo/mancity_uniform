/* ==========================================================================
   UNI:CITY — uni_list.js
   상품 카드 렌더링 + 시즌/유니폼 탭 필터 (더미 데이터 기반 최소 구현)
   ========================================================================== */

(function () {
  /* ---- 킷 컬러 프리셋 (플레이스홀더 이미지 대신 사용) --------------------- */
  const KIT = {
    home: { color: "#6cabdd", glow: "#264a68" },
    away: { color: "#e7c65b", glow: "#1b1c20" },
    third: { color: "#f4f4f4", glow: "#3a1f28" },
    keeper: { color: "#c8ff3d", glow: "#20242b" },
    special: { color: "#eef1f4", glow: "#242a33" },
    specialB: { color: "#8fb7e0", glow: "#1c2636" },
    cream: { color: "#e8dcc4", glow: "#2a2620" },
    retro: { color: "#e4d94f", glow: "#141414" },
    edition: { color: "#7fa8d6", glow: "#1a2536" },
  };

  const TYPE_LABEL = {
    home: "홈 레플리카 유니폼",
    away: "어웨이 레플리카 유니폼",
    third: "써드 레플리카 유니폼",
    keeper: "키퍼 홈 레플리카 유니폼",
    special: "스페셜 유니폼",
    edition: "에디션 유니폼",
  };

  /* ---- 공통 상품 데이터 (Source of Truth) ----------------------------------- */
  const PRODUCTS = [
    // 26/27 Season
    { type: "home", kit: "home", season: "26/27 season", name: "홈 레플리카 유니폼", price: 129000, badge: "BEST", image: "../../img/uniform_31.png" },
    { type: "away", kit: "away", season: "26/27 season", name: "어웨이 레플리카 유니폼", price: 129000, badge: "NEW", image: "../../img/uniform_6.png" },
    { type: "third", kit: "third", season: "26/27 season", name: "써드 레플리카 유니폼", price: 129000, badge: "NEW", image: "../../img/uniform_7.png" },
    { type: "keeper", kit: "keeper", season: "26/27 season", name: "키퍼 레플리카 유니폼", price: 129000, badge: "NEW", image: "../../img/uniform_8.png" },

    // 25/26 Season
    { type: "home", kit: "home", season: "25/26 season", price: 148000, badge: "BEST", image: "../../img/uniform_35.png" },
    { type: "away", kit: "away", season: "25/26 season", price: 109000, badge: null, image: "../../img/uniform_24.png" },
    { type: "third", kit: "third", season: "25/26 season", price: 95000, badge: null, image: "../../img/uniform_36.png" },
    { type: "keeper", kit: "keeper", season: "25/26 season", price: 64000, badge: null, image: "../../img/uniform_38.png" },

    // 24/25 Season
    { type: "home", kit: "home", season: "24/25 season", price: 152000, badge: "BEST", image: "../../img/uniform_39.png" },
    { type: "away", kit: "away", season: "24/25 season", price: 112000, badge: null, image: "../../img/uniform_40.png" },
    { type: "third", kit: "third", season: "24/25 season", price: 96000, badge: null, image: "../../img/uniform_41.png" },
    { type: "keeper", kit: "keeper", season: "24/25 season", price: 65000, badge: null, image: "../../img/uniform_42.png" },

    // 23/24 Season
    { type: "home", kit: "home", season: "23/24 season", price: 155000, badge: "BEST", image: "../../img/uniform_9.png" },
    { type: "away", kit: "away", season: "23/24 season", price: 115000, badge: "BEST", image: "../../img/uniform_10.png" },
    { type: "third", kit: "third", season: "23/24 season", price: 98000, badge: null, image: "../../img/uniform_11.png" },
    { type: "keeper", kit: "keeper", season: "23/24 season", price: 67000, badge: null, image: "../../img/uniform_43.png" },
    { type: "special", kit: "special", season: "23/24 season", name: "2024 스페셜 유니폼", price: 175000, badge: "NEW" },
    { type: "special", kit: "specialB", season: "26/27 season", name: "스페셜 레플리카 유니폼", price: 170000, badge: "NEW" },

    // 22/23 Season
    { type: "home", kit: "cream", season: "22/23 season", name: "홈 레플리카 유니폼", price: 189000, badge: null, image: "../../img/uniform_21.png" },
    { type: "away", kit: "away", season: "22/23 season", name: "어웨이 레플리카 유니폼", price: 119000, badge: null, image: "../../img/uniform_44.png" },
    { type: "third", kit: "third", season: "22/23 season", name: "써드 레플리카 유니폼", price: 99000, badge: null, image: "../../img/uniform_45.png" },
    { type: "keeper", kit: "keeper", season: "22/23 season", name: "키퍼 레플리카 유니폼", price: 69000, badge: null, image: "../../img/uniform_46.png" },

    // PAST Seasons
    { type: "away", kit: "away", season: "15/16 season", name: "어웨이 레플리카 유니폼", price: 103000, badge: null, image: "../../img/uniform_19.png" },
    { type: "edition", kit: "retro", season: "88/89 season", name: "홈 레트로 유니폼", price: 85000, badge: null, image: "../../img/uniform_20.png" },
    { type: "edition", kit: "edition", season: "SPECIAL", name: "125주년 기념 유니폼", price: 350000, badge: "BEST", image: "../../img/uniform_30.png" },
    { type: "home", kit: "home", season: "15/16 season", name: "홈 레플리카 유니폼", price: 110000, badge: null, image: "../../img/uniform_22.png" },
    { type: "third", kit: "third", season: "19/20 season", name: "써드 레플리카 유니폼", price: 75000, badge: null, image: "../../img/uniform_25.png" },
    { type: "edition", kit: "retro", season: "97/98 season", name: "어웨이 레트로 유니폼", price: 100000, badge: null, image: "../../img/uniform_29.png" },
    { type: "home", kit: "home", season: "13/14 season", name: "홈 레플리카 유니폼", price: 83000, badge: null, image: "../../img/uniform_27.png" },

    // Popular Row
    { type: "edition", kit: "cream", season: "24/25 season", name: "오아시스 콜라보 유니폼", price: 215000 },
    { type: "edition", kit: "retro", season: "98/99 season", name: "레트로 유니폼", price: 110000 },
    { type: "edition", kit: "edition", season: "21/22 season", name: "9320 스페셜 유니폼", price: 350000 }
  ];

  /* ---- 26/27 시즌 신상품 (탭과 무관하게 항상 고정 노출) ------------------- */
  const NEW_ARRIVALS = PRODUCTS.filter(
    (p) => p.season === "26/27 season" && (p.type === "home" || p.type === "away" || p.type === "third" || p.type === "keeper")
  );

  /* ---- 인기 유니폼 (탭과 무관, 가로 스크롤) -------------------------------- */
  const POPULAR = PRODUCTS.filter(
    (p) => p.name === "오아시스 콜라보 유니폼" || p.name === "레트로 유니폼" || p.name === "9320 스페셜 유니폼"
  );

  const SEASONS = ["26/27", "25/26", "24/25", "23/24", "PAST"];
  const TYPES = [
    { key: "all", label: "전체" },
    { key: "home", label: "홈" },
    { key: "away", label: "어웨이" },
    { key: "third", label: "서드" },
    { key: "edition", label: "에디션" },
  ];

  /* ---- 렌더 헬퍼 ----------------------------------------------------------- */
  function formatPrice(price) {
    return "₩" + price.toLocaleString("ko-KR");
  }

  function productCardHTML(product) {
    const kit = KIT[product.kit] || KIT.home;
    const badgeHTML = product.badge
      ? `<span class="product-badge product-badge--${product.badge === "BEST" ? "best" : "new"}">${product.badge}</span>`
      : "";
    const name = product.name || TYPE_LABEL[product.type] || "유니폼";
    const season = product.season || "";

    const mediaContent = product.image
      ? `<img src="${product.image}" alt="${name}" class="product-image-img" />`
      : `<svg class="product-jersey" viewBox="0 0 100 100"><use href="#icon-jersey" /></svg>`;

    return `
      <article class="product-card">
        <div class="product-media" style="--kit-color:${kit.color}; --kit-glow:${kit.glow};">
          ${badgeHTML}
          ${mediaContent}
        </div>
        <p class="product-season">${season}</p>
        <p class="product-name">${name}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
      </article>
    `;
  }

  function renderGrid(el, products) {
    el.innerHTML = products.map(productCardHTML).join("");
  }

  /* ---- 탭 렌더 + 상태 ------------------------------------------------------- */
  let currentMainTab = "all"; // "all" | "season" | "type" | "collection"
  let currentSeason = "26/27";
  let currentType = "home";
  let currentCollection = "special";

  const SUB_SEASONS = [
    "26/27", "25/26", "24/25", "23/24", "22/23",
    "21/22", "20/21", "기타 시즌"
  ];

  const SUB_TYPES = [
    { key: "home", label: "홈" },
    { key: "away", label: "어웨이" },
    { key: "third", label: "서드" },
    { key: "keeper", label: "키퍼" }
  ];

  const SUB_COLLECTIONS = [
    { key: "special", label: "스페셜" },
    { key: "retro", label: "레트로" }
  ];

  // Helper to match season string
  function matchSeason(product, seasonKey) {
    const s = product.season ? product.season.toLowerCase() : "";
    if (seasonKey === "기타 시즌") {
      const mainSeasons = ["26/27", "25/26", "24/25", "23/24", "22/23", "21/22", "20/21"];
      return !mainSeasons.some((ms) => s.includes(ms.toLowerCase()));
    }
    return s.includes(seasonKey.toLowerCase());
  }

  // Get all unique products from data
  function getAllBaseProducts() {
    return PRODUCTS;
  }

  function renderProductGrid() {
    const allProducts = getAllBaseProducts();
    let filtered = [];

    if (currentMainTab === "all") {
      filtered = allProducts;
    } else if (currentMainTab === "season") {
      // 시즌별: 선택한 시즌 상품 중, 스페셜/레트로는 제외
      filtered = allProducts.filter((p) => {
        const isSeasonMatch = matchSeason(p, currentSeason);
        const isStandard = p.type !== "special" && p.type !== "specialB" && p.type !== "edition" && p.type !== "retro";
        return isSeasonMatch && isStandard;
      });
    } else if (currentMainTab === "type") {
      // 유형별: 선택한 유형(홈/어웨이/서드/키퍼) 상품 중, 스페셜/레트로는 제외
      filtered = allProducts.filter((p) => {
        const isTypeMatch = p.type === currentType;
        const isStandard = p.type !== "special" && p.type !== "specialB" && p.type !== "edition" && p.type !== "retro";
        return isTypeMatch && isStandard;
      });
    } else if (currentMainTab === "collection") {
      // 컬렉션: 스페셜 또는 레트로
      if (currentCollection === "special") {
        filtered = allProducts.filter(
          (p) => p.type === "special" || p.type === "specialB" || p.type === "edition"
        );
      } else if (currentCollection === "retro") {
        filtered = allProducts.filter((p) => p.type === "retro");
      }
    }

    renderGrid(document.getElementById("productGrid"), filtered);
  }

  function renderSubTabs() {
    const wrap = document.getElementById("subTabs");
    if (!wrap) return;

    if (currentMainTab === "all") {
      wrap.style.display = "none";
      return;
    }

    wrap.style.display = "flex";

    if (currentMainTab === "season") {
      wrap.innerHTML = SUB_SEASONS.map(
        (s) =>
          `<button type="button" class="pill${s === currentSeason ? " is-active" : ""}" data-season="${s}" role="tab" aria-selected="${s === currentSeason}">${s}</button>`
      ).join("");

      wrap.querySelectorAll(".pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentSeason = btn.dataset.season;
          renderSubTabs();
          renderProductGrid();
        });
      });
    } else if (currentMainTab === "type") {
      wrap.innerHTML = SUB_TYPES.map(
        (t) =>
          `<button type="button" class="pill${t.key === currentType ? " is-active" : ""}" data-type="${t.key}" role="tab" aria-selected="${t.key === currentType}">${t.label}</button>`
      ).join("");

      wrap.querySelectorAll(".pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentType = btn.dataset.type;
          renderSubTabs();
          renderProductGrid();
        });
      });
    } else if (currentMainTab === "collection") {
      wrap.innerHTML = SUB_COLLECTIONS.map(
        (c) =>
          `<button type="button" class="pill${c.key === currentCollection ? " is-active" : ""}" data-collection="${c.key}" role="tab" aria-selected="${c.key === currentCollection}">${c.label}</button>`
      ).join("");

      wrap.querySelectorAll(".pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentCollection = btn.dataset.collection;
          renderSubTabs();
          renderProductGrid();
        });
      });
    }

    // Recalculate arrow visibility after setting DOM content
    requestAnimationFrame(() => {
      if (typeof window.updateSubTabsArrows === "function") {
        window.updateSubTabsArrows();
      }
    });
  }

  function initTabsScroll() {
    const subTabs = document.getElementById("subTabs");
    const leftBtn = document.getElementById("scrollLeftBtn");
    const rightBtn = document.getElementById("scrollRightBtn");

    if (!subTabs || !leftBtn || !rightBtn) return;

    function updateArrows() {
      const scrollLeft = subTabs.scrollLeft;
      const scrollWidth = subTabs.scrollWidth;
      const clientWidth = subTabs.clientWidth;

      if (scrollWidth <= clientWidth) {
        leftBtn.classList.add("is-hidden");
        rightBtn.classList.add("is-hidden");
        return;
      }

      if (scrollLeft <= 2) {
        leftBtn.classList.add("is-hidden");
      } else {
        leftBtn.classList.remove("is-hidden");
      }

      if (scrollLeft + clientWidth >= scrollWidth - 2) {
        rightBtn.classList.add("is-hidden");
      } else {
        rightBtn.classList.remove("is-hidden");
      }
    }

    function scrollTabs(amount) {
      subTabs.scrollBy({
        left: amount,
        behavior: "smooth"
      });
    }

    leftBtn.addEventListener("click", () => {
      scrollTabs(-subTabs.clientWidth / 2);
    });

    rightBtn.addEventListener("click", () => {
      scrollTabs(subTabs.clientWidth / 2);
    });

    subTabs.addEventListener("wheel", (e) => {
      if (subTabs.scrollWidth > subTabs.clientWidth) {
        e.preventDefault();
        subTabs.scrollBy({
          left: e.deltaY,
          behavior: "smooth"
        });
      }
    }, { passive: false });

    subTabs.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    window.updateSubTabsArrows = updateArrows;
  }

  function initMainTabs() {
    const btnAll = document.getElementById("tabAll");
    const btnSeason = document.getElementById("tabSeason");
    const btnType = document.getElementById("tabType");
    const btnCollection = document.getElementById("tabCollection");

    const tabs = [
      { id: "all", el: btnAll },
      { id: "season", el: btnSeason },
      { id: "type", el: btnType },
      { id: "collection", el: btnCollection }
    ];

    tabs.forEach(({ id, el }) => {
      if (!el) return;
      el.addEventListener("click", () => {
        if (currentMainTab === id) return;
        currentMainTab = id;
        
        tabs.forEach((t) => {
          if (t.el) {
            t.el.classList.remove("is-active");
            t.el.setAttribute("aria-selected", "false");
          }
        });
        el.classList.add("is-active");
        el.setAttribute("aria-selected", "true");
        
        renderSubTabs();
        renderProductGrid();
      });
    });
  }

  /* ---- 초기화 --------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderGrid(document.getElementById("newArrivalsGrid"), NEW_ARRIVALS);
    initMainTabs();
    initTabsScroll();
    renderSubTabs();
    renderProductGrid();
    renderGrid(document.getElementById("popularRow"), POPULAR);
  });
})();
