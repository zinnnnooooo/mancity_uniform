// ==========================================================================
// UNI:CITY — 2단계
// 필요한 최소한의 인터랙션만 구현 (필터 탭 / 하단 내비게이션 활성 상태)
// ==========================================================================

// ----- 인기 유니폼 필터 탭 (Active 상태 전환) -----
document.querySelectorAll('.popular-uniform__filter').forEach((filter) => {
  filter.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    filter.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('is-active'));
    tab.classList.add('is-active');
  });
});

// ----- 하단 내비게이션 (Active 상태 전환) -----
document.querySelectorAll('.bottom-nav').forEach((nav) => {
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.bottom-nav__item');
    if (!item) return;
    nav.querySelectorAll('.bottom-nav__item').forEach((i) => i.classList.remove('is-active'));
    item.classList.add('is-active');
  });
});

// ----- 데스크톱 검색 폼 (페이지 이동 없이 제출 방지) -----
document.querySelectorAll('.dc-search__form').forEach((form) => {
  form.addEventListener('submit', (e) => e.preventDefault());
});

// ----- 데스크톱 전용 hover 3D & 마우스 위치 빛 연출 -----
if (window.innerWidth >= 481 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dcInteractiveElements = document.querySelectorAll('.dc-search__form, .dc-nav-card, .dc-product-card');

  dcInteractiveElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left; // 요소 내 x 좌표
      const y = e.clientY - rect.top;  // 요소 내 y 좌표

      // CSS custom properties 업데이트
      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);

      // 미세한 3D 회전 계산 (중심 기준 각도 계산)
      const width = rect.width;
      const height = rect.height;

      // 각 컴포넌트별 3D 회전 한계선 차등 설정 (검색창/버튼 강화, 카드는 기존 유지)
      const isSearch = el.classList.contains('dc-search__form');
      const isCard = el.classList.contains('dc-product-card');
      
      let maxRotateY, maxRotateX;
      if (isSearch) {
        maxRotateY = 5.4; // 2.7 -> 5.4 (2배 대폭 강화)
        maxRotateX = 10.4; // 5.2 -> 10.4 (2배 대폭 강화)
      } else if (isCard) {
        maxRotateY = 9;   // 4.5 -> 9 (2배 대폭 강화)
        maxRotateX = 18;  // 9 -> 18 (2배 대폭 강화)
      } else {
        maxRotateY = 10;  // 네비게이션 카드 버튼 (.dc-nav-card) (5 -> 10으로 2배 대폭 강화)
        maxRotateX = 20;  // 10 -> 20으로 2배 대폭 강화
      }

      const rotateY = ((x - width / 2) / (width / 2)) * maxRotateY;
      const rotateX = -((y - height / 2) / (height / 2)) * maxRotateX;

      el.style.setProperty('--rotate-x', `${rotateX}deg`);
      el.style.setProperty('--rotate-y', `${rotateY}deg`);
    });

    el.addEventListener('mouseleave', () => {
      // 마우스가 떠났을 때 변수 리셋 및 원래 위치 복구
      el.style.setProperty('--mouse-x', `-999px`);
      el.style.setProperty('--mouse-y', `-999px`);
      el.style.setProperty('--rotate-x', `0deg`);
      el.style.setProperty('--rotate-y', `0deg`);
    });
  });
}

