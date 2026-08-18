/* ============================================================
   UNI:CITY — product_detail.js
   상품 상세 화면 동작: 사이즈 선택 / 마킹·패치 가격 반영 / 수량 조절 /
   장바구니·바로구매 데이터 객체 구성(cart.html과 필드명 통일)
   ============================================================ */

(function () {
  // ---- 상태 ----
  const product = {
    id: 'city-home-2627',
    name: '2026/27 시즌 홈 레플리카 유니폼',
    thumbnail: 'placeholder-jersey',
    basePrice: 189000,
    image: null,
    badge: null,
    season: null,
    sizes: ["S", "M", "L", "XL", "XXL"],
    markingOptions: [
      { name: "No marking", price: 0 },
      { name: "AGUERO 10", price: 15000 },
      { name: "HAALAND 9", price: 15000 },
      { name: "DE BRUYNE 17", price: 15000 },
      { name: "직접 입력 마킹", price: 10000 }
    ],
    patchOptions: [
      { name: "No patch", price: 0 },
      { name: "PL PATCH", price: 8000 },
      { name: "UCL PATCH", price: 8000 }
    ]
  };

  const state = {
    size: 'L',
    markingFee: 0,
    markingLabel: 'No marking',
    patchFee: 0,
    patchLabel: 'No patch',
    qty: 1,
  };

  const priceEl = document.getElementById('productPrice');
  const sizeListEl = document.getElementById('sizeList');
  const markingSelectEl = document.getElementById('markingSelect');
  const patchSelectEl = document.getElementById('patchSelect');
  const qtyValueEl = document.getElementById('qtyValue');
  const qtyMinusBtn = document.getElementById('qtyMinus');
  const qtyPlusBtn = document.getElementById('qtyPlus');
  const btnAddCart = document.getElementById('btnAddCart');
  const btnBuyNow = document.getElementById('btnBuyNow');
  const btnBack = document.getElementById('btnBack');
  const btnCart = document.getElementById('btnCart');

  function formatPrice(n) {
    return n.toLocaleString('ko-KR') + '원';
  }

  function currentUnitPrice() {
    return product.basePrice + state.markingFee + state.patchFee;
  }

  function renderPrice() {
    if (priceEl) {
      priceEl.textContent = formatPrice(currentUnitPrice());
    }
  }

  // ---- 사이즈 선택 ----
  if (sizeListEl) {
    sizeListEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.pd-size-btn');
      if (!btn) return;
      sizeListEl
        .querySelectorAll('.pd-size-btn')
        .forEach((el) => el.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.size = btn.dataset.size;
    });
  }

  // ---- 선수 마킹 / 오피셜 패치 ----
  if (markingSelectEl) {
    markingSelectEl.addEventListener('change', function () {
      state.markingFee = Number(markingSelectEl.value) || 0;
      state.markingLabel = markingSelectEl.options[markingSelectEl.selectedIndex].text;
      renderPrice();
    });
  }

  if (patchSelectEl) {
    patchSelectEl.addEventListener('change', function () {
      state.patchFee = Number(patchSelectEl.value) || 0;
      state.patchLabel = patchSelectEl.options[patchSelectEl.selectedIndex].text;
      renderPrice();
    });
  }

  // ---- 수량 조절 (최소 1개) ----
  function renderQty() {
    if (qtyValueEl) {
      qtyValueEl.textContent = state.qty;
    }
  }

  if (qtyMinusBtn) {
    qtyMinusBtn.addEventListener('click', function () {
      if (state.qty > 1) {
        state.qty -= 1;
        renderQty();
      }
    });
  }

  if (qtyPlusBtn) {
    qtyPlusBtn.addEventListener('click', function () {
      state.qty += 1;
      renderQty();
    });
  }

  // ---- 장바구니 / 바로 구매: cart.html과 필드명을 통일한 데이터 객체 구성 ----
  function buildCartItem() {
    return {
      id: product.id,
      name: product.name,
      thumbnail: product.image || product.thumbnail,
      option: {
        size: state.size,
        marking: state.markingLabel,
        patch: state.patchLabel,
      },
      price: product.basePrice,
      markingFee: state.markingFee,
      patchFee: state.patchFee,
      qty: state.qty,
      checked: true,
    };
  }

  if (btnAddCart) {
    btnAddCart.addEventListener('click', function () {
      const item = buildCartItem();
      console.log('[UNI:CITY] 장바구니 담기:', item);
    });
  }

  if (btnBuyNow) {
    btnBuyNow.addEventListener('click', function () {
      const item = buildCartItem();
      console.log('[UNI:CITY] 바로 구매:', item);
    });
  }

  // ---- 상단 뒤로가기 / 장바구니 아이콘 ----
  if (btnBack) {
    btnBack.addEventListener('click', function () {
      if (typeof goBack === 'function') {
        if (window.location.pathname.endsWith('product_detail.html')) {
          goBack('uni_list.html');
        } else {
          if (typeof loadUniformListPage === 'function') {
            loadUniformListPage();
          } else {
            goBack('uni_list.html');
          }
        }
      } else {
        window.history.back();
      }
    });
  }

  if (btnCart) {
    btnCart.addEventListener('click', function () {
      if (typeof goTo === 'function') {
        goTo('cart.html');
      } else {
        window.location.href = 'cart.html';
      }
    });
  }

  function initProductDetailPage(productId) {
    if (!productId) {
      const params = new URLSearchParams(window.location.search);
      productId = params.get('id');
    }
    if (!productId) productId = 'uniform_31';

    if (typeof window.PRODUCTS !== 'undefined') {
      const found = window.PRODUCTS.find(p => p.id === productId);
      if (found) {
        product.id = found.id;
        product.name = (found.season ? found.season + " 시즌 " : "") + found.name;
        product.basePrice = found.price;
        product.image = found.image;
        product.badge = found.badge;
        product.season = found.season;
        if (found.sizes) product.sizes = found.sizes;
        if (found.markingOptions) product.markingOptions = found.markingOptions;
        if (found.patchOptions) product.patchOptions = found.patchOptions;
      }
    }

    // DOM 업데이트
    const nameEl = document.getElementById('productName');
    const imgEl = document.getElementById('productImg');
    const seasonEl = document.getElementById('productSeason');
    const badgeEl = document.getElementById('productBadge');

    if (nameEl) nameEl.textContent = product.name;

    if (imgEl && product.image) {
      imgEl.src = product.image;
      imgEl.style.display = 'block';
    }

    if (seasonEl) {
      if (product.season) {
        seasonEl.textContent = product.season + " SEASON";
        seasonEl.style.display = 'inline-flex';
      } else {
        seasonEl.style.display = 'none';
      }
    }

    if (badgeEl) {
      if (product.badge) {
        badgeEl.textContent = product.badge;
        badgeEl.style.display = 'inline-flex';
        badgeEl.className = 'product-badge';
        if (product.badge === 'BEST') {
          badgeEl.style.background = 'var(--color-sky-blue)';
          badgeEl.style.color = 'var(--color-white)';
        } else if (product.badge === 'NEW') {
          badgeEl.style.background = 'var(--color-accent-lime)';
          badgeEl.style.color = '#0c1826';
        }
      } else {
        badgeEl.style.display = 'none';
      }
    }

    // 옵션 UI 렌더링
    if (sizeListEl && product.sizes) {
      state.size = product.sizes[2] || product.sizes[0] || 'L';
      sizeListEl.innerHTML = product.sizes.map((sz) => {
        const isActive = sz === state.size ? ' is-active' : '';
        return `<button type="button" class="pd-size-btn${isActive}" data-size="${sz}">${sz}</button>`;
      }).join('');
    }

    if (markingSelectEl && product.markingOptions) {
      markingSelectEl.innerHTML = product.markingOptions.map((opt) => {
        const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
        return `<option value="${opt.price}">${opt.name}${suffix}</option>`;
      }).join('');
      state.markingFee = Number(markingSelectEl.value) || 0;
      state.markingLabel = markingSelectEl.options[markingSelectEl.selectedIndex].text;
    }

    if (patchSelectEl && product.patchOptions) {
      patchSelectEl.innerHTML = product.patchOptions.map((opt) => {
        const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
        return `<option value="${opt.price}">${opt.name}${suffix}</option>`;
      }).join('');
      state.patchFee = Number(patchSelectEl.value) || 0;
      state.patchLabel = patchSelectEl.options[patchSelectEl.selectedIndex].text;
    }

    // 상태 리셋
    state.qty = 1;
    renderQty();
    renderPrice();
  }

  // 글로벌 노출
  window.initProductDetailPage = initProductDetailPage;

  // 단독 진입 지원
  document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith('product_detail.html')) {
      initProductDetailPage();
    } else {
      renderQty();
    }
  });
})();
