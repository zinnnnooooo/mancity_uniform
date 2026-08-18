/* ==========================================================================
   UNI:CITY — products_data.js
   공통 상품 데이터베이스 (Listing 및 Detail에서 공용 참조)
   ========================================================================== */

(function () {
  const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];
  
  const DEFAULT_MARKINGS = [
    { name: "No marking", price: 0 },
    { name: "AGUERO 10", price: 15000 },
    { name: "HAALAND 9", price: 15000 },
    { name: "DE BRUYNE 17", price: 15000 },
    { name: "직접 입력 마킹", price: 10000 }
  ];
  
  const DEFAULT_PATCHES = [
    { name: "No patch", price: 0 },
    { name: "PL PATCH", price: 8000 },
    { name: "UCL PATCH", price: 8000 }
  ];

  const PRODUCTS = [
    // 26/27 Season
    { id: "uniform_31", type: "home", kit: "home", season: "26/27", name: "홈 레플리카 유니폼", price: 129000, badge: "BEST", image: "../../img/uniform_31.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_6", type: "away", kit: "away", season: "26/27", name: "어웨이 레플리카 유니폼", price: 129000, badge: "NEW", image: "../../img/uniform_6.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_7", type: "third", kit: "third", season: "26/27", name: "써드 레플리카 유니폼", price: 129000, badge: "NEW", image: "../../img/uniform_7.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_8", type: "keeper", kit: "keeper", season: "26/27", name: "키퍼 레플리카 유니폼", price: 129000, badge: "NEW", image: "../../img/uniform_8.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },

    // 25/26 Season
    { id: "uniform_35", type: "home", kit: "home", season: "25/26", name: "홈 레플리카 유니폼", price: 148000, badge: "BEST", image: "../../img/uniform_35.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_24", type: "away", kit: "away", season: "25/26", name: "어웨이 레플리카 유니폼", price: 109000, badge: null, image: "../../img/uniform_24.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_36", type: "third", kit: "third", season: "25/26", name: "써드 레플리카 유니폼", price: 95000, badge: null, image: "../../img/uniform_36.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_38", type: "keeper", kit: "keeper", season: "25/26", name: "키퍼 레플리카 유니폼", price: 64000, badge: null, image: "../../img/uniform_38.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },

    // 24/25 Season
    { id: "uniform_39", type: "home", kit: "home", season: "24/25", name: "홈 레플리카 유니폼", price: 152000, badge: "BEST", image: "../../img/uniform_39.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_40", type: "away", kit: "away", season: "24/25", name: "어웨이 레플리카 유니폼", price: 112000, badge: null, image: "../../img/uniform_40.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_41", type: "third", kit: "third", season: "24/25", name: "써드 레플리카 유니폼", price: 96000, badge: null, image: "../../img/uniform_41.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_42", type: "keeper", kit: "keeper", season: "24/25", name: "키퍼 레플리카 유니폼", price: 65000, badge: null, image: "../../img/uniform_42.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },

    // 23/24 Season
    { id: "uniform_9", type: "home", kit: "home", season: "23/24", name: "홈 레플리카 유니폼", price: 155000, badge: "BEST", image: "../../img/uniform_9.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_10", type: "away", kit: "away", season: "23/24", name: "어웨이 레플리카 유니폼", price: 115000, badge: "BEST", image: "../../img/uniform_10.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_11", type: "third", kit: "third", season: "23/24", name: "써드 레플리카 유니폼", price: 98000, badge: null, image: "../../img/uniform_11.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_43", type: "keeper", kit: "keeper", season: "23/24", name: "키퍼 레플리카 유니폼", price: 67000, badge: null, image: "../../img/uniform_43.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_special", type: "special", kit: "special", season: "23/24", name: "2024 스페셜 유니폼", price: 175000, badge: "NEW", collection: "special", sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_specialB", type: "special", kit: "specialB", season: "26/27", name: "스페셜 레플리카 유니폼", price: 170000, badge: "NEW", collection: "special", sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },

    // 22/23 Season
    { id: "uniform_21", type: "home", kit: "cream", season: "22/23", name: "홈 레플리카 유니폼", price: 189000, badge: null, image: "../../img/uniform_21.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_44", type: "away", kit: "away", season: "22/23", name: "어웨이 레플리카 유니폼", price: 119000, badge: null, image: "../../img/uniform_44.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_45", type: "third", kit: "third", season: "22/23", name: "써드 레플리카 유니폼", price: 99000, badge: null, image: "../../img/uniform_45.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_46", type: "keeper", kit: "keeper", season: "22/23", name: "키퍼 레플리카 유니폼", price: 69000, badge: null, image: "../../img/uniform_46.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },

    // PAST Seasons
    { id: "uniform_19", type: "away", kit: "away", season: "15/16", name: "어웨이 레플리카 유니폼", price: 103000, badge: null, image: "../../img/uniform_19.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_20", type: "edition", kit: "retro", season: "88/89", name: "홈 레트로 유니폼", price: 85000, badge: null, image: "../../img/uniform_20.png", collection: "retro", sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_30", type: "edition", kit: "edition", season: "SPECIAL", name: "125주년 기념 유니폼", price: 350000, badge: "BEST", image: "../../img/uniform_30.png", collection: "special", sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_22", type: "home", kit: "home", season: "15/16", name: "홈 레플리카 유니폼", price: 110000, badge: null, image: "../../img/uniform_22.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_25", type: "third", kit: "third", season: "19/20", name: "써드 레플리카 유니폼", price: 75000, badge: null, image: "../../img/uniform_25.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_29", type: "edition", kit: "retro", season: "97/98", name: "어웨이 레트로 유니폼", price: 100000, badge: null, image: "../../img/uniform_29.png", collection: "retro", sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_27", type: "home", kit: "home", season: "13/14", name: "홈 레플리카 유니폼", price: 83000, badge: null, image: "../../img/uniform_27.png", collection: null, sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },

    // Popular Row
    { id: "uniform_oasis", type: "edition", kit: "cream", season: "24/25", name: "오아시스 콜라보 유니폼", price: 215000, badge: null, image: null, collection: "special", sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_retro_9899", type: "edition", kit: "retro", season: "98/99", name: "레트로 유니폼", price: 110000, badge: null, image: null, collection: "retro", sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES },
    { id: "uniform_9320", type: "edition", kit: "edition", season: "21/22", name: "9320 스페셜 유니폼", price: 350000, badge: null, image: null, collection: "special", sizes: DEFAULT_SIZES, markingOptions: DEFAULT_MARKINGS, patchOptions: DEFAULT_PATCHES }
  ];

  // Global exposure
  window.PRODUCTS = PRODUCTS;
})();
