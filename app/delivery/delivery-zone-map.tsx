"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";
import {
  DELIVERY_CITY_MAPS,
  type DeliveryCityMap,
  type DeliveryZone,
} from "./delivery-zones";

type Bounds = [[number, number], [number, number]];

type YMapGeoCollection = {
  add: (item: unknown) => void;
  remove: (item: unknown) => void;
};

type YMapBehaviors = {
  disable: (behaviorName: string) => void;
};

type YMapInstance = {
  destroy: () => void;
  setBounds: (
    bounds: Bounds,
    options?: {
      checkZoomRange?: boolean;
      zoomMargin?: number;
      duration?: number;
    },
  ) => void;
  setCenter: (
    coordinates: [number, number],
    zoom?: number,
    options?: { duration?: number },
  ) => void;
  geoObjects: YMapGeoCollection;
  behaviors: YMapBehaviors;
};

type YMapPolygon = {
  options: {
    set: (options: Record<string, string | number>) => void;
  };
  events: {
    add: (eventName: string, callback: () => void) => void;
  };
};

type YMapsNamespace = {
  ready: (callback: () => void) => void;
  Map: new (
    element: HTMLElement,
    options: { center: [number, number]; zoom: number; controls: string[] },
  ) => YMapInstance;
  Polygon: new (
    geometry: [Array<[number, number]>],
    properties: Record<string, string>,
    options: Record<string, string | number>,
  ) => YMapPolygon;
};

declare global {
  interface Window {
    ymaps?: YMapsNamespace;
  }
}

const MAP_SCRIPT_ID = "yandex-maps-script";

const loadYandexMaps = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.ymaps) {
    return window.ymaps;
  }

  const existingScript = document.getElementById(
    MAP_SCRIPT_ID,
  ) as HTMLScriptElement | null;

  if (!existingScript) {
    const script = document.createElement("script");
    script.id = MAP_SCRIPT_ID;
    script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
    script.async = true;
    document.body.appendChild(script);
  }

  await new Promise<void>((resolve, reject) => {
    const checkReady = () => {
      if (window.ymaps) {
        resolve();
        return;
      }

      window.setTimeout(checkReady, 100);
    };

    checkReady();

    window.setTimeout(() => {
      if (!window.ymaps) {
        reject(new Error("Yandex Maps API failed to load"));
      }
    }, 10000);
  });

  await new Promise<void>((resolve) => {
    window.ymaps?.ready(resolve);
  });

  return window.ymaps ?? null;
};

const fitMapToZone = (mapInstance: YMapInstance, zone: DeliveryZone) => {
  const initialBounds: Bounds = [
    [zone.polygon[0][0], zone.polygon[0][1]],
    [zone.polygon[0][0], zone.polygon[0][1]],
  ];

  const bounds: Bounds = zone.polygon.reduce<Bounds>(
    (accumulator, [lat, lon]) => {
      return [
        [Math.min(accumulator[0][0], lat), Math.min(accumulator[0][1], lon)],
        [Math.max(accumulator[1][0], lat), Math.max(accumulator[1][1], lon)],
      ];
    },
    initialBounds,
  );

  mapInstance.setBounds(bounds, {
    checkZoomRange: true,
    zoomMargin: 32,
    duration: 250,
  });
};

const fitMapToCity = (mapInstance: YMapInstance, city: DeliveryCityMap) => {
  const allPoints = city.zones.flatMap((zone) => zone.polygon);

  if (!allPoints.length) {
    return;
  }

  const initialBounds: Bounds = [
    [allPoints[0][0], allPoints[0][1]],
    [allPoints[0][0], allPoints[0][1]],
  ];

  const bounds: Bounds = allPoints.reduce<Bounds>((accumulator, [lat, lon]) => {
    return [
      [Math.min(accumulator[0][0], lat), Math.min(accumulator[0][1], lon)],
      [Math.max(accumulator[1][0], lat), Math.max(accumulator[1][1], lon)],
    ];
  }, initialBounds);

  mapInstance.setBounds(bounds, {
    checkZoomRange: true,
    zoomMargin: 48,
    duration: 250,
  });
};

