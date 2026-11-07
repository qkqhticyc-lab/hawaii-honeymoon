// Source of truth: the itinerary supplied by the travelers. No live availability is implied.
export type Status = '확정' | '계획' | '선택' | '확인 필요';
export type Place = { name: string; query?: string; note?: string };
export const places = {
  icn: { name: 'ICN · 인천국제공항', query: 'Incheon International Airport' },
  hnl: { name: 'HNL · 호놀룰루 공항', query: 'Daniel K Inouye International Airport Honolulu' },
  ogg: { name: 'OGG · 마우이 카훌루이 공항', query: 'Kahului Airport Maui' },
  koa: { name: 'KOA · 빅아일랜드 코나 공항', query: 'Ellison Onizuka Kona International Airport' },
  grand: { name: '그랜드 와일레아', query: 'Grand Wailea 3850 Wailea Alanui Drive Wailea HI 96753' },
  kona: { name: '코나 에어비앤비', note: '정확한 숙소 위치 미확인. Aliʻi Drive의 Green Flash Coffee 인근.' },
  kalai: { name: '카라이 와이키키', query: 'Ka Lai Waikiki Beach 223 Saratoga Road Honolulu HI 96815' },
  wailea: { name: '와일레아 비치', query: 'Wailea Beach Maui' },
  haleakala: { name: '할레아칼라 정상 구역', query: 'Haleakala National Park Summit Maui' },
  molokini: { name: '몰로키니', query: 'Molokini Crater Hawaii', note: '해상 목적지 검색입니다. 실제 출항지·집합 장소는 미확인.' },
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
  diamond: { name: '다이아몬드헤드 비치 전망대', query: 'Diamond Head Beach Lookout Honolulu' },
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
  photo: { name: '커플 스냅 촬영 장소', note: '장소·작가·촬영 시각 미확정.' },
  orchids: { name: '할레쿨라니 오키즈', query: 'Orchids Halekulani Honolulu' },
} satisfies Record<string, Place>;
export type PlaceId = keyof typeof places;
export type Stay = { id: 'grand' | 'kona' | 'kalai'; name: string; island: string; checkIn: string; checkOut: string; nights: number; room: string; location: string; hours: string; notes: string[]; status: Status };
export const stays: Stay[] = [
  { id: 'grand', name: 'Grand Wailea, A Waldorf Astoria Resort', island: '마우이', checkIn: '2026-12-12', checkOut: '2026-12-17', nights: 5, room: '성인 2명 · 기본 객실 · 포인트 숙박', location: '마우이 남부 와일레아 · 해변과 리조트 휴양 중심 지역', hours: '예약 당시 체크인 16:00 / 체크아웃 11:00 안내', notes: ['3850 Wailea Alanui Drive, Wailea, HI 96753', '객실 업그레이드는 확정되지 않았습니다.'], status: '확정' },
  { id: 'kona', name: '코나 에어비앤비', island: '빅아일랜드', checkIn: '2026-12-17', checkOut: '2026-12-21', nights: 4, room: '성인 2명', location: '서쪽 카일루아코나 · Aliʻi Drive의 Green Flash Coffee 인근', hours: '예약 당시 체크인 16:00 이후 / 체크아웃 시각 확인 필요', notes: ['정확한 숙소명·주소·좌표 미확인', '주차·출입 방법 확인 필요'], status: '확정' },
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
export const transport = [
  { title: '마우이 · Hertz K5 또는 동급', status: '확정' as Status, detail: 'OGG 인수 12/12 14:00 → 반납 12/17 11:30 · D0 / SCAR', notes: ['과거 예약 확인 예상 총액 US$218.50 · 현장 후불 (실시간 판매가 아님)', '28인치 1개 + 26인치 1개 캐리어', '기존 더 비싼 예약의 중복 취소 여부 확인 필요'] },
  { title: '빅아일랜드 · Hertz Jeep Wrangler 4WD 검토', status: '확인 필요' as Status, detail: '12/17~12/21 · 예약 완료 여부 및 2도어·4도어 배정 미확인', notes: ['마우나케아 정상 구간 운행 허용, 보험·면책 범위 확인 필요', '4WD 차량이라는 사실만으로 렌터카 계약상 정상 운행이 허용되는 것은 아닙니다.'] },
  { title: '오아후 · 한인택시와 조인 투어', status: '계획' as Status, detail: '12/21·12/25 공항 한인택시 / 12/22 조인 투어 차량', notes: ['하나우마베이 교통편 미확정', '12/25 픽업 10:00~10:15경 검토, HNL 11:00 전후 도착 목표'] },
];
export type Event = { time: string; title: string; place: PlaceId; status: Status; notes: string[]; flightId?: string; kind?: '예비' };
export type Route = { mode: '도보' | '차량' | '비행기' | '투어 차량' | '한인택시' | '보트' | '교통편 미정'; stops: PlaceId[]; note?: string };
export type Day = { date: string; island: string; title: string; intro: string; departureStay?: Stay['id']; events: Event[]; routes: Route[]; alert?: string };
const e = (time: string, title: string, place: PlaceId, status: Status = '계획', notes: string[] = [], extra: Partial<Event> = {}): Event => ({ time, title, place, status, notes, ...extra });
const f = (id: string): Event => { const flight = flights.find(x => x.id === id)!; return e('항공 예약 시각', `${id} · ${places[flight.from].name} → ${places[flight.to].name}`, flight.to, '확정', flight.notes, { flightId: id }); };
export const days: Day[] = [
  { date: '2026-12-12', island: '한국 → 마우이', title: '알로하, 우리의 첫날', intro: '한국 출발 · 호놀룰루 환승 · 마우이 도착. 오늘은 이동과 휴식에 집중해요.', alert: 'HNL 별도 발권 환승 2시간 27분. 입국·수하물 재위탁·체크인 마감을 확인하세요.', events: [f('KE053'), e('환승', '미국 입국 · 수하물 처리', 'hnl', '확인 필요', ['위탁수하물 연결 및 입국 후 수거·재위탁 절차 확인 필요. 연결 보호는 보장되지 않습니다.']), f('AS1096'), e('14:00 · 예약', 'Hertz 차량 인수', 'ogg', '확정', ['Kia K5 또는 동급 · 기존 예약 중복 취소 확인']), e('오후 · 계획', '그랜드 와일레아로 이동', 'grand', '계획', ['체크인 전 도착하면 짐 보관']), e('16:00 이후 · 예약 안내', '체크인 · 저녁 · 충분한 휴식', 'grand', '확정', ['숙박 예약 확정. 식사와 휴식 시간은 자유롭게 조정합니다.'])], routes: [{ mode: '비행기', stops: ['icn', 'hnl', 'ogg'] }, { mode: '차량', stops: ['ogg', 'grand'] }] },
  { date: '2026-12-13', island: '마우이', title: '느긋하게, 와일레아', intro: '수영장과 바다 사이. 리조트에서 천천히 보내는 하루.', events: [e('07:30~08:00 · 예약', '그랜드 와일레아 무료 스노클링 데모', 'grand', '확정', ['무료 · 성인 2명', '07:15까지 Grand Wailea Scuba Pool 도착. 수영장 장비 사용 및 안전 연습.', '리조트 수영장 데모이며 바다 스노클링·12/15 몰로키니 투어와 별도입니다.']), e('오전 · 계획', '조식 · 리조트 수영장', 'grand'), e('오후 · 계획', '와일레아 비치 · 해안 산책', 'wailea'), e('이른 저녁 · 계획', '저녁 식사 · 일찍 잠들기', 'grand', '계획', ['다음 날 할레아칼라 새벽 출발을 준비해요.'])], routes: [{ mode: '도보', stops: ['grand', 'wailea', 'grand'] }] },
  { date: '2026-12-14', island: '마우이', title: '구름 위에서 맞는 아침', intro: '할레아칼라 일출을 함께 보고, 오후는 온전히 쉬어요.', alert: '03:00~07:00는 예약 입장 구간입니다. 03:00 정각 도착 의무가 아닙니다.', events: [e('새벽 · 출발 시각 미정', '호텔 출발 · 정상 구역 이동', 'grand', '계획', ['정확한 일출 시각과 호텔 출발 시각은 추후 확인']), e('03:00~07:00 · 예약 입장 구간', 'Haleakala Sunrise – Summit', 'haleakala', '확정', ['12/14 차량 1대 예약', '예약 확인서와 예약자 사진 신분증 준비', '일출 예약비와 공원 입장료는 별도']), e('일출 관람 후 · 계획', '호텔로 복귀 · 식사', 'grand'), e('오후 · 계획', '휴식 · 가벼운 식사', 'grand')], routes: [{ mode: '차량', stops: ['grand', 'haleakala', 'grand'] }] },
  { date: '2026-12-15', island: '마우이', title: '몰로키니의 푸른 바다', intro: '오전 스노클링 투어를 계획하고 있어요. 바다를 다녀온 뒤엔 휴식.', events: [e('오전 · 계획', '몰로키니 스노클링 투어', 'molokini', '계획', ['운영사·출항지·집합 시각·예약 완료 여부 미확인', '기상에 따라 코스 변경·취소 가능']), e('투어 후 · 계획', '호텔 복귀 · 식사', 'grand'), e('오후~저녁 · 계획', '리조트에서 휴식', 'grand')], routes: [{ mode: '차량', stops: ['grand'], note: '출항지 미정 · 운영사 확인 후 호텔 왕복 경로 결정' }, { mode: '보트', stops: ['molokini'], note: '해상 투어 코스는 운영사·기상에 따라 달라집니다.' }] },
  { date: '2026-12-16', island: '마우이', title: '마우이, 조금 더 머무르기', intro: '마지막 휴양일. 무리한 계획 없이 바다와 리조트를 즐겨요.', events: [e('07:00 · 예약', 'Beach Bliss Yoga', 'grand', '확정', ['무료 · 성인 2명', '집합 장소와 종료 시각은 미확인.']), e('오전 · 계획', '수영장 · 비치 · 산책', 'grand'), e('오후 · 선택', '문화 체험 · 스파 중 선택', 'grand', '선택', ['관심 있는 프로그램의 운영·예약 여부 확인']), e('저녁 · 선택', 'Humu 등에서 저녁 식사', 'humu', '선택', ['예약 완료 여부 미확인']), e('예비 일정', '일출 또는 몰로키니 일정 조정 여유', 'grand', '선택', ['예비일 일출 티켓은 확보되지 않았습니다. 변경 조건과 예약 가능 여부를 먼저 확인하세요.'], { kind: '예비' })], routes: [{ mode: '도보', stops: ['grand', 'wailea', 'grand'], note: 'Humu 방문은 선택 일정입니다.' }] },
  { date: '2026-12-17', island: '마우이 → 빅아일랜드', title: '다음 섬, 빅아일랜드', intro: '짐을 정리하고 코나로. 도착 후에는 장을 보고 편안히 쉬어요.', departureStay: 'grand', events: [e('07:00 · 선택한 시작 시각', 'Beginners Hula · 무료 입문 훌라', 'grand', '확정', ['무료 · 성인 2명 · 예약 확인 메일 발급 완료', '확인 메일에는 날짜·인원만 표시. 집합 장소와 종료 시각은 체크인 때 확인.']), e('오전 · 계획', '조식 · 짐 정리 · 체크아웃', 'grand', '계획', ['예약 당시 체크아웃 11:00 안내. 차량 반납에 맞춰 출발.']), e('11:30 · 예약', '주유 후 OGG Hertz 반납', 'ogg', '확정'), f('WN2618'), e('도착 후 · 미정', '빅아일랜드 렌터카 인수', 'koa', '확인 필요', ['Hertz Jeep Wrangler 4WD 검토 · 예약 완료 여부 미확인']), e('16:00 이후 · 예약 안내', '코나 숙소 체크인', 'kona', '확정', ['주차·출입 방법 확인 필요']), e('저녁 · 계획', '장보기 · 식사 · 휴식', 'kona')], routes: [{ mode: '차량', stops: ['grand', 'ogg'] }, { mode: '비행기', stops: ['ogg', 'koa'] }, { mode: '차량', stops: ['koa', 'kona'], note: '렌터카 예약과 숙소 주소 확인 후 경로 결정' }] },
  { date: '2026-12-18', island: '빅아일랜드', title: '일몰에서 별빛까지', intro: '마우나케아 정상에서 일몰, 하산 후 낮은 고도의 지정 장소에서 별 관찰.', alert: '정상은 조건 확인 후 이동하는 계획입니다. 차량 계약·보험·도로 개방·기상을 확인하세요.', events: [e('오전 · 계획', '여유로운 아침 · 휴식', 'kona'), e('오후 · 계획', '방문자센터 이동 · 고도 적응', 'visitor'), e('일몰 전 · 계획', '조건 확인 후 정상 이동 · 일몰 관람', 'summit', '계획', ['차량·도로·기상·운행 조건 확인 필요', '4WD 여부만으로 렌터카 계약상 정상 운행이 허용되는 것은 아닙니다.']), e('하산 후 · 계획', '낮은 고도의 지정 관측 장소에서 별 관찰', 'stars', '계획', ['정상에서 밤늦게 머무르는 일정이 아닙니다. 관측 장소는 확인 필요.']), e('저녁 · 계획', '코나 복귀 · 휴식', 'kona')], routes: [{ mode: '차량', stops: ['kona', 'visitor', 'summit', 'stars', 'kona'], note: '조건부 이동 계획 · 관측 장소와 숙소 주소 미확인' }] },
  { date: '2026-12-19', island: '빅아일랜드', title: '코나의 느린 하루', intro: '카페와 바닷가 산책. 날씨에 따라 전날의 일정을 조정할 수 있는 여유.', events: [e('오전~오후 · 계획', '코나 시내 · 카페 · 바닷가 산책', 'town'), e('시간 미정', '커피 농장 한 곳', 'coffee', '선택'), e('예비 일정', '마우나케아 일정 조정 검토', 'visitor', '선택', ['전날 기상으로 방문하지 못했다면 조건을 재확인한 뒤 조정'], { kind: '예비' }), e('저녁 · 계획', '식사 · 휴식', 'kona')], routes: [{ mode: '차량', stops: ['kona', 'town', 'kona'], note: '시내 산책은 도보 · 커피 농장과 예비 일정은 선택' }] },
  { date: '2026-12-20', island: '빅아일랜드', title: '폭포와 화산의 섬', intro: '레인보우 폭포와 화산국립공원. 식사와 쉬는 시간을 충분히 남겨요.', alert: '운전량이 많은 날 · 주 운전자 1명. 추가 관광 없이 진행하고 실제 경로·도로·시설 개방 상태를 재확인하세요.', events: [e('이른 아침 · 계획', '코나에서 출발', 'kona'), e('오전 · 계획', '힐로 인근 Rainbow Falls', 'rainbow'), e('점심 · 계획', '식사 또는 간단한 보급', 'hilo'), e('오후 · 계획', '화산국립공원 전망대 · 짧은 산책', 'volcano'), e('시간 미정', '용암동굴', 'lava', '선택', ['개방 여부에 따라 선택']), e('관람 후 · 계획', '남부 도로로 코나 복귀', 'kona', '계획', ['순환 동선 초안이며 실제 도로 경로를 계산한 결과가 아닙니다.'])], routes: [{ mode: '차량', stops: ['kona', 'rainbow', 'hilo', 'volcano', 'kona'], note: '남부 도로를 이용하는 순환 동선 초안 · 지도 검색의 추천 경로와 다를 수 있습니다.' }] },
  { date: '2026-12-21', island: '빅아일랜드 → 오아후', title: '와이키키로 향하는 날', intro: '오전은 짐 정리, 오후에는 섬 이동. 저녁은 새 숙소 근처에서 가볍게.', departureStay: 'kona', events: [e('오전 · 계획', '짐 정리 · 체크아웃', 'kona', '계획', ['체크아웃 시각 확인 필요']), e('출발 전 · 계획', '주유 · 렌터카 반납 · 공항 이동', 'koa', '확인 필요', ['반납 조건과 시각 미확인']), f('WN2269'), e('도착 후 · 계획', '한인택시로 카라이 이동', 'kalai', '계획', ['공항 픽업 예약 확인 필요']), e('저녁 · 예약', '카라이 체크인', 'kalai', '확정', ['예약 당시 체크인 16:00 안내. 공항에서 이동한 후 체크인.']), e('저녁 · 계획', '간단한 장보기 · 식사', 'kalai')], routes: [{ mode: '차량', stops: ['kona', 'koa'] }, { mode: '비행기', stops: ['koa', 'hnl'] }, { mode: '한인택시', stops: ['hnl', 'kalai'] }] },
  { date: '2026-12-22', island: '오아후', title: '함께 돌아보는 오아후', intro: '한국인 스태프와 다른 팀이 함께하는 다인승 차량 조인 투어.', events: [e('약 09:00 · 안내 / 계획', '와이키키 호텔 픽업 시작', 'kalai', '계획', ['예약 완료 여부·픽업 장소·전체 순서·체류시간·팁 확인 필요']), e('오전~오후 · 계획', '오아후 일주 조인 투어', 'waikiki', '계획', ['상세 방문 순서는 이동 경로에서 확인하세요.', '다이아몬드헤드는 해변 전망대이며 정상 등반이 아닙니다.', '선셋비치는 지명입니다. 일몰 관람 시간이 보장되지 않습니다.']), e('점심 · 계획', '자유식', 'lunch', '계획', ['점심 비용은 투어에 불포함']), e('약 17:00 · 안내 / 계획', '투어 종료 · 호텔 복귀', 'kalai'), e('저녁 · 계획', '식사 · 휴식', 'kalai')], routes: [{ mode: '투어 차량', stops: ['kalai', 'diamond', 'kahala', 'village', 'halona', 'sandy', 'macadamia', 'chinaman', 'lunch', 'sunset', 'dole', 'outlet', 'kalai'], note: '제공된 동선 초안 · 전체 순서와 정확한 정차 장소는 운영사 확인 필요' }] },
  { date: '2026-12-23', island: '오아후', title: '바다, 그리고 우리 둘', intro: '하나우마베이에서 오전을 보내고, 충분히 쉰 뒤 커플 스냅을 남겨요.', events: [e('이른 오전 · 계획', '하나우마베이 스노클링', 'hanauma', '계획', ['입장·왕복 교통편·예약 완료 여부 미확인']), e('점심 전후 · 목표', '호텔 복귀 · 점심', 'kalai', '계획', ['점심 전후 복귀를 목표로 교통편 선정']), e('오후 · 계획', '충분한 휴식 · 샤워 · 촬영 준비', 'kalai'), e('늦은 오후~일몰 · 계획', '커플 스냅 촬영', 'photo', '계획', ['촬영 장소·작가·시각·예약 완료 여부 미확인']), e('저녁 · 계획', '저녁 식사', 'kalai')], routes: [{ mode: '교통편 미정', stops: ['kalai', 'hanauma', 'kalai', 'photo', 'kalai'] }] },
  { date: '2026-12-24', island: '오아후', title: '둘만의 크리스마스이브', intro: '와이키키 산책과 휴식, 그리고 오키즈에서 함께하는 저녁.', events: [e('오전 · 계획', '와이키키 산책 · 쇼핑', 'waikiki'), e('점심 · 계획', '가벼운 점심', 'kalai'), e('오후 · 계획', '호텔 휴식 · 식사 준비', 'kalai'), e('16:30경 · 계획', '호텔에서 출발', 'kalai'), e('16:45 · 예약', 'Halekulani Orchids · 크리스마스이브 뷔페', 'orchids', '확정', ['2인 예약 · 사용자가 확인한 총액 약 US$374']), e('저녁 · 계획', '산책 · 귀국 짐 정리', 'kalai')], routes: [{ mode: '도보', stops: ['kalai', 'waikiki', 'kalai', 'orchids', 'kalai'], note: '도보 이동 계획 · 실제 경로는 지도에서 확인' }] },
  { date: '2026-12-25', island: '오아후 → 한국', title: '마할로, 하와이', intro: '관광 없이 여유 있게 공항으로. 오늘 밤은 귀국 항공편에서 보내요.', departureStay: 'kalai', events: [e('오전 · 계획', '조식 · 짐 정리 · 체크아웃', 'kalai'), e('10:00~10:15경 · 검토', '한인택시 픽업', 'kalai', '계획', ['예약 완료 여부 미확인']), e('11:00 전후 · 목표', '호놀룰루 공항 도착', 'hnl'), f('KE052')], routes: [{ mode: '한인택시', stops: ['kalai', 'hnl'] }, { mode: '비행기', stops: ['hnl', 'icn'] }] },
  { date: '2026-12-26', island: '한국', title: '우리의 여행, 오래도록', intro: '한국시간 20:20 인천 도착. 두 사람의 하와이 여행을 마무리해요.', events: [e('20:20 · 한국시간 / 예약', 'KE052 인천 도착 · 여행 종료', 'icn', '확정', ['출발은 12/25 14:25 하와이시간. 최신 운항 변경은 출발 전 재확인.'])], routes: [{ mode: '비행기', stops: ['hnl', 'icn'], note: '12/25 하와이 출발 → 12/26 한국 도착' }] },
];
export type Task = { id: string; title: string; done: boolean; date: string; place: PlaceId; note?: string };
const t = (id: string, title: string, date: string, place: PlaceId, done = false, note?: string): Task => ({ id, title, date: `2026-12-${date}`, place, done, note });
export const tasks: Task[] = [
  t('bookings', '항공·숙소 예약', '12', 'grand', true, '전체 여행 12/12~12/26 · 항공 5편 / 숙소 3곳'),
  t('k5', '마우이 K5 예약', '12', 'ogg', true, '12/12 인수 → 12/17 반납'),
  t('sunrise', '할레아칼라 일출 예약', '14', 'haleakala', true, '03:00~07:00 입장 · 차량 1대'),
  t('orchids', '오키즈 예약', '24', 'orchids', true, '16:45 · 2인'),
  t('esta', '두 사람 ESTA 최종 승인 확인', '12', 'icn'),
  t('transfer', '별도 발권 환승·수하물 처리 확인', '12', 'hnl'),
  t('molokini', '몰로키니 예약', '15', 'molokini'),
  t('jeep', '빅아일랜드 렌터카 예약 확인', '17', 'koa'),
  t('maunakea', '마우나케아 차량·도로·보험 조건 확인', '18', 'summit'),
  t('tour', '오아후 조인 투어 예약 확인', '22', 'kalai'),
  t('hanauma', '하나우마베이 입장·왕복 교통편 예약', '23', 'hanauma'),
  t('photo', '커플 스냅 예약', '23', 'photo'),
  t('diamond', '힐튼 다이아 확보·계정 반영 확인', '12', 'grand', true, '패스트트랙으로 Hilton Honors Diamond 획득, 앱 반영 확인.'),
  t('email', '그랜드 와일레아 허니문·객실 선호 메일', '12', 'grand', true, '메일 발송 완료, 호텔 회신·객실 업그레이드는 미확인. 훌라 문의는 포함하지 않았습니다. 마지막 확인 12/5~8은 추천 계획입니다.'),
  t('email-kalai', '카라이 허니문·객실 선호 메일', '21', 'kalai', false, '사전 요청 11/23~30, 마지막 확인 12/14~17은 추천 계획이며 발송 완료로 확인되지 않았습니다.'),
  t('credit', '호텔별 2인 식음료 크레딧 조건 확인', '21', 'kalai', false, '그랜드 와일레아와 카라이 각각 확인'),
  t('entry', '코나 숙소 주차·출입 정보', '17', 'kona'),
  t('taxi', '공항 한인택시 예약', '21', 'hnl', false, '12/21 공항 → 카라이 / 12/25 카라이 → 공항'),
  t('insurance', '여행자보험', '12', 'icn'),
  t('license', '국제운전면허증·국내 면허 원본', '12', 'ogg'),
  t('sim', '유심 / eSIM', '12', 'hnl'),
  t('gear', '방한복·장갑·물놀이 장비', '14', 'haleakala', false, '할레아칼라·마우나케아 / 몰로키니·하나우마베이'),
  t('offline', '예약 확인서·지도 오프라인 저장', '12', 'icn'),
  t('cancel', '중복 렌터카·불필요한 식당 예약 취소 확인', '12', 'ogg'),
];
