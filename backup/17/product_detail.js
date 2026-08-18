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
    markingOptions: [],
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

  // DOM elements (dynamic references)
  let priceEl, sizeListEl, markingSelectEl, patchSelectEl, qtyValueEl;
  let qtyMinusBtn, qtyPlusBtn, btnAddCart, btnBuyNow, btnBack, btnCart;

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

  function renderQty() {
    if (qtyValueEl) {
      qtyValueEl.textContent = state.qty;
    }
  }

  // Bind interactions and check dataset flag to avoid double listener attachments
  function bindInteractions() {
    if (sizeListEl && !sizeListEl.dataset.listenerBound) {
      sizeListEl.dataset.listenerBound = 'true';
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

    if (markingSelectEl && !markingSelectEl.dataset.listenerBound) {
      markingSelectEl.dataset.listenerBound = 'true';
      markingSelectEl.addEventListener('change', function () {
        state.markingFee = Number(markingSelectEl.value) || 0;
        state.markingLabel = markingSelectEl.options[markingSelectEl.selectedIndex].text;
        renderPrice();
      });
    }

    if (patchSelectEl && !patchSelectEl.dataset.listenerBound) {
      patchSelectEl.dataset.listenerBound = 'true';
      patchSelectEl.addEventListener('change', function () {
        state.patchFee = Number(patchSelectEl.value) || 0;
        state.patchLabel = patchSelectEl.options[patchSelectEl.selectedIndex].text;
        renderPrice();
      });
    }

    if (qtyMinusBtn && !qtyMinusBtn.dataset.listenerBound) {
      qtyMinusBtn.dataset.listenerBound = 'true';
      qtyMinusBtn.addEventListener('click', function () {
        if (state.qty > 1) {
          state.qty -= 1;
          renderQty();
        }
      });
    }

    if (qtyPlusBtn && !qtyPlusBtn.dataset.listenerBound) {
      qtyPlusBtn.dataset.listenerBound = 'true';
      qtyPlusBtn.addEventListener('click', function () {
        state.qty += 1;
        renderQty();
      });
    }

    if (btnAddCart && !btnAddCart.dataset.listenerBound) {
      btnAddCart.dataset.listenerBound = 'true';
      btnAddCart.addEventListener('click', function () {
        const item = buildCartItem();
        console.log('[UNI:CITY] 장바구니 담기:', item);
      });
    }

    if (btnBuyNow && !btnBuyNow.dataset.listenerBound) {
      btnBuyNow.dataset.listenerBound = 'true';
      btnBuyNow.addEventListener('click', function () {
        const item = buildCartItem();
        console.log('[UNI:CITY] 바로 구매:', item);
      });
    }

    if (btnBack && !btnBack.dataset.listenerBound) {
      btnBack.dataset.listenerBound = 'true';
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

    if (btnCart && !btnCart.dataset.listenerBound) {
      btnCart.dataset.listenerBound = 'true';
      btnCart.addEventListener('click', function () {
        if (typeof goTo === 'function') {
          goTo('cart.html');
        } else {
          window.location.href = 'cart.html';
        }
      });
    }
  }

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

  function initProductDetailPage(productId) {
    if (!productId) {
      const params = new URLSearchParams(window.location.search);
      productId = params.get('id');
    }
    if (!productId) productId = 'uniform_31';

    // 1. DOM elements 다시 조회
    priceEl = document.getElementById('productPrice');
    sizeListEl = document.getElementById('sizeList');
    markingSelectEl = document.getElementById('markingSelect');
    patchSelectEl = document.getElementById('patchSelect');
    qtyValueEl = document.getElementById('qtyValue');
    qtyMinusBtn = document.getElementById('qtyMinus');
    qtyPlusBtn = document.getElementById('qtyPlus');
    btnAddCart = document.getElementById('btnAddCart');
    btnBuyNow = document.getElementById('btnBuyNow');
    btnBack = document.getElementById('btnBack');
    btnCart = document.getElementById('btnCart');

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

    // fallback marking 명단 정의 (window.PRODUCTS가 비어있거나 문제 있을 때 대응)
    if (!product.markingOptions || product.markingOptions.length === 0) {
      product.markingOptions = [
        { name: "No marking", price: 0 },
        { name: "RUBEN DIAS 3", price: 15000 },
        { name: "REIJNDERS 4", price: 15000 },
        { name: "STONES 5", price: 15000 },
        { name: "AKE 6", price: 15000 },
        { name: "MARMOUSH 7", price: 15000 },
        { name: "HAALAND 9", price: 15000 },
        { name: "CHERKI 10", price: 15000 },
        { name: "DOKU 11", price: 15000 },
        { name: "NICO 14", price: 15000 },
        { name: "RODRI 16", price: 15000 },
        { name: "BERNARDO 20", price: 15000 },
        { name: "AIT-NOURI 21", price: 15000 },
        { name: "GVARDIOL 24", price: 15000 },
        { name: "SAVINHO 26", price: 15000 },
        { name: "MATHEUS NUNES 27", price: 15000 },
        { name: "NICO O'REILLY 33", price: 15000 },
        { name: "KHUSANOV 45", price: 15000 },
        { name: "FODEN 47", price: 15000 },
        { name: "직접 입력 마킹", price: 10000 }
      ];
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

    // 동적 인터랙션 바인딩
    bindInteractions();
  }

  // 글로벌 노출
  window.initProductDetailPage = initProductDetailPage;

  // 단독 진입 지원
  document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith('product_detail.html')) {
      initProductDetailPage();
    }
  });
})();
