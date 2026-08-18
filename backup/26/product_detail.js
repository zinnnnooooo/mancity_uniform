/* ============================================================
   UNI:CITY — product_detail.js
   상품 상세 화면 동작: 사이즈 선택 / 마킹·패치 가격 반영 / 수량 조절 /
   실시간 계산 패널 연동 / 장바구니·바로구매 로컬스토리지 완벽 저장 및 SPA 라우팅
   ============================================================ */

window.initProductDetailPage = function (productId) {
  if (!productId) {
    const params = new URLSearchParams(window.location.search);
    productId = params.get('id');
  }
  if (!productId) productId = 'uniform_31';

  const product = {
    id: productId,
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

  const priceEl = document.getElementById('productPrice');
  const sizeListEl = document.getElementById('sizeList');
  const qtyValueEl = document.getElementById('qtyValue');
  const qtyMinusBtn = document.getElementById('qtyMinus');
  const qtyPlusBtn = document.getElementById('qtyPlus');
  const btnAddCart = document.getElementById('btnAddCart');
  const btnBuyNow = document.getElementById('btnBuyNow');
  const btnBack = document.getElementById('btnBack');
  const btnCart = document.getElementById('btnCart');

  const markingDropdownEl = document.getElementById('markingDropdown');
  const markingTriggerEl = document.getElementById('markingTrigger');
  const markingMenuEl = document.getElementById('markingMenu');

  const patchDropdownEl = document.getElementById('patchDropdown');
  const patchTriggerEl = document.getElementById('patchTrigger');
  const patchMenuEl = document.getElementById('patchMenu');

  const calcBasePriceEl = document.getElementById('calcBasePrice');
  const calcMarkingNameEl = document.getElementById('calcMarkingName');
  const calcMarkingPriceEl = document.getElementById('calcMarkingPrice');
  const calcPatchNameEl = document.getElementById('calcPatchName');
  const calcPatchPriceEl = document.getElementById('calcPatchPrice');
  const calcQtyEl = document.getElementById('calcQty');
  const calcTotalPriceEl = document.getElementById('calcTotalPrice');

  function formatPrice(n) {
    return Number(n || 0).toLocaleString('ko-KR') + '원';
  }

  function currentUnitPrice() {
    return Number(product.basePrice) + state.markingFee + state.patchFee;
  }

  function renderPrice() {
    const singleUnitPrice = currentUnitPrice();
    const totalAmount = singleUnitPrice * state.qty;

    if (priceEl) priceEl.textContent = formatPrice(singleUnitPrice);
    if (calcBasePriceEl) calcBasePriceEl.textContent = formatPrice(product.basePrice);
    if (calcMarkingNameEl) calcMarkingNameEl.textContent = state.markingLabel;
    if (calcMarkingPriceEl) calcMarkingPriceEl.textContent = state.markingFee > 0 ? `+${formatPrice(state.markingFee)}` : '+0원';
    if (calcPatchNameEl) calcPatchNameEl.textContent = state.patchLabel;
    if (calcPatchPriceEl) calcPatchPriceEl.textContent = state.patchFee > 0 ? `+${formatPrice(state.patchFee)}` : '+0원';
    if (calcQtyEl) calcQtyEl.textContent = `${state.qty}개`;
    if (calcTotalPriceEl) calcTotalPriceEl.textContent = formatPrice(totalAmount);
  }

  function renderQty() {
    if (qtyValueEl) qtyValueEl.textContent = state.qty;
  }

  function buildCartItem() {
    return {
      id: product.id,
      option: {
        size: state.size,
        marking: state.markingLabel,
        patch: state.patchLabel,
      },
      markingFee: state.markingFee,
      patchFee: state.patchFee,
      qty: state.qty,
      checked: true,
    };
  }

  function saveToLocalStorage(item) {
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('unicity_cart')) || [];
    } catch (e) {
      cart = [];
    }

    const matchIdx = cart.findIndex((c) => (
      c.id === item.id &&
      c.option &&
      c.option.size === item.option.size &&
      c.option.marking === item.option.marking &&
      c.option.patch === item.option.patch
    ));

    if (matchIdx > -1) {
      cart[matchIdx].qty = Number(cart[matchIdx].qty) + Number(item.qty);
    } else {
      cart.push(item);
    }
    localStorage.setItem('unicity_cart', JSON.stringify(cart));
  }

  if (typeof PRODUCTS !== 'undefined') {
    const found = PRODUCTS.find((p) => p.id === productId);
    if (found) {
      product.id = found.id;
      product.name = (found.season ? found.season + " 시즌 " : "") + found.name;
      product.basePrice = found.price;
      product.image = found.image;
      product.badge = found.badge;
      product.season = found.season;
      product.detailImages = found.detailImages || [];
      if (found.sizes) product.sizes = found.sizes;
      if (found.markingOptions) product.markingOptions = found.markingOptions;
      if (found.patchOptions) product.patchOptions = found.patchOptions;
    }
  }

  if (!product.markingOptions || product.markingOptions.length === 0) {
    product.markingOptions = [
      { name: "No marking", price: 0 },
      { name: "HAALAND 9", price: 15000 },
      { name: "RODRI 16", price: 15000 },
      { name: "FODEN 47", price: 15000 },
      { name: "BERNARDO 20", price: 15000 },
      { name: "DE BRUYNE 17", price: 15000 }
    ];
  }

  const nameEl = document.getElementById('productName');
  const imgEl = document.getElementById('productImg');
  const seasonEl = document.getElementById('productSeason');
  const badgeEl = document.getElementById('productBadge');

  if (nameEl) nameEl.textContent = product.name;
  if (imgEl && product.image) {
    imgEl.src = product.image;
    imgEl.alt = product.name;
  }

  const galleryTabsEl = document.getElementById('galleryTabs');
  if (galleryTabsEl) {
    if (product.detailImages && product.detailImages.length > 0 && product.image) {
      const allGalleryImages = [product.image, ...product.detailImages];
      galleryTabsEl.innerHTML = allGalleryImages.map((imgSrc, idx) => {
        const isActive = idx === 0 ? ' is-active' : '';
        return `
          <button type="button" class="pd-gallery-tab${isActive}" data-src="${imgSrc}" aria-label="상세 이미지 ${idx + 1}">
            <img src="${imgSrc}" alt="" onerror="this.parentNode.style.display='none';" />
          </button>
        `;
      }).join('');
      galleryTabsEl.style.display = 'flex';

      galleryTabsEl.querySelectorAll('.pd-gallery-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          galleryTabsEl.querySelectorAll('.pd-gallery-tab').forEach(t => t.classList.remove('is-active'));
          tab.classList.add('is-active');
          if (imgEl) imgEl.src = tab.dataset.src;
        });
      });
    } else {
      galleryTabsEl.innerHTML = '';
      galleryTabsEl.style.display = 'none';
    }
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

  if (sizeListEl && product.sizes) {
    state.size = product.sizes[2] || product.sizes[0] || 'L';
    sizeListEl.innerHTML = product.sizes.map((sz) => {
      const isActive = sz === state.size ? ' is-active' : '';
      return `<button type="button" class="pd-size-btn${isActive}" data-size="${sz}">${sz}</button>`;
    }).join('');
  }

  if (markingMenuEl && product.markingOptions) {
    markingMenuEl.innerHTML = product.markingOptions.map((opt, idx) => {
      const isSelected = opt.name === state.markingLabel ? ' is-selected' : '';
      const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
      return `
        <button type="button" class="pd-dropdown__item${isSelected}" data-index="${idx}">
          <span>${opt.name}</span>
          <span>${suffix}</span>
        </button>
      `;
    }).join('');

    const opt = product.markingOptions.find(o => o.name === state.markingLabel) || product.markingOptions[0];
    const selectedSpan = markingTriggerEl ? markingTriggerEl.querySelector('.pd-dropdown__selected') : null;
    if (selectedSpan && opt) {
      const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
      selectedSpan.textContent = opt.name + suffix;
    }
  }

  if (patchMenuEl && product.patchOptions) {
    patchMenuEl.innerHTML = product.patchOptions.map((opt, idx) => {
      const isSelected = opt.name === state.patchLabel ? ' is-selected' : '';
      const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
      return `
        <button type="button" class="pd-dropdown__item${isSelected}" data-index="${idx}">
          <span>${opt.name}</span>
          <span>${suffix}</span>
        </button>
      `;
    }).join('');

    const opt = product.patchOptions.find(o => o.name === state.patchLabel) || product.patchOptions[0];
    const selectedSpan = patchTriggerEl ? patchTriggerEl.querySelector('.pd-dropdown__selected') : null;
    if (selectedSpan && opt) {
      const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
      selectedSpan.textContent = opt.name + suffix;
    }
  }

  if (sizeListEl) {
    sizeListEl.onclick = function (e) {
      const btn = e.target.closest('.pd-size-btn');
      if (!btn) return;
      sizeListEl.querySelectorAll('.pd-size-btn').forEach((el) => el.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.size = btn.dataset.size;
    };
  }

  if (markingTriggerEl) {
    markingTriggerEl.onclick = function (e) {
      e.stopPropagation();
      if (patchDropdownEl) patchDropdownEl.classList.remove('is-open');
      if (markingDropdownEl) markingDropdownEl.classList.toggle('is-open');
    };
  }

  if (markingMenuEl) {
    markingMenuEl.onclick = function (e) {
      const item = e.target.closest('.pd-dropdown__item');
      if (!item) return;
      const idx = Number(item.dataset.index);
      const opt = product.markingOptions[idx];
      if (!opt) return;

      state.markingFee = opt.price;
      state.markingLabel = opt.name;

      const selectedSpan = markingTriggerEl ? markingTriggerEl.querySelector('.pd-dropdown__selected') : null;
      if (selectedSpan) {
        const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
        selectedSpan.textContent = opt.name + suffix;
      }

      markingMenuEl.querySelectorAll('.pd-dropdown__item').forEach(el => el.classList.remove('is-selected'));
      item.classList.add('is-selected');

      if (markingDropdownEl) markingDropdownEl.classList.remove('is-open');
      renderPrice();
    };
  }

  if (patchTriggerEl) {
    patchTriggerEl.onclick = function (e) {
      e.stopPropagation();
      if (markingDropdownEl) markingDropdownEl.classList.remove('is-open');
      if (patchDropdownEl) patchDropdownEl.classList.toggle('is-open');
    };
  }

  if (patchMenuEl) {
    patchMenuEl.onclick = function (e) {
      const item = e.target.closest('.pd-dropdown__item');
      if (!item) return;
      const idx = Number(item.dataset.index);
      const opt = product.patchOptions[idx];
      if (!opt) return;

      state.patchFee = opt.price;
      state.patchLabel = opt.name;

      const selectedSpan = patchTriggerEl ? patchTriggerEl.querySelector('.pd-dropdown__selected') : null;
      if (selectedSpan) {
        const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
        selectedSpan.textContent = opt.name + suffix;
      }

      patchMenuEl.querySelectorAll('.pd-dropdown__item').forEach(el => el.classList.remove('is-selected'));
      item.classList.add('is-selected');

      if (patchDropdownEl) patchDropdownEl.classList.remove('is-open');
      renderPrice();
    };
  }

  if (qtyMinusBtn) {
    qtyMinusBtn.onclick = function () {
      if (state.qty > 1) {
        state.qty -= 1;
        renderQty();
        renderPrice();
      }
    };
  }

  if (qtyPlusBtn) {
    qtyPlusBtn.onclick = function () {
      state.qty += 1;
      renderQty();
      renderPrice();
    };
  }

  // 장바구니 담기 (모바일 내부 프레임 전환 연동 보정 완료)
  if (btnAddCart) {
    btnAddCart.onclick = function (e) {
      e.preventDefault();
      const item = buildCartItem();
      saveToLocalStorage(item);
      if (typeof window.loadCartPage === 'function') {
        window.loadCartPage();
      } else {
        window.location.href = 'cart.html';
      }
    };
  }

  // 바로구매 (모바일 내부 프레임 결제페이지 전환 연동 보정 완료)
  if (btnBuyNow) {
    btnBuyNow.onclick = function (e) {
      e.preventDefault();
      const item = buildCartItem();
      saveToLocalStorage(item);
      if (typeof window.loadCheckoutPage === 'function') {
        window.loadCheckoutPage();
      } else {
        window.location.href = 'index.html';
      }
    };
  }

  if (btnBack) {
    btnBack.onclick = function (e) {
      e.preventDefault();
      if (typeof window.loadUniformListPage === 'function') {
        window.loadUniformListPage();
      } else if (typeof goBack === 'function') {
        goBack('uni_list.html');
      } else {
        window.history.back();
      }
    };
  }

  if (btnCart) {
    btnCart.onclick = function (e) {
      e.preventDefault();
      if (typeof window.loadCartPage === 'function') {
        window.loadCartPage();
      } else {
        window.location.href = 'cart.html';
      }
    };
  }

  state.qty = 1;
  renderQty();
  renderPrice();
};

if (!window.pdGlobalListenersBound) {
  window.pdGlobalListenersBound = true;
  document.addEventListener('click', () => {
    document.querySelectorAll('.pd-dropdown').forEach(dd => {
      dd.classList.remove('is-open');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.pd-dropdown').forEach(dd => {
        dd.classList.remove('is-open');
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('product_detail.html')) {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('id') || 'uniform_31';
      window.initProductDetailPage(pid);
    }
  });
} else {
  if (window.location.pathname.endsWith('product_detail.html')) {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('id') || 'uniform_31';
    window.initProductDetailPage(pid);
  }
}