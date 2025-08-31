import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import CircleGeom from 'ol/geom/Circle';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Style, Icon, Stroke, Fill, Circle as CircleStyle } from 'ol/style';

const defaultMarkerStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: '#3b82f6' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 })
  })
});

export default function OpenLayersMap({
  center = [12.9716, 77.5946], // [lat, lng]
  zoom = 13,
  markers = [], // [{ lat, lng, color? }]
  circleKm = 0,
  onClick,
  style,
  className,
}) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  useEffect(() => {
    const base = new TileLayer({ source: new OSM() });
    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({ source: markerSource });
    markerLayerRef.current = markerLayer;

    const map = new Map({
      target: mapEl.current,
      layers: [base, markerLayer],
      view: new View({
        center: fromLonLat([center[1], center[0]]),
        zoom,
      }),
    });
    mapRef.current = map;

    if (onClick) {
      map.on('click', (evt) => {
        const [lon, lat] = toLonLat(evt.coordinate);
        onClick({ lat, lng: lon });
      });
    }

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  // Update view on center/zoom change
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.getView().setCenter(fromLonLat([center[1], center[0]]));
    if (zoom) mapRef.current.getView().setZoom(zoom);
  }, [center[0], center[1], zoom]);

  // Update markers and circle
  useEffect(() => {
    if (!markerLayerRef.current) return;
    const source = markerLayerRef.current.getSource();
    source.clear();

    // add markers
    markers.forEach((m) => {
      if (m == null || m.lat == null || m.lng == null) return;
      const f = new Feature({ geometry: new Point(fromLonLat([m.lng, m.lat])) });
      f.setStyle(m.style || defaultMarkerStyle);
      source.addFeature(f);
    });

    // add circle
    if (circleKm && circleKm > 0) {
      const center3857 = fromLonLat([center[1], center[0]]);
      const c = new Feature({ geometry: new CircleGeom(center3857, circleKm * 1000) });
      c.setStyle(new Style({
        stroke: new Stroke({ color: '#3b82f6', width: 2 }),
        fill: new Fill({ color: 'rgba(59, 130, 246, 0.15)' })
      }));
      source.addFeature(c);
    }
  }, [JSON.stringify(markers), circleKm, center[0], center[1]]);

  return (
    <div
      ref={mapEl}
      className={className}
     style={{ width: '100%', height: '100%', borderRadius: '12px', ...style }}
    />
  );
}
