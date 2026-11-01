import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import land from './data/hawaii-land.json';
import { places, type Day, type Place, type PlaceId } from './data/trip';
import { coordinate, initialMapSelection, mapSegments, mapStops } from './mapModel';
import { mapUrl } from './lib';

export default function DayMap({ day }: { day: Day }) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<PlaceId, L.Marker>());
  const fitMap = useRef<() => void>(() => {});
  const [routeIndex, setRouteIndex] = useState(-1);
  const [selected, setSelected] = useState<PlaceId | undefined>(() => initialMapSelection(day));
  const [showInternational, setShowInternational] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [streetMap, setStreetMap] = useState(true);
  const routes = routeIndex < 0 ? day.routes : [day.routes[routeIndex]];
  const stops = mapStops(routes);
  const international = stops.some(s => s.id === 'icn');
  const selectedStop = stops.find(s => s.id === selected);
  const selectedPlace: Place | undefined = selectedStop ? places[selectedStop.id] : undefined;

  useEffect(() => {
    if (!host.current) return;
    const instance = L.map(host.current, { scrollWheelZoom: false, zoomControl: false, zoomSnap: 0.5, minZoom: 2, maxZoom: 18, fadeAnimation: false, zoomAnimation: false, markerZoomAnimation: false });
    map.current = instance;
    instance.attributionControl.setPrefix(false);
    instance.createPane('landBase').style.zIndex = '150';
    L.geoJSON(land as GeoJsonObject, { pane: 'landBase', interactive: false, style: { color: '#9db6a3', weight: 1, fillColor: '#e3eadb', fillOpacity: 1 } }).addTo(instance);
    instance.attributionControl.addAttribution('<a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a>');
    const observer = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
    observer.observe(host.current);
    return () => { observer.disconnect(); instance.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !streetMap) return;
    setTileError(false);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19, keepBuffer: 1, updateWhenIdle: true,
    });
    tiles.on('tileerror', () => setTileError(true));
    tiles.addTo(instance);
    return () => { tiles.remove(); };
  }, [streetMap]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const layer = L.layerGroup().addTo(instance);
    markers.current.clear();
    const visibleStops = stops.filter(s => s.location && (showInternational || s.id !== 'icn'));
    const positions = visibleStops.map(stop => coordinate(stop.id)!);
    // Include the Kona region in the viewport without inventing a lodging marker.
    if (stops.some(stop => stop.id === 'kona')) positions.push(coordinate('town')!);
    fitMap.current = () => {
      if (positions.length > 1) instance.fitBounds(L.latLngBounds(positions), { padding: [45, 45], maxZoom: 16, animate: false });
      else if (positions.length === 1) instance.setView(positions[0], 15, { animate: false });
      else instance.setView([19.65, -155.85], 8, { animate: false });
    };
    const drawnSegments = new Set<string>();
    for (const segment of mapSegments(routes)) {
      if (!showInternational && (segment.from === 'icn' || segment.to === 'icn')) continue;
      const segmentKey = `${segment.mode}:${[segment.from, segment.to].sort().join(':')}`;
      if (drawnSegments.has(segmentKey)) continue;
      drawnSegments.add(segmentKey);
      const flight = segment.mode === '비행기';
      const sea = segment.mode === '보트';
      L.polyline([coordinate(segment.from)!, coordinate(segment.to)!], {
        color: flight ? '#b85e45' : sea ? '#466d9a' : '#245b50', weight: flight ? 2.5 : 3,
        dashArray: flight ? '4 7' : '9 7', opacity: 0.85, interactive: false,
      }).addTo(layer);
    }
    for (const stop of visibleStops) {
      const marker = L.marker(coordinate(stop.id)!, {
        icon: L.divIcon({ className: 'destination-marker', html: `<span>${stop.number}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
        title: `${stop.number}. ${places[stop.id].name}`, alt: `${stop.number}. ${places[stop.id].name}`, keyboard: true,
      }).addTo(layer);
      marker.bindTooltip(places[stop.id].name, { direction: 'top', offset: [0, -16] });
      marker.on('click', () => setSelected(stop.id));
      markers.current.set(stop.id, marker);
    }
    fitMap.current();
    return () => { layer.remove(); markers.current.clear(); };
  }, [day, routeIndex, showInternational]);

  useEffect(() => {
    markers.current.forEach((marker, id) => {
      marker.getElement()?.classList.toggle('is-selected', id === selected);
      marker.setZIndexOffset(id === selected ? 1000 : 0);
    });
  }, [selected, day, routeIndex, showInternational]);

  function selectStop(id: PlaceId) {
    setSelected(id);
    const point = coordinate(id);
    if (point) {
      if (id === 'icn' && !showInternational) setShowInternational(true);
      else map.current?.panTo(point, { animate: false });
    }
  }
  function chooseRoute(index: number) {
    setRouteIndex(index);
    setSelected(mapStops(index < 0 ? day.routes : [day.routes[index]]).find(s => s.location && s.id !== 'icn')?.id);
  }

  return <section className="day-map-panel" aria-labelledby="day-map-title">
    <div className="map-heading"><div><p className="eyebrow">TODAY, ON THE MAP</p><h3 id="day-map-title">오늘의 목적지와 동선</h3></div><span className="map-count">{stops.filter(s => s.location && (showInternational || s.id !== 'icn')).length}곳 지도 표시</span></div>
    <div className="map-filters" aria-label="지도에 표시할 이동 구간"><button aria-pressed={routeIndex === -1} onClick={() => chooseRoute(-1)}>전체 동선</button>{day.routes.length > 1 && day.routes.map((route, i) => <button key={i} aria-pressed={routeIndex === i} onClick={() => chooseRoute(i)}>{i + 1}. {route.mode}</button>)}</div>
    <div className="map-layout"><div className="map-surface"><div ref={host} className="day-map" aria-label={`${day.island} 목적지 지도. 더하기와 빼기 버튼으로 확대하고 목적지 번호를 선택할 수 있습니다.`} />
      <div className="map-toolbar"><button onClick={() => map.current?.zoomIn()} aria-label="지도 확대">+</button><button onClick={() => map.current?.zoomOut()} aria-label="지도 축소">−</button><button onClick={() => fitMap.current()} aria-label="전체 목적지 맞추기">↗</button></div>
      <div className="map-layer-switch"><button onClick={() => setStreetMap(v => !v)} aria-pressed={streetMap}>{streetMap ? '거리 지도 켜짐' : '기본 지도'}</button>{international && <button aria-pressed={showInternational} onClick={() => setShowInternational(v => !v)}>{showInternational ? '하와이만 보기' : '한국까지 보기'}</button>}</div>
    </div><div className="map-destinations"><p className="map-list-label">목적지를 눌러 살펴보기</p><ol>{stops.map(stop => <li key={stop.id}><button className={selected === stop.id ? 'selected' : ''} aria-pressed={selected === stop.id} onClick={() => selectStop(stop.id)}><span className={`map-stop-number ${!stop.location ? 'unknown' : ''}`}>{stop.number}</span><span>{places[stop.id].name}{!stop.location && <small>위치 확인 필요 · 지도 핀 없음</small>}</span><span aria-hidden="true">{stop.location ? '↗' : '?'}</span></button></li>)}</ol></div></div>
    <div className="map-selection" aria-live="polite">{selectedStop ? <><div><strong><span>{selectedStop.number}</span>{places[selectedStop.id].name}</strong><p>{selectedStop.location?.label ?? selectedPlace?.note ?? '정확한 위치 확인 필요'}</p></div>{mapUrl(selectedStop.id) && <a href={mapUrl(selectedStop.id)} target="_blank" rel="noreferrer">Google Maps ↗</a>}</> : <p>확인된 목적지의 대표 위치를 지도에 표시합니다.</p>}</div>
    <div className="map-legend"><span><i className="land-line" />차량·도보·투어</span><span><i className="flight-line" />비행 이동</span><span>점선은 방문 순서를 잇는 연결선</span></div>
    <p className="map-caption">실제 도로·비행 경로와 이동시간을 계산한 결과가 아닙니다. 위치 미확인 장소는 핀을 표시하지 않으며, 확인된 지점 사이만 연결합니다.{international && !showInternational && ' 국제선의 한국 구간은 ‘한국까지 보기’에서 확인하세요.'}</p>
    {tileError && streetMap && <p className="map-load-note" role="status">배경 지도를 불러오지 못한 부분이 있어요. 목적지와 동선은 계속 확인할 수 있습니다. ‘거리 지도 켜짐’을 눌러 기본 지도로 전환할 수 있어요.</p>}
  </section>;
}
