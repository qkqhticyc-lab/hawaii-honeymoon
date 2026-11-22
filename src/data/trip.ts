// Source of truth: the itinerary supplied by the travelers. No live availability is implied.
export type Status = '확정' | '계획' | '선택' | '확인 필요';
export type Place = { name: string; query?: string; note?: string };
export const konaAddress = '75-6008 Aliʻi Drive, Kailua-Kona, HI 96740';
export const places = {
  icn: { name: 'ICN · 인천국제공항', query: 'Incheon International Airport' },
  hnl: { name: 'HNL · 호놀룰루 공항', query: 'Daniel K Inouye International Airport Honolulu' },
  ogg: { name: 'OGG · 마우이 카훌루이 공항', query: 'Kahului Airport Maui' },
  koa: { name: 'KOA · 빅아일랜드 코나 공항', query: 'Ellison Onizuka Kona International Airport' },
  grand: { name: '그랜드 와일레아', query: 'Grand Wailea 3850 Wailea Alanui Drive Wailea HI 96753' },
  kona: { name: 'Kona Shores Condominium', query: `Kona Shores Condominium, ${konaAddress}`, note: '지도는 단지 위치입니다. 객실·주차·출입은 에어비앤비 호스트 안내를 확인하세요.' },
  kalai: { name: '카라이 와이키키', query: 'Ka Lai Waikiki Beach 223 Saratoga Road Honolulu HI 96815' },
  wailea: { name: '와일레아 비치', query: 'Wailea Beach Maui' },
  haleakala: { name: '할레아칼라 정상 구역', query: 'Haleakala National Park Summit Maui' },
  molokini: { name: '몰로키니 · 해상 목적지', query: 'Molokini Crater Hawaii', note: '해상 관광 목적지. 체크인은 마알라에아 항구 Calypso Slip 76 앞이며 실제 항로는 기상에 따라 달라집니다.' },
  calypsoSlip: { name: '칼립소 · 마알라에아 항구 Slip 76', query: 'Calypso South Ferry Dock Slip 76 101 Maalaea Rd Wailuku HI 96793', note: 'Calypso, South Ferry Dock, Slip 76–78, 101 Maalaea Rd, Wailuku, HI 96793. 체크인은 Slip 76 앞.' },
  humu: { name: 'Humu', query: 'Humuhumunukunukuapuaa Grand Wailea' },
  visitor: { name: '마우나케아 방문자센터', query: 'Maunakea Visitor Information Station' },
  summit: { name: '마우나케아 정상', query: 'Maunakea Summit', note: '정상 진입 조건·도로 개방·렌터카 계약 확인 후 이동.' },
  stars: { name: '낮은 고도 별 관측 장소', note: '지정된 관측 장소 확인 필요. 임의 좌표를 사용하지 않습니다.' },
  town: { name: '카일루아코나', query: 'Kailua Kona Hawaii' },
  coffee: { name: '커피 농장', note: '방문할 농장 미정.' },
  rainbow: { name: '레인보우 폭포', query: 'Rainbow Falls Hilo Hawaii' },
  hilo: { name: '힐로', query: 'Hilo Hawaii' },
  volcano: { name: '하와이 화산국립공원', query: 'Hawaii Volcanoes National Park' },
  lava: { name: '용암동굴', note: '방문할 동굴·개방 여부 확인 필요.' },
  waikiki: { name: '와이키키', query: 'Waikiki Honolulu' },
  oahuHertz: { name: 'Hertz · 하얏트 리젠시 와이키키', query: 'Hertz 2424 Kalakaua Ave Honolulu HI 96815', note: '인수·반납 모두 같은 지점. 실제 주차장 입구는 지점 안내 확인.' },
  diamond: { name: '다이아몬드헤드 비치 전망대', query: 'Diamond Head Beach Lookout Honolulu' },
  diamondPark: { name: '다이아몬드헤드 공원 입구·트레일헤드', query: 'Diamond Head State Monument', note: '정상 등산 출발 지점. 정확한 입구·트레일헤드 좌표와 실제 승하차 지점은 확인 필요.' },
  kahala: { name: '카할라 주택가', query: 'Kahala Honolulu' },
  village: { name: '한국인 지도마을', note: '제공받은 투어 안내의 명칭. 정확한 장소는 운영사에 확인 필요.' },
  halona: { name: '할로나 블로우홀', query: 'Halona Blowhole Lookout Oahu' },
  sandy: { name: '샌디비치', query: 'Sandy Beach Oahu' },
  macadamia: { name: '마카다미아 농장', note: '투어 운영사에 농장명 확인 필요.' },
  chinaman: { name: '중국인 모자섬 전망', query: 'Mokolii Oahu', note: '섬 검색입니다. 투어의 실제 정차 위치는 확인 필요.' },
  lunch: { name: '투어 점심 장소', note: '자유식 · 위치 미정.' },
  sunset: { name: '선셋비치', query: 'Sunset Beach North Shore Oahu' },
  dole: { name: '돌 플랜테이션', query: 'Dole Plantation Oahu' },
  outlet: { name: '와이켈레 아울렛', query: 'Waikele Premium Outlets' },
  hanauma: { name: '하나우마베이', query: 'Hanauma Bay Oahu' },
  photo: { name: '카카아코 워터프런트파크', query: 'Kakaako Waterfront Park Honolulu', note: '알로하 선셋 A 상품 안내상의 촬영지 · 실제 촬영 구역은 작가 안내 확인.' },
  orchids: { name: '할레쿨라니 오키즈', query: 'Orchids Halekulani Honolulu' },
} satisfies Record<string, Place>;
export type PlaceId = keyof typeof places;
export type Stay = { id: 'grand' | 'kona' | 'kalai'; name: string; island: string; checkIn: string; checkOut: string; nights: number; room: string; location: string; hours: string; notes: string[]; status: Status };
export const stays: Stay[] = [
  { id: 'grand', name: 'Grand Wailea, A Waldorf Astoria Resort', island: '마우이', checkIn: '2026-12-12', checkOut: '2026-12-17', nights: 5, room: '성인 2명 · 기본 객실 · 포인트 숙박', location: '마우이 남부 와일레아 · 해변과 리조트 휴양 중심 지역', hours: '예약 당시 체크인 16:00 / 체크아웃 11:00 안내', notes: ['3850 Wailea Alanui Drive, Wailea, HI 96753', '객실 업그레이드는 확정되지 않았습니다.'], status: '확정' },
  { id: 'kona', name: places.kona.name, island: '빅아일랜드', checkIn: '2026-12-17', checkOut: '2026-12-21', nights: 4, room: '성인 2명 · 에어비앤비', location: konaAddress, hours: '예약 당시 체크인 16:00 이후 / 체크아웃 시각 확인 필요', notes: ['세대 번호·주차·출입 방법은 에어비앤비 호스트 안내 확인'], status: '확정' },
  { id: 'kalai', name: 'Ka Laʻi Waikiki Beach, LXR Hotels & Resorts', island: '오아후', checkIn: '2026-12-21', checkOut: '2026-12-25', nights: 4, room: '성인 2명 · 일반 객실', location: '와이키키 서쪽 · 해변·식당·쇼핑에 접근하기 편한 위치', hours: '예약 당시 체크인 16:00 / 체크아웃 12:00 안내', notes: ['223 Saratoga Road, Honolulu, HI 96815', '취사 가능 범위·조리 비품 확인 필요. 스위트 또는 풀 키친 보장 없음.'], status: '확정' },
];
export type Flight = { id: string; airline: string; from: PlaceId; to: PlaceId; departure: string; arrival: string; departureZone: 'Asia/Seoul' | 'Pacific/Honolulu'; arrivalZone: 'Asia/Seoul' | 'Pacific/Honolulu'; duration: string; status: Status; notes: string[] };
export const flightNotice = '모든 항공 정보는 제공된 예약 캡처 기준이며 최신 운항 변경은 미확인입니다. 출발 전 재확인하세요.';
export const flights: Flight[] = [
  { id: 'KE053', airline: '대한항공', from: 'icn', to: 'hnl', departure: '2026-12-12T20:50:00+09:00', arrival: '2026-12-12T09:40:00-10:00', departureZone: 'Asia/Seoul', arrivalZone: 'Pacific/Honolulu', duration: '7시간 50분', status: '확정', notes: ['출발·도착 현지 날짜는 모두 12/12입니다.'] },
  { id: 'AS1096', airline: 'Alaska Airlines (예약 화면 기준)', from: 'hnl', to: 'ogg', departure: '2026-12-12T12:07:00-10:00', arrival: '2026-12-12T12:52:00-10:00', departureZone: 'Pacific/Honolulu', arrivalZone: 'Pacific/Honolulu', duration: '45분', status: '확정', notes: ['국제선과 별도 발권 · 예약상 환승 간격 2시간 27분', '입국 후 수하물 수거·재위탁, 위탁수하물 연결과 체크인 마감 확인 필요. 별도 발권 연결 보호는 보장되지 않습니다.'] },
  { id: 'WN2618', airline: 'Southwest', from: 'ogg', to: 'koa', departure: '2026-12-17T13:35:00-10:00', arrival: '2026-12-17T14:15:00-10:00', departureZone: 'Pacific/Honolulu', arrivalZone: 'Pacific/Honolulu', duration: '40분', status: '확정', notes: [] },
  { id: 'WN2269', airline: 'Southwest', from: 'koa', to: 'hnl', departure: '2026-12-21T15:40:00-10:00', arrival: '2026-12-21T16:30:00-10:00', departureZone: 'Pacific/Honolulu', arrivalZone: 'Pacific/Honolulu', duration: '50분', status: '확정', notes: [] },
  { id: 'KE052', airline: '대한항공', from: 'hnl', to: 'icn', departure: '2026-12-25T14:25:00-10:00', arrival: '2026-12-26T20:20:00+09:00', departureZone: 'Pacific/Honolulu', arrivalZone: 'Asia/Seoul', duration: '10시간 55분', status: '확정', notes: ['한국 도착은 다음 날 12/26입니다.'] },
];
const konaRental = {
  vehicle: 'Hertz Jeep Wrangler · Jeep 4x4 Guaranteed (V0)',
  pickup: '15:00 · 예약',
  dropoff: '13:00 · 예약',
  office: 'KOA Hertz (Kona Keahole Airport) · 73-104 Aulepe Street, Kailua-Kona, HI 96740',
  hours: '예약 안내 기준 영업시간 · 매일 05:00~22:30',
  price: '예약 총액 US$337.76 · 4일',
  doors: '예약 표기 2도어/4도어 · 실제 배정 미확정',
};
const konaRentalMap = { label: 'KOA Hertz 영업소 지도', url: 'https://www.google.com/maps/search/?api=1&query=Hertz+73-104+Aulepe+Street+Kailua-Kona+HI+96740' };
const oahuRental = {
  vehicle: 'Ford Mustang Convertible · Medium Convertible (U0)',
  detail: '12/22 09:00 인수 → 12/23 13:00 반납 · 하와이 현지시간',
  office: '인수·반납: 하얏트 리젠시 와이키키 비치 Hertz · 2424 Kalākaua Ave, Honolulu',
  price: '예약 총액 US$101.60',
  hours: '예약 안내 기준 지점 영업시간 매일 08:00~16:00',
};
const hanaTaxi = {
  arrivalTime: '16:30 · 예약상 항공 도착 기준',
  departureTime: '11:00 · 예약 픽업',
  arrivalNotes: [
    '하나택시 공항 → 카라이 · 성인 2인 예약 확정. WN2269 도착편으로 등록.',
    '예약표의 16:30은 항공 도착 시각. 실제 승차는 수하물 수령 후 연락·배차 안내에 따라 진행.',
    '사우스웨스트 등 하와이안 외 국내선은 예약 메일상 PRE ARRANGED 3 또는 5 안내. 정확한 승차 구역은 짐을 찾은 뒤 하나택시에 확인.',
    '픽업 시 예약 확인 메일 제시. 예약 메일 안내 기준 와이키키 구간 현금 US$35.',
  ],
  departureNotes: [
    '하나택시 카라이 → 호놀룰루 공항 · 대한항공 출국장 하차 · 성인 2인 예약 확정.',
    '10:50~10:55 로비 대기 목표. 예약 확인 메일 준비.',
    'KE052 출발 14:25. 공항 도착 시각은 교통 상황에 따른 예상이며 픽업 예약과 별개입니다.',
  ],
};
export const transport = [
  { title: '마우이 · Hertz K5 또는 동급', status: '확정' as Status, detail: 'OGG 인수 12/12 14:00 → 반납 12/17 11:30 · D0 / SCAR', notes: ['과거 예약 확인 예상 총액 US$218.50 · 현장 후불 (실시간 판매가 아님)', '28인치 1개 + 26인치 1개 캐리어', '기존 더 비싼 예약의 중복 취소 여부 확인 필요'] },
  { title: `빅아일랜드 · ${konaRental.vehicle}`, status: '확정' as Status, detail: 'KOA Hertz 인수 12/17 15:00 → 같은 지점 반납 12/21 13:00 · 하와이 현지시간', notes: [konaRental.price, konaRental.office, konaRental.hours, konaRental.doors, '마우나케아 정상 구간 운행 허용과 보험·면책 범위는 별도 확인 필요'] },
  { title: '오아후 · 12/24 등산 택시', status: '계획' as Status, detail: '12/24 등산 택시 왕복 계획', notes: ['택시 또는 차량 호출로 공원 왕복 계획 · 입장권 2인 미예약'] },
  { title: `오아후 · Hertz ${oahuRental.vehicle}`, status: '확정' as Status, detail: oahuRental.detail, notes: [oahuRental.office, oahuRental.price, oahuRental.hours, '12/22 카라이 야간 주차 위치·비용 확인. 12/23 하나우마베이 방문 후 반납 계획.'] },
  { title: '오아후 · 하나택시 공항 왕복', status: '확정' as Status, detail: '12/21 HNL → 카라이 (WN2269 16:30 도착 기준) / 12/25 11:00 카라이 → HNL · 하와이 현지시간', notes: [...hanaTaxi.arrivalNotes, ...hanaTaxi.departureNotes] },
];
export type ReferenceLink = { label: string; url: string };
const calypsoLink: ReferenceLink = { label: '칼립소 공식 집결지·지도 안내', url: 'https://calypsomaui.com/cruises/molokini-crater-snorkeling-tour/' };
const hanaumaLink: ReferenceLink = { label: '하나우마베이 공식 예약', url: 'https://pros.hnl.info/hanauma-bay' };
const diamondHeadLink: ReferenceLink = { label: '다이아몬드헤드 공식 예약 안내', url: 'https://gostateparks.hawaii.gov/diamondhead/about' };
const sunsetLink: ReferenceLink = { label: '호놀룰루 2026년 12월 일몰 참고', url: 'https://www.timeanddate.com/sun/usa/honolulu?month=12&year=2026' };
const photoLinks: ReferenceLink[] = [
  { label: '카카아코 워터프런트파크 지도 검색', url: 'https://www.google.com/maps/search/?api=1&query=Kakaako%20Waterfront%20Park%20Honolulu' },
  sunsetLink,
];
const photoPickup = '16:45 · 픽업 예약';
const photoBooking = '와이키키스튜디오 알로하 선셋 A · 2인 확정';
const photoNotes = [
  `${photoBooking}. 하와이 현지시간 16:45 카라이 LXR 픽업 · 실제 촬영 시작 시각은 작가 안내 확인.`,
  '작가가 전날 카카오톡으로 연락 예정. 교통 상황에 따라 픽업 차량이 5~10분 늦을 수 있습니다.',
  '상품 안내 기준 카카아코 워터프런트파크 · 이동 포함 약 90분. 현장 결제 US$320 · 작가 팁 별도.',
  '12/23 호놀룰루 일몰 약 17:55는 참고 시각. 종료 시각과 복귀 교통은 작가와 확인.',
];
const hanaumaNote = '12/23 입장권 2인 미예약. 예약 오픈 하와이 12/21 07:00 = 한국 12/22 02:00. 08:00 전후 입장은 목표이며 실제 예약 슬롯에 따라 조정합니다. 입장 예약에 주차 자리는 포함되지 않습니다.';
const oahuHertzLink: ReferenceLink = { label: 'Hertz 와이키키 지점 안내', url: 'https://www.hertz.com/us/en/location/unitedstates/hawaii/honolulu/hnlc10' };
const diamondHeadNote = '12/24 등산용 입장권 2인 미예약. 방문 30일 전인 하와이 11/24부터 예약 화면 확인. 정확한 오픈 시각은 확인 필요. 08:00~10:00는 목표이며 실제 예약 슬롯에 따라 조정합니다.';
export type Event = { time: string; title: string; place: PlaceId; status: Status; notes: string[]; links?: ReferenceLink[]; milestone?: string; flightId?: string; kind?: '예비' };
export type Route = { mode: '도보' | '차량' | '비행기' | '투어 차량' | '한인택시' | '보트' | '교통편 미정'; stops: PlaceId[]; note?: string };
export type Day = { date: string; island: string; title: string; intro: string; departureStay?: Stay['id']; events: Event[]; routes: Route[]; alert?: string };
const e = (time: string, title: string, place: PlaceId, status: Status = '계획', notes: string[] = [], extra: Partial<Event> = {}): Event => ({ time, title, place, status, notes, ...extra });
const f = (id: string): Event => { const flight = flights.find(x => x.id === id)!; return e('항공 예약 시각', `${id} · ${places[flight.from].name} → ${places[flight.to].name}`, flight.to, '확정', flight.notes, { flightId: id }); };
export const days: Day[] = [
  { date: '2026-12-12', island: '한국 → 마우이', title: '알로하, 우리의 첫날', intro: '한국 출발 · 호놀룰루 환승 · 마우이 도착. 오늘은 이동과 휴식에 집중해요.',
    alert: 'HNL 예약상 09:40 도착 → 12:07 출발 · 환승 간격 2시간 27분. 별도 발권이므로 입국·수하물 재위탁·체크인 마감을 확인하세요.',
    events: [
      f('KE053'),
      e('09:40 도착 → 12:07 출발 · 예약상 환승 2시간 27분', '미국 입국 · 수하물 처리', 'hnl', '확인 필요', ['국제선과 별도 발권. 위탁수하물 연결 및 입국 후 수거·재위탁 절차와 체크인 마감 확인 필요. 연결 보호는 보장되지 않습니다.']),
      f('AS1096'),
      e('14:00 · 예약', 'Hertz 차량 인수', 'ogg', '확정', ['Kia K5 또는 동급 · 기존 예약 중복 취소 확인']),
      e('오후 · 계획', '그랜드 와일레아로 이동', 'grand', '계획', ['체크인 전 도착하면 짐 보관']),
      e('16:00 이후 · 예약 안내', '체크인', 'grand', '확정', ['숙박 예약 확정. 도착 후 충분히 쉬어요.']),
      e('18:00 전후 · 목표', '저녁 · 충분한 휴식', 'grand'),
    ], routes: [{ mode: '비행기', stops: ['icn', 'hnl', 'ogg'] }, { mode: '차량', stops: ['ogg', 'grand'] }] },
  { date: '2026-12-13', island: '마우이', title: '느긋하게, 와일레아', intro: '수영장과 바다 사이. 리조트에서 천천히 보내는 하루.', events: [
      e('07:30~08:00 · 예약', '그랜드 와일레아 무료 스노클링 데모', 'grand', '확정', ['무료 · 성인 2명', '07:15까지 Grand Wailea Scuba Pool 도착. 수영장 장비 사용 및 안전 연습.', '리조트 수영장 데모이며 바다 스노클링·12/15 몰로키니 투어와 별도입니다.']),
      e('08:30 전후 · 목표', '조식 · 리조트 수영장', 'grand'),
      e('14:00~16:00 · 목표', '와일레아 비치 · 해안 산책', 'wailea'),
      e('18:00 전후 · 목표', '저녁 식사 · 일찍 잠들기', 'grand', '계획', ['다음 날 할레아칼라 새벽 출발을 준비해요.']),
    ], routes: [{ mode: '도보', stops: ['grand', 'wailea', 'grand'] }] },
  { date: '2026-12-14', island: '마우이', title: '구름 위에서 맞는 아침', intro: '할레아칼라 일출을 함께 보고, 오후는 온전히 쉬어요.', alert: '03:00~07:00는 예약 입장 구간입니다. 03:00 정각 도착 의무가 아닙니다.', events: [
      e('03:30~04:00 · 목표', '호텔 출발 · 정상 구역 이동', 'grand', '계획', ['정확한 일출 시각과 이동 여건을 확인해 실제 출발 시각을 조정합니다.']),
      e('03:00~07:00 · 예약 입장 구간', 'Haleakala Sunrise – Summit', 'haleakala', '확정', ['12/14 차량 1대 예약', '예약 확인서와 예약자 사진 신분증 준비', '일출 예약비와 공원 입장료는 별도'], { milestone: '할레아칼라 일출' }),
      e('09:30~10:30 · 예상', '호텔로 복귀 · 식사', 'grand'),
      e('오후 · 계획', '휴식 · 가벼운 식사', 'grand'),
    ], routes: [{ mode: '차량', stops: ['grand', 'haleakala', 'grand'] }] },
  { date: '2026-12-15', island: '마우이', title: '몰로키니의 푸른 바다', intro: '칼립소호 몰로키니 & 터틀타운 스노클링 · 성인 2인 확정. 투어 후에는 리조트에서 쉬어요.', events: [
      e('06:25~06:30 · 도착 목표', '마알라에아 항구 주차장 도착', 'calypsoSlip', '계획', ['주차 후 Slip 76 앞 체크인 장소까지 이동할 여유를 둡니다. 주차비 별도.']),
      e('06:45까지 · 예약 체크인', '마알라에아 항구 Slip 76 앞 체크인', 'calypsoSlip', '확정', ['Calypso, South Ferry Dock, Slip 76–78, 101 Maalaea Rd, Wailuku, HI 96793. 체크인은 Slip 76 앞.', '모바일 바우처 제시. 수영복·수건·신분증 준비.'], { links: [calypsoLink] }),
      e('07:30 · 예약 출항', '칼립소호 몰로키니 & 터틀타운 스노클링 · 성인 2인 확정', 'calypsoSlip', '확정', ['조식·중식과 필수 안전용품 포함. 호텔 픽업·주차비·팁 별도.', '기상에 따라 코스가 변경될 수 있고 고래 목격은 보장되지 않습니다.', '무료 취소 마감 · 하와이 12/14 07:30 전 = 한국 12/15 02:30 전.', '이번 예약 기준 취소 조건입니다. 실제 결제 금액과 확정 귀항 시각은 자료 미확인.'], { links: [calypsoLink], milestone: '칼립소 몰로키니 & 터틀타운' }),
      e('투어 후 · 계획', '호텔 복귀 · 식사', 'grand'),
      e('14:00 이후 · 오후 휴식 목표', '리조트에서 휴식', 'grand', '계획', ['투어 후 리조트에 복귀한 뒤 휴식합니다. 복귀 시각에 따라 조정합니다.']),
    ], routes: [{ mode: '차량', stops: ['grand', 'calypsoSlip', 'grand'], note: '항구 왕복 차량 이동 · 체크인은 Slip 76 앞' }, { mode: '보트', stops: ['molokini'], note: '몰로키니는 해상 목적지 참고 표시. 실제 항로를 표시하지 않으며 코스는 기상에 따라 변경될 수 있습니다.' }] },
  { date: '2026-12-16', island: '마우이', title: '마우이, 조금 더 머무르기', intro: '마지막 휴양일. 무리한 계획 없이 바다와 리조트를 즐겨요.', events: [
      e('07:00 · 예약', 'Beach Bliss Yoga', 'grand', '확정', ['무료 · 성인 2명', '집합 장소와 종료 시각은 미확인.']),
      e('08:30 전후 · 목표', '조식', 'grand'),
      e('10:00 이후 · 계획', '수영장 · 비치 · 산책', 'grand'),
      e('오후 · 선택', '문화 체험 · 스파 중 선택', 'grand', '선택', ['관심 있는 프로그램의 운영·예약 여부 확인']),
      e('저녁 · 선택', 'Humu 등에서 저녁 식사', 'humu', '선택', ['예약 완료 여부 미확인']),
      e('예비 일정', '기상 변경 시 대체 가능 여부 확인', 'grand', '선택', ['기상으로 일정이 바뀌면 운영사와 대체 가능 여부 확인. 12/16 일출 입장권·몰로키니 대체 예약은 확보되지 않았습니다.'], { kind: '예비' }),
    ], routes: [{ mode: '도보', stops: ['grand', 'wailea', 'grand'], note: 'Humu 방문은 선택 일정입니다.' }] },
  { date: '2026-12-17', island: '마우이 → 빅아일랜드', title: '다음 섬, 빅아일랜드', intro: '짐을 정리하고 코나로. 도착 후에는 장을 보고 편안히 쉬어요.', departureStay: 'grand', events: [
      e('07:00 · 선택한 시작 시각', 'Beginners Hula · 무료 입문 훌라', 'grand', '확정', ['무료 · 성인 2명 · 예약 확인 메일 발급 완료', '확인 메일에는 날짜·인원만 표시. 집합 장소와 종료 시각은 체크인 때 확인.']),
      e('오전 · 계획', '조식 · 짐 정리 · 체크아웃', 'grand', '계획', ['예약 당시 체크아웃 11:00 안내. 차량 반납에 맞춰 출발.']),
      e('09:45~10:00 · 호텔 출발 목표', '호텔 출발 · 주유 · 공항 이동', 'grand', '계획', ['11:30 OGG 차량 반납에 맞춰 이동 여건에 따라 조정합니다.']),
      e('11:30 · 예약', '주유 후 OGG Hertz 반납', 'ogg', '확정'), f('WN2618'),
      e(konaRental.pickup, '빅아일랜드 렌터카 인수', 'koa', '확정', [konaRental.vehicle, konaRental.office, konaRental.doors, '인수 시 운전면허증·신용카드·여권 지참'], { links: [konaRentalMap] }),
      e('16:00 이후 · 예약 안내', '코나 숙소 체크인', 'kona', '확정', ['주차·출입 방법 확인 필요']),
      e('저녁 · 계획', '장보기 · 식사 · 휴식', 'kona'),
    ], routes: [{ mode: '차량', stops: ['grand', 'ogg'] }, { mode: '비행기', stops: ['ogg', 'koa'] }, { mode: '차량', stops: ['koa', 'kona'], note: '15:00 KOA Hertz 인수 후 Kona Shores Condominium으로 이동' }] },
  { date: '2026-12-18', island: '빅아일랜드', title: '일몰에서 별빛까지', intro: '마우나케아 정상에서 일몰, 하산 후 낮은 고도의 지정 장소에서 별 관찰.', alert: '정상은 조건 확인 후 이동하는 계획입니다. 차량 계약·보험·도로 개방·기상을 확인하세요.', events: [
      e('오전 · 계획', '여유로운 아침 · 휴식', 'kona'),
      e('13:00 전후 · 출발 목표', '코나에서 출발', 'kona'),
      e('오후 · 계획', '방문자센터 이동 · 고도 적응', 'visitor'),
      e('일몰 전 · 계획', '조건 확인 후 정상 이동 · 일몰 관람', 'summit', '계획', ['차량·도로·기상·운행 조건 확인 필요', '정상 이동·일몰·별 관찰 시각은 기상·개방 상태·고도 적응·차량 계약을 확인한 뒤 결정합니다.', '4WD 여부만으로 렌터카 계약상 정상 운행이 허용되는 것은 아닙니다.']),
      e('하산 후 · 계획', '낮은 고도의 지정 관측 장소에서 별 관찰', 'stars', '계획', ['정상에서 밤늦게 머무르는 일정이 아닙니다. 관측 장소는 확인 필요.']),
      e('저녁 · 계획', '코나 복귀 · 휴식', 'kona'),
    ], routes: [{ mode: '차량', stops: ['kona', 'visitor', 'summit', 'stars', 'kona'], note: '조건부 이동 계획 · 별 관측 장소 미확인' }] },
  { date: '2026-12-19', island: '빅아일랜드', title: '코나의 느린 하루', intro: '카페와 바닷가 산책. 날씨에 따라 전날의 일정을 조정할 수 있는 여유.', events: [
      e('10:00~14:00 · 계획', '코나 시내 · 카페 · 바닷가 산책', 'town'),
      e('시간 미정', '커피 농장 한 곳', 'coffee', '선택'),
      e('예비 일정', '마우나케아 일정 조정 검토', 'visitor', '선택', ['전날 기상으로 방문하지 못했다면 조건을 재확인한 뒤 조정'], { kind: '예비' }),
      e('저녁 · 계획', '식사 · 휴식', 'kona'),
    ], routes: [{ mode: '차량', stops: ['kona', 'town', 'kona'], note: '시내 산책은 도보 · 커피 농장과 예비 일정은 선택' }] },
  { date: '2026-12-20', island: '빅아일랜드', title: '폭포와 화산의 섬', intro: '레인보우 폭포와 화산국립공원. 식사와 쉬는 시간을 충분히 남겨요.', alert: '운전량이 많은 날 · 주 운전자 1명. 추가 관광 없이 진행하고 실제 경로·도로·시설 개방 상태를 재확인하세요.', events: [
      e('07:00 전후 · 출발 목표', '코나에서 출발', 'kona'),
      e('09:30 전후 · 목표', '힐로 인근 Rainbow Falls', 'rainbow'),
      e('이른 점심 · 목표', '힐로에서 식사 또는 간단한 보급', 'hilo'),
      e('12:30~15:30 · 방문 목표', '화산국립공원 전망대 · 짧은 산책', 'volcano', '계획', ['방문 목표 시간대이며 운영시간이 아닙니다. 도로·시설 개방 상태 확인 필요.']),
      e('당일 선택', '용암동굴', 'lava', '선택', ['개방 여부에 따라 선택. 운전 부담이 크면 용암동굴부터 생략합니다.']),
      e('18:00~19:00 · 복귀 예상', '남부 도로로 코나 복귀', 'kona', '계획', ['순환 동선 초안이며 실제 도로 경로를 계산한 결과가 아닙니다. 도로 상황·휴식에 따라 시간을 조정합니다.']),
    ], routes: [{ mode: '차량', stops: ['kona', 'rainbow', 'hilo', 'volcano', 'kona'], note: '남부 도로를 이용하는 순환 동선 초안 · 지도 검색의 추천 경로와 다를 수 있습니다.' }] },
  { date: '2026-12-21', island: '빅아일랜드 → 오아후', title: '와이키키로 향하는 날', intro: '오전은 짐 정리, 오후에는 섬 이동. 저녁은 새 숙소 근처에서 가볍게.', departureStay: 'kona', events: [
      e('오전 · 계획', '짐 정리 · 체크아웃', 'kona', '계획', ['체크아웃 시각 확인 필요']),
      e(konaRental.dropoff, '빅아일랜드 렌터카 반납', 'koa', '확정', [konaRental.office, '주유가 필요하면 반납 전에 진행. 차량 반납 후 KOA 터미널로 이동.'], { links: [konaRentalMap] }),
      e('13:30~14:00 · 터미널 도착 목표', 'KOA 터미널 도착 · 탑승 준비', 'koa'),
      f('WN2269'),
      e(hanaTaxi.arrivalTime, '하나택시 공항 픽업 · 카라이 이동', 'hnl', '확정', hanaTaxi.arrivalNotes),
      e('18:00~19:00 · 도착 예상', '카라이 도착 · 체크인', 'kalai', '확정', ['숙박 예약은 확정이며 도착 시각은 예상입니다. 예약 당시 체크인 16:00 안내. 공항에서 이동한 후 체크인.']),
      e('저녁 · 계획', '간단한 장보기 · 식사', 'kalai'),
    ], routes: [{ mode: '차량', stops: ['kona', 'koa'] }, { mode: '비행기', stops: ['koa', 'hnl'] }, { mode: '한인택시', stops: ['hnl', 'kalai'], note: '하나택시 예약 확정 · WN2269 16:30 도착 후 수하물 수령·연락. 지도는 공항 대표 위치이며 PRE ARRANGED 실제 승차 구역은 별도 확인.' }] },
  { date: '2026-12-22', island: '오아후', title: '머스탱으로, 파인애플과 쇼핑', intro: '09:00 와이키키 Hertz에서 차를 받아 돌 플랜테이션과 와이켈레 아울렛을 다녀와요. 반납은 다음 날이에요.', events: [
      e('09:00 · 예약', '와이키키 Hertz 렌터카 인수', 'oahuHertz', '확정', [oahuRental.vehicle, oahuRental.office, oahuRental.price, oahuRental.hours], { links: [oahuHertzLink] }),
      e('10:00~11:45 · 목표', '돌 플랜테이션', 'dole', '계획', ['운영시간·방문 조건 확인 필요. 파인애플 열차는 현장 상황에 따라 선택합니다. 목표 시간대를 영업시간으로 해석하지 않습니다.']),
      e('12:15~15:30 · 목표', '와이켈레 프리미엄 아울렛 · 점심·쇼핑', 'outlet', '계획', ['운영시간 확인 필요. 점심과 쇼핑을 함께 계획합니다.']),
      e('15:45 전후 · 출발 목표', '아울렛에서 출발', 'outlet'),
      e('16:45~17:15 · 복귀 목표', '카라이 복귀 · 야간 주차', 'kalai', '계획', ['호텔 주차 위치와 1박 요금 확인. 렌터카 반납은 12/23 13:00 예약.']),
      e('저녁 · 계획', '식사 · 휴식', 'kalai'),
    ], routes: [{ mode: '도보', stops: ['kalai', 'oahuHertz'], note: '09:00 렌터카 인수' }, { mode: '차량', stops: ['oahuHertz', 'dole', 'outlet', 'kalai'], note: '렌터카로 방문 후 카라이 복귀 · 다음 날 반납' }] },
  { date: '2026-12-23', island: '오아후', title: '하나우마베이와 석양의 우리', intro: '오전에 렌터카로 하나우마베이를 다녀온 뒤 13:00 Hertz 반납. 16:45 카라이에서 커플 선셋 스냅 픽업이에요.', events: [
      e('07:15 전후 · 출발 목표', '카라이에서 렌터카로 출발', 'kalai', '계획', ['입장 슬롯과 주차 상황에 맞춰 출발 시각 조정.']),
      e('08:00 전후 · 입장 목표', '하나우마베이 스노클링', 'hanauma', '계획', [hanaumaNote], { links: [hanaumaLink] }),
      e('11:15 전후 · 출발 목표', '하나우마베이에서 출발', 'hanauma'),
      e('복귀 중 · 당일 선택', '할로나 블로우홀 또는 샌디비치 한 곳', 'halona', '선택', ['13:00 차량 반납에 여유가 있을 때만 한 곳 선택. 기본 지도 동선에는 포함하지 않습니다.']),
      e('12:30 전후 · 지점 도착 목표', '주유 후 Hertz 지점 이동', 'oahuHertz', '계획', ['주유는 렌터카 계약 조건에 맞춰 진행.']),
      e('13:00 · 예약', '와이키키 Hertz 렌터카 반납', 'oahuHertz', '확정', [oahuRental.office, '반납 후 카라이로 도보 복귀 계획.'], { links: [oahuHertzLink] }),
      e('반납 후~16:15 · 계획', '카라이 복귀 · 점심 · 샤워 · 촬영 준비', 'kalai'),
      e(photoPickup, '커플 선셋 스냅 · 카라이 픽업', 'kalai', '확정', photoNotes, { links: photoLinks, milestone: '알로하 선셋 A · 커플 스냅' }),
      e('저녁 · 계획', '저녁 식사', 'kalai'),
    ], routes: [
      { mode: '차량', stops: ['kalai', 'hanauma', 'oahuHertz'], note: '하나우마베이 렌터카 이동 계획 · 13:00 Hertz 반납 예약' },
      { mode: '도보', stops: ['oahuHertz', 'kalai'], note: '차량 반납 후 호텔 복귀' },
      { mode: '차량', stops: ['kalai', 'photo'], note: '16:45 카라이에서 스튜디오 픽업 · 촬영지는 상품 안내 기준 · 복귀 교통은 작가에게 확인' },
    ] },
  { date: '2026-12-24', island: '오아후', title: '정상에서 시작하는 크리스마스이브', intro: '오전 다이아몬드헤드 정상 등산을 계획하고, 충분히 쉰 뒤 오키즈에서 저녁을 함께해요.', events: [
      e('07:30 전후 · 출발 목표', '카라이에서 택시 또는 차량 호출로 출발', 'kalai'),
      e('08:00~10:00 · 목표', 'Diamond Head State Monument 입장 · 정상 등산', 'diamondPark', '계획', [diamondHeadNote, '운영시간·입장 조건·정확한 입구·트레일헤드 좌표와 승하차 지점 확인 필요.'], { links: [diamondHeadLink] }),
      e('10:30~11:00 · 복귀 목표', '카라이 복귀', 'kalai'),
      e('오전 늦게~오후 · 계획', '와이키키 산책 · 점심 · 휴식', 'waikiki'),
      e('16:30 · 호텔 출발 목표', '호텔에서 오키즈로 도보 출발', 'kalai'),
      e('16:45 · 예약', 'Halekulani Orchids · 크리스마스이브 뷔페', 'orchids', '확정', ['2인 예약 · 사용자가 확인한 총액 약 US$374'], { milestone: '오키즈 · 2인 예약' }),
      e('저녁 · 계획', '산책 · 귀국 짐 정리', 'kalai'),
    ], routes: [{ mode: '차량', stops: ['kalai', 'diamondPark', 'kalai'], note: '택시 또는 차량 호출 왕복 계획 · 공원 입구·트레일헤드의 정확한 위치 확인 필요' }, { mode: '도보', stops: ['kalai', 'orchids', 'kalai'], note: '16:30 호텔 출발 목표 · 16:45 오키즈 예약' }] },
  { date: '2026-12-25', island: '오아후 → 한국', title: '마할로, 하와이', intro: '11:00 하나택시 호텔 픽업, 14:25 대한항공 출발. 오늘 밤은 귀국 항공편에서 보내요.', departureStay: 'kalai', events: [
    e('오전 · 계획', '조식 · 짐 정리 · 체크아웃', 'kalai'),
    e('10:50~10:55 · 대기 목표', '카라이 로비에서 픽업 대기', 'kalai'),
    e(hanaTaxi.departureTime, '하나택시 호텔 픽업 · 공항 이동', 'kalai', '확정', hanaTaxi.departureNotes),
    e('11:30~12:00 · 도착 예상', '호놀룰루 공항 도착 · 대한항공 탑승 수속', 'hnl', '계획', ['이동 시간은 교통 상황에 따라 달라집니다.']),
    f('KE052'),
  ], routes: [{ mode: '한인택시', stops: ['kalai', 'hnl'], note: '하나택시 예약 확정 · 11:00 호텔 픽업 → 대한항공 출국장. 지도는 공항 대표 위치이며 실제 하차는 기사 안내 확인.' }, { mode: '비행기', stops: ['hnl', 'icn'] }] },
  { date: '2026-12-26', island: '한국', title: '우리의 여행, 오래도록', intro: '한국시간 20:20 인천 도착. 두 사람의 하와이 여행을 마무리해요.', events: [e('20:20 · 한국시간 / 예약', 'KE052 인천 도착 · 여행 종료', 'icn', '확정', ['출발은 12/25 14:25 하와이시간. 최신 운항 변경은 출발 전 재확인.'])], routes: [{ mode: '비행기', stops: ['hnl', 'icn'], note: '12/25 하와이 출발 → 12/26 한국 도착' }] },
];
export type Task = { id: string; title: string; done: boolean; date: string; place: PlaceId; note?: string; links?: ReferenceLink[] };
const t = (id: string, title: string, date: string, place: PlaceId, done = false, note?: string, links?: ReferenceLink[]): Task => ({ id, title, date: `2026-12-${date}`, place, done, note, links });
export const tasks: Task[] = [
  t('bookings', '항공·숙소 예약', '12', 'grand', true, '전체 여행 12/12~12/26 · 항공 5편 / 숙소 3곳'),
  t('k5', '마우이 K5 예약', '12', 'ogg', true, '12/12 인수 → 12/17 반납'),
  t('sunrise', '할레아칼라 일출 예약', '14', 'haleakala', true, '03:00~07:00 입장 · 차량 1대'),
  t('orchids', '오키즈 예약', '24', 'orchids', true, '16:45 · 2인'),
  t('esta', '두 사람 ESTA 최종 승인 확인', '12', 'icn'),
  t('transfer', '별도 발권 환승·수하물 처리 확인', '12', 'hnl'),
  t('molokini', '몰로키니 예약', '15', 'calypsoSlip', true, '칼립소호 몰로키니 & 터틀타운 스노클링 · 성인 2인 확정. 06:45까지 Slip 76 앞 체크인, 07:30 출항. 무료 취소 마감 하와이 12/14 07:30 전 = 한국 12/15 02:30 전.', [calypsoLink]),
  t('jeep', '빅아일랜드 렌터카 예약 완료', '17', 'koa', true, `${konaRental.vehicle} · 12/17 15:00 인수 → 12/21 13:00 반납 (하와이 현지시간, 모두 KOA Hertz). ${konaRental.price}.`, [konaRentalMap]),
  t('maunakea', '마우나케아 차량·도로·보험 조건 확인', '18', 'summit'),
  t('oahu-day-rental', '오아후 Hertz 렌터카 예약', '22', 'oahuHertz', true, `${oahuRental.detail}. ${oahuRental.price}. 카라이 야간 주차 위치·비용 확인.`, [oahuHertzLink]),
  t('diamond-head-entry', '12/24 다이아몬드헤드 입장권 2인', '24', 'diamondPark', false, diamondHeadNote, [diamondHeadLink]),
  t('hanauma', '하나우마베이 입장권 2인 예약', '23', 'hanauma', false, hanaumaNote, [hanaumaLink]),
  t('photo', '커플 스냅 예약', '23', 'kalai', true, photoNotes.join(' '), photoLinks),
  t('diamond', '힐튼 다이아 확보·계정 반영 확인', '12', 'grand', true, '패스트트랙으로 Hilton Honors Diamond 획득, 앱 반영 확인.'),
  t('email', '그랜드 와일레아 허니문·객실 선호 메일', '12', 'grand', true, '메일 발송 완료, 호텔 회신·객실 업그레이드는 미확인. 훌라 문의는 포함하지 않았습니다. 마지막 확인 12/5~8은 추천 계획입니다.'),
  t('email-kalai', '카라이 허니문·객실 선호 메일', '21', 'kalai', false, '사전 요청 11/23~30, 마지막 확인 12/14~17은 추천 계획이며 발송 완료로 확인되지 않았습니다.'),
  t('credit', '호텔별 2인 식음료 크레딧 조건 확인', '21', 'kalai', false, '그랜드 와일레아와 카라이 각각 확인'),
  t('entry', '코나 숙소 주차·출입 정보', '17', 'kona'),
  t('taxi', '공항 한인택시 예약', '21', 'hnl', true, '하나택시 왕복 성인 2인 확정 · 12/21 WN2269 16:30 도착 기준 HNL → 카라이, 수하물 수령 후 연락 / 12/25 11:00 카라이 → HNL 픽업. 예약 메일 지참.'),
  t('insurance', '여행자보험', '12', 'icn'),
  t('license', '국제운전면허증·국내 면허 원본', '12', 'ogg'),
  t('sim', '유심 / eSIM', '12', 'hnl'),
  t('gear', '방한복·장갑·물놀이 장비', '14', 'haleakala', false, '할레아칼라·마우나케아 / 몰로키니·하나우마베이'),
  t('offline', '예약 확인서·지도 오프라인 저장', '12', 'icn'),
  t('cancel', '중복 렌터카·불필요한 식당 예약 취소 확인', '12', 'ogg'),
];
