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
  let priceEl, sizeListEl, qtyValueEl;
  let qtyMinusBtn, qtyPlusBtn, btnAddCart, btnBuyNow, btnBack, btnCart;
  let markingDropdownEl, markingTriggerEl, markingMenuEl;
  let patchDropdownEl, patchTriggerEl, patchMenuEl;

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

    // 선수 마킹 드롭다운 트리거 토글
    if (markingTriggerEl && !markingTriggerEl.dataset.listenerBound) {
      markingTriggerEl.dataset.listenerBound = 'true';
      markingTriggerEl.addEventListener('click', function (e) {
        e.stopPropagation();
        if (patchDropdownEl) patchDropdownEl.classList.remove('is-open');
        if (markingDropdownEl) markingDropdownEl.classList.toggle('is-open');
      });
    }

    // 선수 마킹 메뉴 아이템 선택
    if (markingMenuEl && !markingMenuEl.dataset.listenerBound) {
      markingMenuEl.dataset.listenerBound = 'true';
      markingMenuEl.addEventListener('click', function (e) {
        const item = e.target.closest('.pd-dropdown__item');
        if (!item) return;

        const idx = Number(item.dataset.index);
        const opt = product.markingOptions[idx];
        if (!opt) return;

        state.markingFee = opt.price;
        state.markingLabel = opt.name;

        // UI 텍스트 갱신
        const selectedSpan = markingTriggerEl ? markingTriggerEl.querySelector('.pd-dropdown__selected') : null;
        if (selectedSpan) {
          const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
          selectedSpan.textContent = opt.name + suffix;
        }

        // 활성 클래스 갱신
        markingMenuEl.querySelectorAll('.pd-dropdown__item').forEach(el => el.classList.remove('is-selected'));
        item.classList.add('is-selected');

        if (markingDropdownEl) markingDropdownEl.classList.remove('is-open');
        renderPrice();
      });
    }

    // 오피셜 패치 드롭다운 트리거 토글
    if (patchTriggerEl && !patchTriggerEl.dataset.listenerBound) {
      patchTriggerEl.dataset.listenerBound = 'true';
      patchTriggerEl.addEventListener('click', function (e) {
        e.stopPropagation();
        if (markingDropdownEl) markingDropdownEl.classList.remove('is-open');
        if (patchDropdownEl) patchDropdownEl.classList.toggle('is-open');
      });
    }

    // 오피셜 패치 메뉴 아이템 선택
    if (patchMenuEl && !patchMenuEl.dataset.listenerBound) {
      patchMenuEl.dataset.listenerBound = 'true';
      patchMenuEl.addEventListener('click', function (e) {
        const item = e.target.closest('.pd-dropdown__item');
        if (!item) return;

        const idx = Number(item.dataset.index);
        const opt = product.patchOptions[idx];
        if (!opt) return;

        state.patchFee = opt.price;
        state.patchLabel = opt.name;

        // UI 텍스트 갱신
        const selectedSpan = patchTriggerEl ? patchTriggerEl.querySelector('.pd-dropdown__selected') : null;
        if (selectedSpan) {
          const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
          selectedSpan.textContent = opt.name + suffix;
        }

        // 활성 클래스 갱신
        patchMenuEl.querySelectorAll('.pd-dropdown__item').forEach(el => el.classList.remove('is-selected'));
        item.classList.add('is-selected');

        if (patchDropdownEl) patchDropdownEl.classList.remove('is-open');
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
        
        // Get existing cart items
        const cart = JSON.parse(localStorage.getItem('unicity_cart')) || [];
        
        // Find existing identical item + option
        const matchIdx = cart.findIndex((c) => (
          c.id === item.id &&
          c.option.size === item.option.size &&
          c.option.marking === item.option.marking &&
          c.option.patch === item.option.patch
        ));

        if (matchIdx > -1) {
          cart[matchIdx].qty += item.qty;
        } else {
          cart.push(item);
        }

        // Save back to localStorage
        localStorage.setItem('unicity_cart', JSON.stringify(cart));

        // Redirect to cart
        if (typeof goTo === 'function') {
          goTo('cart.html');
        } else {
          window.location.href = 'cart.html';
        }
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

  function initProductDetailPage(productId) {
    if (!productId) {
      const params = new URLSearchParams(window.location.search);
      productId = params.get('id');
    }
    if (!productId) productId = 'uniform_31';

    // 1. DOM elements 다시 조회
    priceEl = document.getElementById('productPrice');
    sizeListEl = document.getElementById('sizeList');
    qtyValueEl = document.getElementById('qtyValue');
    qtyMinusBtn = document.getElementById('qtyMinus');
    qtyPlusBtn = document.getElementById('qtyPlus');
    btnAddCart = document.getElementById('btnAddCart');
    btnBuyNow = document.getElementById('btnBuyNow');
    btnBack = document.getElementById('btnBack');
    btnCart = document.getElementById('btnCart');

    markingDropdownEl = document.getElementById('markingDropdown');
    markingTriggerEl = document.getElementById('markingTrigger');
    markingMenuEl = document.getElementById('markingMenu');

    patchDropdownEl = document.getElementById('patchDropdown');
    patchTriggerEl = document.getElementById('patchTrigger');
    patchMenuEl = document.getElementById('patchMenu');

    if (typeof window.PRODUCTS !== 'undefined') {
      const found = window.PRODUCTS.find(p => p.id === productId);
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
      imgEl.alt = product.name;
      imgEl.style.display = 'block';
    }

    // Dynamic rendering of detailed images gallery tabs
    const galleryTabsEl = document.getElementById('galleryTabs');
    if (galleryTabsEl) {
      if (product.detailImages && product.detailImages.length > 0 && product.image) {
        // Collect all images in order: representative image first, then detail images
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

        // Bind click events on the dynamically generated tabs
        galleryTabsEl.querySelectorAll('.pd-gallery-tab').forEach((tab) => {
          tab.addEventListener('click', () => {
            galleryTabsEl.querySelectorAll('.pd-gallery-tab').forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            if (imgEl) {
              imgEl.src = tab.dataset.src;
            }
          });
        });
      } else {
        // detailImages is empty or not present
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

    // 1) 선수 마킹 커스텀 드롭다운 옵션 렌더링
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

      // 초기 선택값 UI 텍스트 동기화
      const opt = product.markingOptions.find(o => o.name === state.markingLabel) || product.markingOptions[0];
      const selectedSpan = markingTriggerEl ? markingTriggerEl.querySelector('.pd-dropdown__selected') : null;
      if (selectedSpan && opt) {
        const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
        selectedSpan.textContent = opt.name + suffix;
      }
    }

    // 2) 오피셜 패치 커스텀 드롭다운 옵션 렌더링
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

      // 초기 선택값 UI 텍스트 동기화
      const opt = product.patchOptions.find(o => o.name === state.patchLabel) || product.patchOptions[0];
      const selectedSpan = patchTriggerEl ? patchTriggerEl.querySelector('.pd-dropdown__selected') : null;
      if (selectedSpan && opt) {
        const suffix = opt.price > 0 ? ` (+${opt.price.toLocaleString('ko-KR')}원)` : '';
        selectedSpan.textContent = opt.name + suffix;
      }
    }

    // 상태 리셋
    state.qty = 1;
    renderQty();
    renderPrice();

    // 동적 인터랙션 바인딩
    bindInteractions();
  }

  // 글로벌 바깥 클릭 및 ESC 닫기 리스너 (중복 방지 싱글톤 바인딩)
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

  // 글로벌 노출
  window.initProductDetailPage = initProductDetailPage;

  // 단독 진입 지원
  document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith('product_detail.html')) {
      initProductDetailPage();
    }
  });
})();