// ----- 데스크톱 전용 Neon Energy Cursor 및 Light Trail 연출 -----
if (window.innerWidth >= 481 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  (function() {
    const cursorContainer = document.querySelector('.neon-cursor');
    const cursorCore = document.querySelector('.neon-cursor__core');
    const cursorRing = document.querySelector('.neon-cursor__ring');
    const canvas = document.querySelector('.neon-cursor__trail');
    if (!cursorContainer || !cursorCore || !cursorRing || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    // 꼬리 잔상(trail) 좌표 관리를 위한 배열
    const trailPoints = [];
    const maxTrailLength = 8; // 짧은 잔상으로 개수 최소화해 최적화

    // 캔버스 크기 브라우저 창에 맞추기
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 마우스 좌표 업데이트
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // 꼬리 잔상용 좌표 히스토리 저장
      trailPoints.push({ x: mouseX, y: mouseY, time: Date.now() });
      if (trailPoints.length > maxTrailLength) {
        trailPoints.shift();
      }
    });

    // 호버 인터랙션 타겟 설정 (타이포그래피 클래스 추가)
    const hoverSelectors = 'a, button, input, textarea, [role="button"], .dc-search__form, .dc-nav-card, .dc-product-card, .popular-uniform__filter .filter-tab, .dc-brand-copy__sub, .dc-brand-copy__main';
    
    function updateHoverListeners() {
      document.querySelectorAll(hoverSelectors).forEach((el) => {
        // 이벤트 중복 등록 방지
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = 'true';

        el.addEventListener('mouseenter', () => {
          cursorContainer.classList.add('is-hovered');
        });
        el.addEventListener('mouseleave', () => {
          cursorContainer.classList.remove('is-hovered');
        });
      });
    }
    updateHoverListeners();

    // 동적 생성 요소들을 위한 MutationObserver
    const observer = new MutationObserver(() => {
      updateHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 클릭 리플 웨이브 생성
    window.addEventListener('mousedown', () => {
      cursorContainer.classList.add('is-clicked');

      // 리플 엘리먼트 생성
      const ripple = document.createElement('div');
      ripple.className = 'neon-cursor-ripple';
      ripple.style.left = `${mouseX}px`;
      ripple.style.top = `${mouseY}px`;
      cursorContainer.appendChild(ripple);

      // 애니메이션 후 삭제
      setTimeout(() => {
        ripple.remove();
      }, 450);
    });

    window.addEventListener('mouseup', () => {
      cursorContainer.classList.remove('is-clicked');
    });

    // RequestAnimationFrame 루프
    function renderCursor() {
      // 1. 코어(Core): 실제 마우스 위치 즉각 추적
      cursorCore.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      // 2. 링(Ring): 코어보다 미세하게 늦게 따라오게 Lerp(선형 보간) 적용
      const lerpFactor = 0.18; // 쫀득한 느낌
      ringX += (mouseX - ringX) * lerpFactor;
      ringY += (mouseY - ringY) * lerpFactor;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      // 3. 꼬리 잔상(Canvas Trail) 렌더링
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (trailPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trailPoints[0].x, trailPoints[0].y);

        for (let i = 1; i < trailPoints.length; i++) {
          // 부드러운 곡선(quadraticCurveTo)으로 이어 그리기
          const xc = (trailPoints[i].x + trailPoints[i - 1].x) / 2;
          const yc = (trailPoints[i].y + trailPoints[i - 1].y) / 2;
          ctx.quadraticCurveTo(trailPoints[i - 1].x, trailPoints[i - 1].y, xc, yc);
        }

        // 그라데이션 선 스타일 지정
        const gradient = ctx.createLinearGradient(
          trailPoints[0].x, trailPoints[0].y,
          mouseX, mouseY
        );
        gradient.addColorStop(0, 'rgba(108, 171, 221, 0)'); // 꼬리 부분 투명 (스카이블루)
        gradient.addColorStop(0.5, 'rgba(223, 255, 0, 0.15)'); // 네온 옐로우 융합
        gradient.addColorStop(1, 'rgba(108, 171, 221, 0.45)'); // 머리 부분 선명 (스카이블루)

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // 마우스가 멈췄을 때 잔상이 자연스럽게 사라지도록 처리
      if (trailPoints.length > 0) {
        const now = Date.now();
        // 마지막 움직임 이후 50ms 이상 지나면 앞부분 좌표들을 하나씩 비워내 멈췄을 때 꼬리가 수축해 사라짐
        if (now - trailPoints[trailPoints.length - 1].time > 30) {
          trailPoints.shift();
        }
      }

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  })();
}

// ----- 데스크톱 전용 브랜드 타이포그래피 Water Ripple + Impact Click 인터랙션 -----
if (window.innerWidth >= 481 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const subText = document.querySelector('.dc-brand-copy__sub');
  const mainText = document.querySelector('.dc-brand-copy__main');

  // 글자 단위 span 분할 함수
  function splitText(element) {
    if (!element) return;
    const text = element.textContent;
    element.textContent = '';
    
    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.display = 'inline-block';
      span.style.transformOrigin = 'center';
      span.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.4)'; // 기본 복귀 transition
      element.appendChild(span);
    });
  }

  // 텍스트 이벤트 바인딩 함수
  function initInteractiveText(element) {
    if (!element) return;
    splitText(element);

    const spans = element.querySelectorAll('span');

    // 1. Water Ripple Hover 효과
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      spans.forEach((span) => {
        const spanRect = span.getBoundingClientRect();
        const spanX = spanRect.left + spanRect.width / 2;
        const spanY = spanRect.top + spanRect.height / 2;

        const distanceX = mouseX - spanX;
        const distanceY = mouseY - spanY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        const activeRadius = 120; // 물결이 영향 주는 반경

        if (distance < activeRadius) {
          const strength = (activeRadius - distance) / activeRadius;
          
          // translateY, scale, rotate의 조합으로 파동 시뮬레이션
          const translateY = Math.sin(distance * 0.05) * 12 * strength;
          const scale = 1 + 0.15 * strength;
          const rotate = (distanceX / activeRadius) * -20 * strength; // 마우스 방향에 대응한 틸트 회전

          span.style.transition = 'transform 0.05s ease'; // 즉각적인 마우스 추적 추종
          span.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
        } else {
          // 영향 범위 밖은 부드럽게 복원
          span.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.4)';
          span.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        }
      });
    });

    // 마우스 이탈 시 전체 복귀
    element.addEventListener('mouseleave', () => {
      spans.forEach((span) => {
        span.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1.4)';
        span.style.transform = 'translateY(0) scale(1) rotate(0deg)';
      });
    });

    // 2. Impact Click 효과 + Ripple 확산
    element.addEventListener('mousedown', (e) => {
      const rect = element.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // (1) 텍스트 뒤쪽 반투명 링 생성 및 확산
      const textRipple = document.createElement('div');
      textRipple.className = 'dc-text-ripple';
      textRipple.style.left = `${clickX}px`;
      textRipple.style.top = `${clickY}px`;
      element.appendChild(textRipple);

      setTimeout(() => {
        textRipple.remove();
      }, 500);

      // (2) 글자별 충격파 도미노 피지컬 연출
      const mouseX = e.clientX;

      spans.forEach((span) => {
        const spanRect = span.getBoundingClientRect();
        const spanX = spanRect.left + spanRect.width / 2;
        const distanceX = Math.abs(mouseX - spanX);

        // 중심 글자일수록 먼저 반응 (딜레이 차등 부여)
        const delay = distanceX * 0.8;
        const maxDistance = 250;

        if (distanceX < maxDistance) {
          const strength = (maxDistance - distanceX) / maxDistance;

          setTimeout(() => {
            // (A) 순간적 scale 축소 + translateY + rotate (충격 전달)
            span.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            span.style.transform = `translateY(${8 * strength}px) scale(${1 - 0.25 * strength}) rotate(${(mouseX - spanX > 0 ? -1 : 1) * 15 * strength}deg)`;

            // (B) 100ms 뒤 강하게 튕겨 위로 솟구침 (Bounce)
            setTimeout(() => {
              span.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.35)';
              span.style.transform = `translateY(${-18 * strength}px) scale(${1 + 0.18 * strength}) rotate(${(mouseX - spanX > 0 ? 1 : -1) * 8 * strength}deg)`;

              // (C) 원래의 위치로 부드럽게 복구
              setTimeout(() => {
                span.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
                span.style.transform = 'translateY(0) scale(1) rotate(0deg)';
              }, 400);
            }, 100);
          }, delay);
        }
      });
    });
  }

  initInteractiveText(subText);
  initInteractiveText(mainText);
}// ----- 모바일 전용 Parallax Scrolling 인터랙션 -----
(function() {
  const scrollContainer = document.querySelector('.app-main');
  if (!scrollContainer) return;

  const heroImg = scrollContainer.querySelector('.hero__media img');
  const legacySection = scrollContainer.querySelector('.club-history');
  const legacyEmblem = scrollContainer.querySelector('.club-history__emblem');
  const main3Section = scrollContainer.querySelector('.club-feature-image');
  const main3Img = scrollContainer.querySelector('.club-feature-image img');
  const retroSection = scrollContainer.querySelector('.retro-collection');
  const retroImg = scrollContainer.querySelector('.retro-collection__media img');


  // Parallax 이미지 가두기 및 여유 공간 확보 (가장자리 빈 공간 노출 방지)
  if (heroImg) {
    heroImg.style.position = 'absolute';
    heroImg.style.height = '120%';
    heroImg.style.top = '-10%';
    heroImg.style.left = '0';
    heroImg.style.width = '100%';
    heroImg.style.objectFit = 'cover';
  }


  // prefers-reduced-motion 상태 감지
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = motionQuery.matches;

  function clearTransforms() {
    if (heroImg) {
      heroImg.style.transform = '';
      heroImg.style.filter = '';
    }
    if (legacyEmblem) {
      legacyEmblem.style.transform = '';
    }
    if (main3Img) {
      main3Img.style.transform = '';
    }
    if (retroImg) {
      retroImg.style.transform = '';
    }
  }

  motionQuery.addEventListener('change', (e) => {
    isReducedMotion = e.matches;
    if (isReducedMotion) {
      clearTransforms();
    } else {
      onScroll();
    }
  });

  let ticking = false;

  function updateParallax() {
    if (isReducedMotion) {
      clearTransforms();
      ticking = false;
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const containerCenter = containerRect.top + containerHeight / 2;

    // 1. Hero (이미지만 움직임, 텍스트 고정)
    if (heroImg) {
      const y = scrollContainer.scrollTop;
      // 강한 Y축 Parallax, 부드러운 scale 변화, 매우 약한 brightness 변화 (하한 0.85 완화)
      const heroY = Math.max(-100, Math.min(100, y * 0.35));
      const heroScale = Math.max(1.12, Math.min(1.18, 1.12 + y * 0.00015));
      const heroBrightness = Math.max(0.85, Math.min(1.0, 1.0 - y * 0.0003));
      
      heroImg.style.transform = `translate3d(0, ${heroY}px, 0) scale(${heroScale})`;
      heroImg.style.filter = `brightness(${heroBrightness})`;
    }

    // 2. LEGACY logo_5 Parallax (엠블럼만 움직임, timeline/년도/설명 등 고정)
    if (legacySection && legacyEmblem) {
      const rect = legacySection.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const offsetFromCenter = elementCenter - containerCenter;

      // Y축 최대 ±70~75px, X축 매우 약하게, scale 1.00~1.06, rotate 최대 ±1deg
      const legacyY = Math.max(-72, Math.min(72, offsetFromCenter * -0.12));
      const legacyX = Math.max(-10, Math.min(10, offsetFromCenter * -0.015));
      const legacyScale = Math.max(1.00, Math.min(1.06, 1.03 - (offsetFromCenter * 0.0001)));
      const legacyRotate = Math.max(-1, Math.min(1, offsetFromCenter * 0.0015));

      // translateY(-50%) 중심 정렬 보존
      legacyEmblem.style.transform = `translate3d(${legacyX}px, calc(-50% + ${legacyY}px), 0) scale(${legacyScale}) rotate(${legacyRotate}deg)`;
    }

    // 3. main_3 Parallax (컨테이너 고정, 이미지 파일만 움직임)
    if (main3Section && main3Img) {
      const rect = main3Section.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const offsetFromCenter = elementCenter - containerCenter;

      // Y축 최대 ±65~75px, scale 1.10~1.16
      const main3Y = Math.max(-68, Math.min(68, offsetFromCenter * 0.10));
      const main3Scale = Math.max(1.10, Math.min(1.16, 1.13 - (offsetFromCenter * 0.0001)));

      main3Img.style.transform = `translate3d(0, ${main3Y}px, 0) scale(${main3Scale})`;
    }

    // 4. model_1 Parallax (레트로 컬렉션 이미지만 움직임, 텍스트 고정)
    if (retroSection && retroImg) {
      const rect = retroSection.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const offsetFromCenter = elementCenter - containerCenter;

      // Y축 최대 ±70~78px, X축 아주 약하게, scale 1.10~1.16
      const retroY = Math.max(-72, Math.min(72, offsetFromCenter * -0.10));
      const retroX = Math.max(-10, Math.min(10, offsetFromCenter * -0.015));
      const retroScale = Math.max(1.10, Math.min(1.16, 1.13 - (offsetFromCenter * 0.0001)));

      retroImg.style.transform = `translate3d(${retroX}px, ${retroY}px, 0) scale(${retroScale})`;
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  // 스크롤 이벤트 등록
  scrollContainer.addEventListener('scroll', onScroll);

  // 최초 1회 렌더링
  updateParallax();
})();

// ----- 데스크톱 인기 유니폼 Auto Slider (1페이지 <-> 2페이지) -----
(function() {
  const cards = document.querySelectorAll('.dc-product-card');
  const dots = document.querySelectorAll('.dc-carousel-indicator__dot');
  if (cards.length === 0) return;

  const productPages = [
    [
      {
        img: '../../img/uniform_21.png',
        alt: '22/23 홈 레플리카 유니폼',
        season: '22/23 SEASON',
        name: '홈 레플리카 유니폼',
        price: '189,000원'
      },
      {
        img: '../../img/uniform_10.png',
        alt: '23/24 어웨이 레플리카 유니폼',
        season: '23/24 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '135,000원'
      },
      {
        img: '../../img/uniform_19.png',
        alt: '15/16 어웨이 레플리카 유니폼',
        season: '15/16 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '103,000원'
      },
      {
        img: '../../img/uniform_20.png',
        alt: '홈 레트로 유니폼',
        season: '88/89 SEASON',
        name: '홈 레트로 유니폼',
        price: '85,000원'
      }
    ],
    [
      {
        img: '../../img/uniform_30.png',
        alt: '125주년 기념 유니폼',
        season: 'SPECIAL',
        name: '125주년 기념 유니폼',
        price: '350,000원'
      },
      {
        img: '../../img/uniform_31.png',
        alt: '26/27 홈 레플리카 유니폼',
        season: '26/27 SEASON',
        name: '홈 레플리카 유니폼',
        price: '160,000원'
      },
      {
        img: '../../img/uniform_22.png',
        alt: '15/16 홈 레플리카 유니폼',
        season: '15/16 SEASON',
        name: '홈 레플리카 유니폼',
        price: '110,000원'
      },
      {
        img: '../../img/uniform_25.png',
        alt: '19/20 써드 레플리카 유니폼',
        season: '19/20 SEASON',
        name: '써드 레플리카 유니폼',
        price: '75,000원'
      }
    ],
    [
      {
        img: '../../img/uniform_29.png',
        alt: '어웨이 레트로 유니폼',
        season: '97/98 SEASON',
        name: '어웨이 레트로 유니폼',
        price: '100,000원'
      },
      {
        img: '../../img/uniform_27.png',
        alt: '홈 레플리카 유니폼',
        season: '13/14 SEASON',
        name: '홈 레플리카 유니폼',
        price: '83,000원'
      },
      {
        img: '../../img/uniform_23.png',
        alt: '어웨이 레플리카 유니폼',
        season: '20/21 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '117,000원'
      },
      {
        img: '../../img/uniform_9.png',
        alt: '홈 레플리카 유니폼',
        season: '23/24 SEASON',
        name: '홈 레플리카 유니폼',
        price: '155,000원'
      }
    ],
    [
      {
        img: '../../img/uniform_26.png',
        alt: '홈 레플리카 유니폼',
        season: '17/18 SEASON',
        name: '홈 레플리카 유니폼',
        price: '105,000원'
      },
      {
        img: '../../img/uniform_24.png',
        alt: '어웨이 레플리카 유니폼',
        season: '25/26 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '98,000원'
      },
      {
        img: '../../img/uniform_32.png',
        alt: '홈 레플리카 유니폼',
        season: '11/12 SEASON',
        name: '홈 레플리카 유니폼',
        price: '197,000원'
      },
      {
        img: '../../img/uniform_28.png',
        alt: '홈 레트로 유니폼',
        season: '99/00 SEASON',
        name: '홈 레트로 유니폼',
        price: '100,000원'
      }
    ],
    [
      {
        img: '../../img/uniform_33.png',
        alt: '홈 레플리카 유니폼',
        season: '07/08 SEASON',
        name: '홈 레플리카 유니폼',
        price: '65,000원'
      },
      {
        img: '../../img/uniform_34.png',
        alt: '홈 레플리카 유니폼',
        season: '12/13 SEASON',
        name: '홈 레플리카 유니폼',
        price: '73,000원'
      },
      {
        img: '../../img/uniform_13.png',
        alt: '설날 기념 유니폼',
        season: 'SPECIAL',
        name: '설날 기념 유니폼',
        price: '110,000원'
      },
      {
        img: '../../img/uniform_6.png',
        alt: '어웨이 레플리카 유니폼',
        season: '26/27 SEASON',
        name: '어웨이 레플리카 유니폼',
        price: '150,000원'
      }
    ]
  ];

  let currentPage = 0;
  let sliderTimer = null;
  let isTransitioning = false;

  function showPage(pageIndex) {
    if (isTransitioning) return;
    isTransitioning = true;

    currentPage = pageIndex;
    
    cards.forEach((card, idx) => {
      const delay = idx * 70; // 0ms, 70ms, 140ms, 210ms
      setTimeout(() => {
        // Fade out
        card.style.opacity = '0';
        
        setTimeout(() => {
          // Change data
          const data = productPages[pageIndex][idx];
          const img = card.querySelector('img');
          const season = card.querySelector('.dc-product-card__season');
          const name = card.querySelector('.dc-product-card__name');
          const price = card.querySelector('.dc-product-card__price');
          
          if (img && data) {
            img.src = data.img;
            img.alt = data.alt;
          }
          if (season && data) season.textContent = data.season;
          if (name && data) name.textContent = data.name;
          if (price && data) price.textContent = data.price;
          
          // Fade in
          card.style.opacity = '1';
        }, 300); // Wait for fade out
      }, delay);
    });

    // Update indicators
    dots.forEach((dot, idx) => {
      if (idx === pageIndex) {
        dot.classList.add('is-active');
      } else {
        dot.classList.remove('is-active');
      }
    });

    // Unlock transition after all animations complete (210ms stagger + 300ms fade-out + 300ms fade-in = ~810ms)
    setTimeout(() => {
      isTransitioning = false;
    }, 850);
  }

  function startTimer() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => {
      const nextPage = (currentPage + 1) % productPages.length;
      showPage(nextPage);
    }, 3000);
  }

  function resetTimer() {
    clearInterval(sliderTimer);
    startTimer();
  }

  // Bind click events on all five indicator dots
  dots.forEach((dot, idx) => {
    dot.style.cursor = 'pointer';
    dot.addEventListener('click', () => {
      if (isTransitioning) return;
      if (currentPage !== idx) {
        showPage(idx);
        resetTimer();
      }
    });
  });

  // Bind click events on previous/next arrows
  const prevBtn = document.querySelector('.dc-carousel-btn--prev');
  const nextBtn = document.querySelector('.dc-carousel-btn--next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      const prevPage = (currentPage - 1 + productPages.length) % productPages.length;
      showPage(prevPage);
      resetTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      const nextPage = (currentPage + 1) % productPages.length;
      showPage(nextPage);
      resetTimer();
    });
  }

  // Pause on hover
  const productGrid = document.querySelector('.dc-product-grid');
  if (productGrid) {
    productGrid.addEventListener('mouseenter', () => {
      clearInterval(sliderTimer);
    });
    productGrid.addEventListener('mouseleave', () => {
      startTimer();
    });
  }

  // Start auto slider loop
  startTimer();
})();


