import type { PlaceId } from './trip';

export type MapLocation = { lat: number; lng: number; label: string; source: string };
// Coordinates are static, reviewed map references, checked 2026-11-01.
// A region/park reference is not a confirmed meeting point, entrance, or parking place.
// Unknown accommodation and tour meeting locations deliberately have no coordinates.
export const mapLocations: Partial<Record<PlaceId, MapLocation>> = {
  icn: { lat: 37.46333, lng: 126.44, label: '인천국제공항 대표 위치 · 터미널은 항공사 안내 확인', source: 'https://en.wikipedia.org/wiki/Incheon_International_Airport' },
  hnl: { lat: 21.31861, lng: -157.9225, label: '호놀룰루 공항 대표 위치 · 환승·수하물 처리 확인 필요', source: 'https://en.wikipedia.org/wiki/Daniel_K._Inouye_International_Airport' },
  ogg: { lat: 20.89861, lng: -156.43056, label: '카훌루이 공항 대표 위치 · Hertz 인수·반납 장소는 예약 안내 확인', source: 'https://en.wikipedia.org/wiki/Kahului_Airport' },
  koa: { lat: 19.73889, lng: -156.04556, label: '코나 공항 대표 위치 · 렌터카 예약·인수 장소 확인 필요', source: 'https://en.wikipedia.org/wiki/Kona_International_Airport' },
  grand: { lat: 20.681173, lng: -156.438695, label: '그랜드 와일레아 리조트 위치', source: 'https://en.wikipedia.org/wiki/Grand_Wailea_Resort' },
  kalai: { lat: 21.27917, lng: -157.83278, label: '카라이 와이키키 호텔 위치 · 투어 픽업 지점은 별도 확인', source: 'https://en.wikipedia.org/wiki/Ka_La%CA%BBi_Waik%C4%ABk%C4%AB_Beach_Hotel' },
  orchids: { lat: 21.277878, lng: -157.831931, label: '오키즈가 있는 할레쿨라니 호텔 대표 위치', source: 'https://en.wikipedia.org/wiki/Halekulani_(hotel)' },
  wailea: { lat: 20.68141, lng: -156.44334, label: '와일레아 비치 해변 구역 · 하와이 보건부 관측 지점 기준', source: 'https://www.waterqualitydata.us/provider/STORET/21HI/21HI-000691/' },
  haleakala: { lat: 20.70972, lng: -156.25333, label: '할레아칼라 정상 구역 대표 위치 · 입장·주차·관람 지점은 예약·공원 안내 확인', source: 'https://en.wikipedia.org/wiki/Haleakal%C4%81' },
  molokini: { lat: 20.63333, lng: -156.49611, label: '몰로키니 해상 목적지 · 실제 출항지·집합 장소 미확인', source: 'https://en.wikipedia.org/wiki/Molokini' },
  visitor: { lat: 19.76139, lng: -155.45611, label: '마우나케아 방문자센터 구역', source: 'https://en.wikipedia.org/wiki/Onizuka_Center_for_International_Astronomy' },
  summit: { lat: 19.82056, lng: -155.46806, label: '마우나케아 정상 구역 대표 위치 · 차량·계약·도로 조건 확인 후 이동', source: 'https://en.wikipedia.org/wiki/Mauna_Kea' },
  town: { lat: 19.65, lng: -155.99417, label: '카일루아코나 시내 대표 위치 · 에어비앤비 위치가 아닙니다.', source: 'https://en.wikipedia.org/wiki/Kailua-Kona%2C_Hawaii' },
  rainbow: { lat: 19.71917, lng: -155.10944, label: '레인보우 폭포 구역', source: 'https://en.wikipedia.org/wiki/Rainbow_Falls_(Hawaii)' },
  hilo: { lat: 19.70556, lng: -155.08583, label: '힐로 시내 대표 위치 · 식사 장소는 미정', source: 'https://en.wikipedia.org/wiki/Hilo%2C_Hawaii' },
  volcano: { lat: 19.383, lng: -155.2, label: '화산국립공원 대표 위치 · 실제 관람·주차 지점과 개방 상태는 재확인', source: 'https://en.wikipedia.org/wiki/Hawai%CA%BBi_Volcanoes_National_Park' },
  waikiki: { lat: 21.2752, lng: -157.8312, label: '와이키키 지역 대표 위치 · 개별 방문지는 일정에 따라 조정', source: 'https://en.wikipedia.org/wiki/Waikiki' },
  halona: { lat: 21.28221, lng: -157.67645, label: '할로나 블로우홀 구역 · 투어 실제 정차 위치는 확인 필요', source: 'https://en.wikipedia.org/wiki/Halona_Blowhole' },
  sandy: { lat: 21.28525, lng: -157.67261, label: '샌디비치 구역 · 투어 실제 정차 위치는 확인 필요', source: 'https://mapcarta.com/W95838103' },
  chinaman: { lat: 21.5092, lng: -157.8297, label: '중국인 모자섬 자체의 대표 위치 · 육상 전망·정차 지점은 미확인', source: 'https://en.wikipedia.org/wiki/Mokoli%CA%BBi' },
  sunset: { lat: 21.66639, lng: -158.05528, label: '선셋비치 구역 · 일몰 감상이 보장되는 일정은 아닙니다.', source: 'https://en.wikipedia.org/wiki/Sunset_Beach_(Oahu)' },
  dole: { lat: 21.52657332, lng: -158.03907389, label: '돌 플랜테이션 진입 도로 위치 · 투어 실제 정차 지점은 확인 필요', source: 'https://hidot.hawaii.gov/highways/files/2023/10/1_HDOT-Oahu-TS-Inventory.pdf' },
  outlet: { lat: 21.40221, lng: -158.00681, label: '와이켈레 아울렛 구역 · 실제 투어 승하차 지점은 확인 필요', source: 'https://mapcarta.com/W508845818' },
  hanauma: { lat: 21.27139, lng: -157.69444, label: '하나우마베이 구역 · 입장·왕복 교통·집합 장소 확인 필요', source: 'https://en.wikipedia.org/wiki/Hanauma_Bay' },
};
