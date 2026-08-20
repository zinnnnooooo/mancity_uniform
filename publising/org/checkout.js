/* ============================================================
   UNI:CITY — checkout.js
   주문/결제 로직: 배송지 탭 전환 및 신규 주소 입력 /
   주문 상품 옵션(마킹/패치/사이즈) 실시간 변경 모달 및 결제 금액 재계산
   ============================================================ */

function initCheckoutPage() {
  const FREE_SHIPPING_THRESHOLD = 200000;
  const SHIPPING_FEE = 3000;

  const currentShippingAddress = {
    badge: '기본 배송지',
    user: 'CTID9320 (010-9320-2026)',
    main: '서울특별시 강남구 테헤란로 123 맨시티빌딩 9층',
    sub: '(역삼동, 시티인사이트)'
  };

  let cartItems = [];
  try {
    cartItems = JSON.parse(localStorage.getItem('unicity_cart')) || [];
  } catch (e) {
    cartItems = [];
  }

  let orderItems = cartItems.filter((item) => item.checked !== false);
  if (orderItems.length === 0) orderItems = cartItems;

  const coItemListEl = document.getElementById('coItemList');
  const coItemCountEl = document.getElementById('coItemCount');
  const coSumProductEl = document.getElementById('coSumProduct');
  const coSumMarkingEl = document.getElementById('coSumMarking');
  const coSumPatchEl = document.getElementById('coSumPatch');
  const coSumShippingEl = document.getElementById('coSumShipping');
  const coSumTotalEl = document.getElementById('coSumTotal');
  const btnPayEl = document.getElementById('btnPay');
  const btnBackEl = document.getElementById('btnBack');
  const btnToggleItemsEl = document.getElementById('btnToggleItems');
  const checkAgreeEl = document.getElementById('checkAgree');
  const paymentGridEl = document.getElementById('paymentGrid');

  // 배송지 탭 및 뷰 요소
  const tabDefaultAddr = document.getElementById('tabDefaultAddr');
  const tabNewAddr = document.getElementById('tabNewAddr');
  const viewDefaultAddr = document.getElementById('viewDefaultAddr');
  const viewNewAddr = document.getElementById('viewNewAddr');

  const displayAddrBadge = document.getElementById('displayAddrBadge');
  const displayAddrUser = document.getElementById('displayAddrUser');
  const displayAddrMain = document.getElementById('displayAddrMain');
  const displayAddrSub = document.getElementById('displayAddrSub');

  // 신규 배송지 폼
  const inputRecipient = document.getElementById('inputRecipient');
  const inputPhone = document.getElementById('inputPhone');
  const inputAddress = document.getElementById('inputAddress');
  const inputAddressDetail = document.getElementById('inputAddressDetail');
  const btnSearchAddr = document.getElementById('btnSearchAddr');
  const btnSubmitNewAddr = document.getElementById('btnSubmitNewAddr');

  // 배송 요청사항 드롭다운
  const deliveryReqDropdown = document.getElementById('deliveryReqDropdown');
  const deliveryReqTrigger = document.getElementById('deliveryReqTrigger');
  const deliveryReqText = document.getElementById('deliveryReqText');
  const deliveryReqMenu = document.getElementById('deliveryReqMenu');

  // 옵션 변경 모달 요소
  const optModal = document.getElementById('optModal');
  const btnCloseOptModal = document.getElementById('btnCloseOptModal');
  const optTargetName = document.getElementById('optTargetName');
  const optSizeList = document.getElementById('optSizeList');
  const optMarkingDropdown = document.getElementById('optMarkingDropdown');
  const optMarkingTrigger = document.getElementById('optMarkingTrigger');
  const optMarkingText = document.getElementById('optMarkingText');
  const optMarkingMenu = document.getElementById('optMarkingMenu');
  const optPatchDropdown = document.getElementById('optPatchDropdown');
  const optPatchTrigger = document.getElementById('optPatchTrigger');
  const optPatchText = document.getElementById('optPatchText');
  const optPatchMenu = document.getElementById('optPatchMenu');
  const btnSaveOption = document.getElementById('btnSaveOption');

  // 결제 완료 모달
  const successModal = document.getElementById('successModal');
  const modalOrderNo = document.getElementById('modalOrderNo');
  const modalAddress = document.getElementById('modalAddress');
  const modalPrice = document.getElementById('modalPrice');
  const btnConfirmSuccess = document.getElementById('btnConfirmSuccess');

  // 현재 모달에서 수정 중인 상품 인덱스 및 임시 상태
  let editingItemIndex = -1;
  const tempOptionState = {
    size: 'L',
    markingLabel: 'No marking',
    markingFee: 0,
    patchLabel: 'No patch',
    patchFee: 0
  };

  function getProductData(productId) {
    let list = [];
    if (typeof PRODUCTS !== 'undefined') {
      list = PRODUCTS;
    } else if (typeof window.PRODUCTS !== 'undefined') {
      list = window.PRODUCTS;
    }
    return list.find((p) => p.id === productId) || null;
  }

  function formatPrice(n) {
    return Number(n || 0).toLocaleString('ko-KR') + '원';
  }

  function updateAddressDisplay() {
    if (displayAddrBadge) displayAddrBadge.textContent = currentShippingAddress.badge;
    if (displayAddrUser) displayAddrUser.textContent = currentShippingAddress.user;
    if (displayAddrMain) displayAddrMain.textContent = currentShippingAddress.main;
    if (displayAddrSub) displayAddrSub.textContent = currentShippingAddress.sub;
  }

  // 1. 배송지 탭 전환
  if (tabDefaultAddr && tabNewAddr) {
    tabDefaultAddr.onclick = function () {
      tabDefaultAddr.classList.add('is-active');
      tabNewAddr.classList.remove('is-active');
      viewDefaultAddr.style.display = 'block';
      viewNewAddr.style.display = 'none';
    };

    tabNewAddr.onclick = function () {
      tabNewAddr.classList.add('is-active');
      tabDefaultAddr.classList.remove('is-active');
      viewDefaultAddr.style.display = 'none';
      viewNewAddr.style.display = 'flex';
      if (inputAddress) inputAddress.focus();
    };
  }

  if (btnSearchAddr) {
    btnSearchAddr.onclick = function () {
      if (inputAddress) inputAddress.value = '서울특별시 마포구 월드컵로 240';
      if (inputAddressDetail) inputAddressDetail.focus();
    };
  }

  if (btnSubmitNewAddr) {
    btnSubmitNewAddr.onclick = function () {
      const recipient = inputRecipient ? inputRecipient.value.trim() : '';
      const phone = inputPhone ? inputPhone.value.trim() : '';
      const addr = inputAddress ? inputAddress.value.trim() : '';
      const addrDetail = inputAddressDetail ? inputAddressDetail.value.trim() : '';

      if (!addr) {
        alert('주소를 입력해 주세요.');
        if (inputAddress) inputAddress.focus();
        return;
      }

      currentShippingAddress.badge = '신규 배송지';
      currentShippingAddress.user = `${recipient || '수령인'} (${phone || '010-0000-0000'})`;
      currentShippingAddress.main = addr;
      currentShippingAddress.sub = addrDetail ? `(${addrDetail})` : '';

      updateAddressDisplay();

      tabDefaultAddr.classList.add('is-active');
      tabNewAddr.classList.remove('is-active');
      viewDefaultAddr.style.display = 'block';
      viewNewAddr.style.display = 'none';
    };
  }

  // 2. 주문 상품 목록 렌더링
  function renderOrderItems() {
    if (coItemCountEl) coItemCountEl.textContent = orderItems.length;

    if (!coItemListEl) return;

    if (orderItems.length === 0) {
      coItemListEl.innerHTML = `
        <div style="padding: 24px 0; text-align: center; color: rgba(255,255,255,0.4); font-size: 13px;">
          주문할 상품이 없습니다.
        </div>`;
      return;
    }

    coItemListEl.innerHTML = orderItems
      .map((item, index) => {
        const product = getProductData(item.id) || {
          name: '유니시티 레플리카 유니폼',
          image: 'img/uniform_31.png',
          season: '26/27',
          price: 189000
        };

        const displayName = product.season && !product.name.includes(product.season)
          ? `${product.season} 시즌 ${product.name}`
          : product.name;

        const sizeStr = item.option && item.option.size ? item.option.size : 'FREE';
        const markingStr = item.option && item.option.marking ? item.option.marking : 'No marking';
        const patchStr = item.option && item.option.patch ? item.option.patch : 'No patch';
        const optText = `SIZE ${sizeStr} | ${markingStr} | ${patchStr}`;

        const unitTotal = (Number(product.price) + (Number(item.markingFee) || 0) + (Number(item.patchFee) || 0)) * Number(item.qty);

        return `
          <div class="co-item-card" data-index="${index}">
            <div class="co-item__thumb">
              <img src="${product.image || 'img/uniform_31.png'}" alt="${displayName}" onerror="this.src='img/uniform_31.png'" />
            </div>
            <div class="co-item__info">
              <div class="co-item__head">
                <h3 class="co-item__name">${displayName}</h3>
                <button type="button" class="co-item__edit-btn js-btn-edit-opt" data-index="${index}">옵션 변경</button>
              </div>
              <p class="co-item__opt">${optText}</p>
              <div class="co-item__meta">
                <span class="co-item__qty">수량 ${item.qty}개</span>
                <span class="co-item__price">${formatPrice(unitTotal)}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // 3. 결제 요약 계산
  function calculateSummary() {
    let productSum = 0;
    let markingSum = 0;
    let patchSum = 0;

    orderItems.forEach((item) => {
      const product = getProductData(item.id) || { price: 189000 };
      productSum += Number(product.price) * Number(item.qty);
      markingSum += (Number(item.markingFee) || 0) * Number(item.qty);
      patchSum += (Number(item.patchFee) || 0) * Number(item.qty);
    });

    const subtotal = productSum + markingSum + patchSum;
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || orderItems.length === 0;
    const shippingFee = (orderItems.length === 0 || isFreeShipping) ? 0 : SHIPPING_FEE;
    const totalAmount = subtotal + shippingFee;

    if (coSumProductEl) coSumProductEl.textContent = formatPrice(productSum);
    if (coSumMarkingEl) coSumMarkingEl.textContent = `+${formatPrice(markingSum)}`;
    if (coSumPatchEl) coSumPatchEl.textContent = `+${formatPrice(patchSum)}`;
    if (coSumShippingEl) {
      if (orderItems.length === 0) {
        coSumShippingEl.textContent = '0원';
      } else {
        coSumShippingEl.textContent = isFreeShipping ? '0원 (무료배송)' : formatPrice(shippingFee);
      }
    }
    if (coSumTotalEl) coSumTotalEl.textContent = formatPrice(totalAmount);
    if (btnPayEl) btnPayEl.textContent = `${formatPrice(totalAmount)} 결제하기`;

    return totalAmount;
  }

  // 4. 상세페이지와 연동된 옵션 변경 모달 열기
  function openOptionModal(index) {
    editingItemIndex = index;
    const item = orderItems[index];
    if (!item) return;

    const product = getProductData(item.id) || {
      name: '유니폼',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      markingOptions: [],
      patchOptions: []
    };

    const displayName = product.season && !product.name.includes(product.season)
      ? `${product.season} 시즌 ${product.name}`
      : product.name;

    if (optTargetName) optTargetName.textContent = displayName;

    tempOptionState.size = item.option && item.option.size ? item.option.size : 'L';
    tempOptionState.markingLabel = item.option && item.option.marking ? item.option.marking : 'No marking';
    tempOptionState.markingFee = Number(item.markingFee) || 0;
    tempOptionState.patchLabel = item.option && item.option.patch ? item.option.patch : 'No patch';
    tempOptionState.patchFee = Number(item.patchFee) || 0;

    // 사이즈 리스트 바인딩
    const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
    if (optSizeList) {
      optSizeList.innerHTML = sizes
        .map((s) => `<button type="button" class="co-opt-size-btn ${s === tempOptionState.size ? 'is-active' : ''}" data-size="${s}">${s}</button>`)
        .join('');
    }

    // 마킹 옵션 메뉴 바인딩 (상품 상세 마스터 데이터와 연동)
    const markingOptions = (product.markingOptions && product.markingOptions.length > 0)
      ? product.markingOptions
      : [
        { name: "No marking", price: 0 },
        { name: "RUBEN DIAS 3", price: 15000 },
        { name: "STONES 5", price: 15000 },
        { name: "HAALAND 9", price: 15000 },
        { name: "RODRI 16", price: 15000 },
        { name: "BERNARDO 20", price: 15000 },
        { name: "FODEN 47", price: 15000 }
      ];

    if (optMarkingMenu) {
      optMarkingMenu.innerHTML = markingOptions
        .map((opt, idx) => {
          const isSelected = opt.name === tempOptionState.markingLabel ? ' is-selected' : '';
          const suffix = opt.price > 0 ? ` (+${formatPrice(opt.price)})` : '';
          return `
            <button type="button" class="co-dropdown__item${isSelected}" data-index="${idx}" data-name="${opt.name}" data-price="${opt.price}">
              <span>${opt.name}</span>
              <span>${suffix}</span>
            </button>
          `;
        })
        .join('');
    }
    if (optMarkingText) {
      const suffix = tempOptionState.markingFee > 0 ? ` (+${formatPrice(tempOptionState.markingFee)})` : '';
      optMarkingText.textContent = tempOptionState.markingLabel + suffix;
    }

    // 패치 옵션 메뉴 바인딩 (상품 상세 마스터 데이터와 연동)
    const patchOptions = (product.patchOptions && product.patchOptions.length > 0)
      ? product.patchOptions
      : [
        { name: "No patch", price: 0 },
        { name: "PL PATCH", price: 8000 },
        { name: "UCL PATCH", price: 8000 }
      ];

    if (optPatchMenu) {
      optPatchMenu.innerHTML = patchOptions
        .map((opt, idx) => {
          const isSelected = opt.name === tempOptionState.patchLabel ? ' is-selected' : '';
          const suffix = opt.price > 0 ? ` (+${formatPrice(opt.price)})` : '';
          return `
            <button type="button" class="co-dropdown__item${isSelected}" data-index="${idx}" data-name="${opt.name}" data-price="${opt.price}">
              <span>${opt.name}</span>
              <span>${suffix}</span>
            </button>
          `;
        })
        .join('');
    }
    if (optPatchText) {
      const suffix = tempOptionState.patchFee > 0 ? ` (+${formatPrice(tempOptionState.patchFee)})` : '';
      optPatchText.textContent = tempOptionState.patchLabel + suffix;
    }

    if (optModal) {
      optModal.classList.add('is-open');
      optModal.setAttribute('aria-hidden', 'false');
    }
  }

  // 리스트 내 옵션 변경 클릭 위임
  if (coItemListEl) {
    coItemListEl.onclick = function (e) {
      const btn = e.target.closest('.js-btn-edit-opt');
      if (!btn) return;
      e.stopPropagation();
      const idx = Number(btn.dataset.index);
      openOptionModal(idx);
    };
  }

  // 옵션 모달 닫기
  if (btnCloseOptModal) {
    btnCloseOptModal.onclick = function (e) {
      e.stopPropagation();
      if (optModal) {
        optModal.classList.remove('is-open');
        optModal.setAttribute('aria-hidden', 'true');
      }
    };
  }

  // 모달 내 사이즈 선택
  if (optSizeList) {
    optSizeList.onclick = function (e) {
      const btn = e.target.closest('.co-opt-size-btn');
      if (!btn) return;
      optSizeList.querySelectorAll('.co-opt-size-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      tempOptionState.size = btn.dataset.size;
    };
  }

  // 모달 내 마킹 드롭다운 토글
  if (optMarkingTrigger) {
    optMarkingTrigger.onclick = function (e) {
      e.stopPropagation();
      if (optPatchDropdown) optPatchDropdown.classList.remove('is-open');
      if (optMarkingDropdown) optMarkingDropdown.classList.toggle('is-open');
    };
  }

  if (optMarkingMenu) {
    optMarkingMenu.onclick = function (e) {
      const item = e.target.closest('.co-dropdown__item');
      if (!item) return;
      e.stopPropagation();
      tempOptionState.markingLabel = item.dataset.name;
      tempOptionState.markingFee = Number(item.dataset.price) || 0;

      optMarkingMenu.querySelectorAll('.co-dropdown__item').forEach((i) => i.classList.remove('is-selected'));
      item.classList.add('is-selected');

      const suffix = tempOptionState.markingFee > 0 ? ` (+${formatPrice(tempOptionState.markingFee)})` : '';
      if (optMarkingText) optMarkingText.textContent = tempOptionState.markingLabel + suffix;

      if (optMarkingDropdown) optMarkingDropdown.classList.remove('is-open');
    };
  }

  // 모달 내 패치 드롭다운 토글
  if (optPatchTrigger) {
    optPatchTrigger.onclick = function (e) {
      e.stopPropagation();
      if (optMarkingDropdown) optMarkingDropdown.classList.remove('is-open');
      if (optPatchDropdown) optPatchDropdown.classList.toggle('is-open');
    };
  }

  if (optPatchMenu) {
    optPatchMenu.onclick = function (e) {
      const item = e.target.closest('.co-dropdown__item');
      if (!item) return;
      e.stopPropagation();
      tempOptionState.patchLabel = item.dataset.name;
      tempOptionState.patchFee = Number(item.dataset.price) || 0;

      optPatchMenu.querySelectorAll('.co-dropdown__item').forEach((i) => i.classList.remove('is-selected'));
      item.classList.add('is-selected');

      const suffix = tempOptionState.patchFee > 0 ? ` (+${formatPrice(tempOptionState.patchFee)})` : '';
      if (optPatchText) optPatchText.textContent = tempOptionState.patchLabel + suffix;

      if (optPatchDropdown) optPatchDropdown.classList.remove('is-open');
    };
  }

  // 옵션 변경사항 저장 및 실시간 재계산
  if (btnSaveOption) {
    btnSaveOption.onclick = function (e) {
      e.stopPropagation();
      if (editingItemIndex < 0 || !orderItems[editingItemIndex]) return;

      const target = orderItems[editingItemIndex];
      target.option = target.option || {};
      target.option.size = tempOptionState.size;
      target.option.marking = tempOptionState.markingLabel;
      target.option.patch = tempOptionState.patchLabel;
      target.markingFee = tempOptionState.markingFee;
      target.patchFee = tempOptionState.patchFee;

      localStorage.setItem('unicity_cart', JSON.stringify(cartItems));

      renderOrderItems();
      calculateSummary();

      if (optModal) {
        optModal.classList.remove('is-open');
        optModal.setAttribute('aria-hidden', 'true');
      }
    };
  }

  // 배송 요청사항 드롭다운
  if (deliveryReqTrigger) {
    deliveryReqTrigger.onclick = function (e) {
      e.stopPropagation();
      if (deliveryReqDropdown) deliveryReqDropdown.classList.toggle('is-open');
    };
  }

  if (deliveryReqMenu) {
    deliveryReqMenu.onclick = function (e) {
      const item = e.target.closest('.co-dropdown__item');
      if (!item) return;
      e.stopPropagation();
      deliveryReqMenu.querySelectorAll('.co-dropdown__item').forEach((el) => el.classList.remove('is-selected'));
      item.classList.add('is-selected');
      if (deliveryReqText) deliveryReqText.textContent = item.dataset.val;
      if (deliveryReqDropdown) deliveryReqDropdown.classList.remove('is-open');
    };
  }

  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener('click', () => {
    if (deliveryReqDropdown) deliveryReqDropdown.classList.remove('is-open');
    if (optMarkingDropdown) optMarkingDropdown.classList.remove('is-open');
    if (optPatchDropdown) optPatchDropdown.classList.remove('is-open');
  });

  // 주문 상품 목록 펼치기/접기
  if (btnToggleItemsEl) {
    btnToggleItemsEl.onclick = function () {
      const isExpanded = btnToggleItemsEl.getAttribute('aria-expanded') === 'true';
      btnToggleItemsEl.setAttribute('aria-expanded', !isExpanded);
      if (coItemListEl) coItemListEl.style.display = isExpanded ? 'none' : 'flex';
    };
  }

  // 결제 수단 선택
  if (paymentGridEl) {
    paymentGridEl.onclick = function (e) {
      const btn = e.target.closest('.co-pay-btn');
      if (!btn) return;
      paymentGridEl.querySelectorAll('.co-pay-btn').forEach((el) => el.classList.remove('is-active'));
      btn.classList.add('is-active');
    };
  }

  // 뒤로가기
  if (btnBackEl) {
    btnBackEl.onclick = function (e) {
      e.preventDefault();
      if (typeof window.loadCartPage === 'function') {
        window.loadCartPage();
      } else if (typeof goBack === 'function') {
        goBack('cart.html');
      } else {
        window.history.back();
      }
    };
  }

  // 최종 결제 실행
  if (btnPayEl) {
    btnPayEl.onclick = function (e) {
      e.preventDefault();
      if (orderItems.length === 0) {
        alert('결제할 주문 상품이 없습니다.');
        return;
      }
      if (checkAgreeEl && !checkAgreeEl.checked) {
        alert('주문 상품 정보 및 결제 조건에 동의해 주세요.');
        return;
      }

      const finalPrice = calculateSummary();
      const randomOrderNo = `MC${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 결제 수단 확인
      const activePayBtn = paymentGridEl ? paymentGridEl.querySelector('.co-pay-btn.is-active') : null;
      const payMethod = activePayBtn ? activePayBtn.dataset.pay : 'card';

      if (payMethod === 'toss') {
        if (typeof TossPayments === 'undefined') {
          alert('토스페이먼츠 SDK가 로드되지 않았습니다. 페이지를 새로고침해 주세요.');
          return;
        }

        try {
          const clientKey = 'test_ck_yZqmkKeP8gaaMl5MDRX4VbQRxB9l';
          const tossPayments = TossPayments(clientKey);

          let orderName = '유니폼';
          if (orderItems.length > 0) {
            const firstItemName = orderItems[0].name || '유니폼';
            orderName = orderItems.length > 1 ? `${firstItemName} 외 ${orderItems.length - 1}건` : firstItemName;
          }

          const basePath = window.location.pathname.endsWith('.html') 
            ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))
            : window.location.pathname.replace(/\/$/, '');

          const successUrl = window.location.origin + basePath + '/success.html';
          const failUrl = window.location.origin + basePath + '/fail.html';

          tossPayments.requestPayment('카드', {
            amount: finalPrice,
            orderId: randomOrderNo,
            orderName: orderName,
            successUrl: successUrl,
            failUrl: failUrl,
          });
        } catch (error) {
          console.error(error);
          alert('결제 요청 중 오류가 발생했습니다: ' + error.message);
        }
        return;
      }

      if (modalOrderNo) modalOrderNo.textContent = randomOrderNo;
      if (modalAddress) modalAddress.textContent = currentShippingAddress.main;
      if (modalPrice) modalPrice.textContent = formatPrice(finalPrice);

      const remainingCart = cartItems.filter((item) => item.checked === false);
      localStorage.setItem('unicity_cart', JSON.stringify(remainingCart));

      if (successModal) successModal.classList.add('is-open');
    };
  }

  // 결제 완료 모달 확인 클릭
  if (btnConfirmSuccess) {
    btnConfirmSuccess.onclick = function (e) {
      e.preventDefault();
      if (successModal) successModal.classList.remove('is-open');
      if (typeof window.loadMyPage === 'function') {
        window.loadMyPage();
      } else {
        window.location.href = 'mypage.html';
      }
    };
  }

  updateAddressDisplay();
  renderOrderItems();
  calculateSummary();
}

window.initCheckoutPage = initCheckoutPage;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('checkout.html') || document.getElementById('coItemList')) {
      initCheckoutPage();
    }
  });
} else {
  if (window.location.pathname.endsWith('checkout.html') || document.getElementById('coItemList')) {
    initCheckoutPage();
  }
}