export const DeliveryZoneMap = () => {
  const [activeCityId, setActiveCityId] = useState(DELIVERY_CITY_MAPS[0].id);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(
    DELIVERY_CITY_MAPS[0].zones[0]?.id ?? null,
  );
  const [status, setStatus] = useState(
    "Выберите город и кликните по зоне на карте.",
  );
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<YMapInstance | null>(null);
  const polygonCollectionRef = useRef<
    Array<{ id: string; polygon: YMapPolygon }>
  >([]);

  const activeCity =
    DELIVERY_CITY_MAPS.find((city) => city.id === activeCityId) ??
    DELIVERY_CITY_MAPS[0];

  const activeZone =
    activeCity.zones.find((zone) => zone.id === activeZoneId) ??
    activeCity.zones[0] ??
    null;

  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current) {
        return;
      }

      try {
        const ymaps = await loadYandexMaps();

        if (!ymaps || isCancelled || !mapContainerRef.current) {
          return;
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        }

        const map = new ymaps.Map(mapContainerRef.current, {
          center: activeCity.center,
          zoom: activeCity.zoom,
          controls: ["zoomControl", "fullscreenControl"],
        });

        map.behaviors.disable("scrollZoom");
        mapInstanceRef.current = map;
        polygonCollectionRef.current = [];

        activeCity.zones.forEach((zone) => {
          const polygon = new ymaps.Polygon(
            [zone.polygon],
            {
              hintContent: zone.name,
              balloonContentHeader: zone.name,
              balloonContentBody: zone.description,
              balloonContentFooter: zone.intervalLabel,
            },
            {
              fillColor: `${zone.color}55`,
              strokeColor: zone.color,
              strokeWidth: 3,
              opacity: 0.85,
            },
          );

          polygon.events.add("click", () => {
            setActiveZoneId(zone.id);
            setStatus(`Выбрана ${zone.name}. Интервал доставки: ${zone.intervalLabel}.`);
            fitMapToZone(map, zone);
          });

          polygonCollectionRef.current.push({ id: zone.id, polygon });
          map.geoObjects.add(polygon);
        });

        setMapError(null);
        setIsMapReady(true);

        fitMapToCity(map, activeCity);
      } catch {
        if (!isCancelled) {
          setMapError(
            "Не удалось загрузить Яндекс.Карту. Проверьте подключение или настройки API.",
          );
          setIsMapReady(false);
        }
      }
    };

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [activeCity]);

  useEffect(() => {
    if (!activeZone) {
      return;
    }

    polygonCollectionRef.current.forEach((item) => {
      const isActive = item.id === activeZone.id;

      item.polygon.options.set({
        fillColor: `${isActive ? activeZone.color : "#8da2a8"}${isActive ? "70" : "35"}`,
        strokeColor: isActive ? activeZone.color : "#8da2a8",
        strokeWidth: isActive ? 4 : 2,
      });
    });
  }, [activeZone]);

  return (
    <div className={styles.mapCard}>
      <div
        className={styles.mapControls}
        role="tablist"
        aria-label="Города доставки"
      >
        {DELIVERY_CITY_MAPS.map((city) => {
          const isActive = city.id === activeCity.id;

          return (
            <button
              key={city.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.mapTab} ${isActive ? styles.mapTabActive : ""}`}
              onClick={() => {
                setActiveCityId(city.id);
                setActiveZoneId(city.zones[0]?.id ?? null);
                setStatus("Выберите зону на карте или в списке.");
              }}
            >
              {city.label}
            </button>
          );
        })}
      </div>

      <div className={styles.mapLayout}>
        <div className={styles.mapSidebar}>
          <div className={styles.zoneList}>
            {activeCity.zones.map((zone) => {
              const isActive = zone.id === activeZone?.id;

              return (
                <button
                  key={zone.id}
                  type="button"
                  className={`${styles.zoneItem} ${isActive ? styles.zoneItemActive : ""}`}
                  onClick={() => {
                    setActiveZoneId(zone.id);
                    setStatus(`Выбрана ${zone.name}. Интервал доставки: ${zone.intervalLabel}.`);

                    if (mapInstanceRef.current) {
                      fitMapToZone(mapInstanceRef.current, zone);
                    }
                  }}
                >
                  <span
                    className={styles.zoneSwatch}
                    style={{ backgroundColor: zone.color }}
                    aria-hidden="true"
                  />
                  <span className={styles.zoneItemContent}>
                    <strong>{zone.name}</strong>
                    <span>{zone.intervalLabel}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {activeZone ? (
            <div className={styles.zoneDetails}>
              <span>{activeZone.name}</span>
              <h3>{activeZone.intervalLabel}</h3>
              <p>{activeZone.description}</p>
            </div>
          ) : null}
        </div>

        <div className={styles.mapCanvasWrap}>
          <div ref={mapContainerRef} className={styles.mapCanvas} />
          {!isMapReady && !mapError ? (
            <div className={styles.mapOverlay}>Загружаем карту...</div>
          ) : null}
          {mapError ? <div className={styles.mapOverlay}>{mapError}</div> : null}
        </div>
      </div>

      <p className={styles.mapHint}>{status}</p>
    </div>
  );
};
