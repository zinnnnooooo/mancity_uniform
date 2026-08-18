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
  const PRODUCTS = window.PRODUCTS || [];

  /* ---- 26/27 시즌 신상품 (탭과 무관하게 항상 고정 노출) ------------------- */
  const NEW_ARRIVALS = PRODUCTS.filter(
    (p) => p.season.includes("26/27") && (p.type === "home" || p.type === "away" || p.type === "third" || p.type === "keeper")
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
    const season = product.season ? `${product.season} SEASON` : "";

    const mediaContent = product.image
      ? `<img src="${product.image}" alt="${name}" class="product-image-img" />`
      : `<svg class="product-jersey" viewBox="0 0 100 100"><use href="#icon-jersey" /></svg>`;

    return `
      <a href="product_detail.html?id=${product.id}" class="product-card-link" data-id="${product.id}" style="text-decoration: none; color: inherit; display: block;">
        <article class="product-card">
          <div class="product-media" style="--kit-color:${kit.color}; --kit-glow:${kit.glow};">
            ${badgeHTML}
            ${mediaContent}
          </div>
          <p class="product-season">${season}</p>
          <p class="product-name">${name}</p>
          <p class="product-price">${formatPrice(product.price)}</p>
        </article>
      </a>
    `;
  }

  function bindProductCardClicks(container) {
    if (!container) return;
    container.querySelectorAll('.product-card-link').forEach(link => {
      if (link.dataset.clickBound) return;
      link.dataset.clickBound = 'true';
      link.addEventListener('click', (e) => {
        if (typeof window.loadProductDetailPage === 'function') {
          e.preventDefault();
          const pid = link.dataset.id;
          window.loadProductDetailPage(pid);
        }
      });
    });
  }

  function renderGrid(el, products) {
    if (!el) return;
    el.innerHTML = products.map(productCardHTML).join("");
    bindProductCardClicks(el);
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
    if (typeof window.updateSubTabsArrows === "function") {
      window.removeEventListener("resize", window.updateSubTabsArrows);
    }
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
  function initUniformListPage() {
    const newArrivalsGrid = document.getElementById("newArrivalsGrid");
    if (!newArrivalsGrid) return;

    renderGrid(newArrivalsGrid, NEW_ARRIVALS);
    initMainTabs();
    initTabsScroll();
    renderSubTabs();
    renderProductGrid();
    renderGrid(document.getElementById("popularRow"), POPULAR);
  }

  // Export globally
  window.initUniformListPage = initUniformListPage;

  // Run automatically if loaded directly on uni_list.html
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (window.location.pathname.endsWith('uni_list.html')) {
        initUniformListPage();
      }
    });
  } else {
    if (window.location.pathname.endsWith('uni_list.html')) {
      initUniformListPage();
    }
  }
})();
