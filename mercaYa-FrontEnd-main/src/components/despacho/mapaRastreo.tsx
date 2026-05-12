import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Despacho } from "../../types";

// Fix iconos Leaflet con Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const iconOrigen = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
const iconDestino = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
const iconDespacho = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [40, 40] });
  }, [positions]);
  return null;
}

interface Props {
  despacho: Despacho;
}

export default function MapaRastreo({ despacho }: Props) {
  const positions: [number, number][] = [];
  if (despacho.origen_lat)
    positions.push([despacho.origen_lat, despacho.origen_lng]);
  if (despacho.destino_lat)
    positions.push([despacho.destino_lat, despacho.destino_lng]);

  const center: [number, number] = positions[0] || [7.8939, -72.5078]; // Cúcuta por defecto

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-72">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <FitBounds positions={positions} />

        {despacho.origen_lat != null && despacho.origen_lng != null && (
          <Marker
            position={[despacho.origen_lat, despacho.origen_lng]}
            icon={iconOrigen}
          >
            <Popup>🏢 Negocio (Origen)</Popup>
          </Marker>
        )}

        {despacho.destino_lat != null && despacho.destino_lng != null && (
          <Marker
            position={[despacho.destino_lat, despacho.destino_lng]}
            icon={iconDestino}
          >
            <Popup>
              📍 {despacho.cliente_nombre} — {despacho.direccion}
            </Popup>
          </Marker>
        )}
        {despacho.despacho_lat != null && despacho.despacho_lng != null && (
          <Marker
            position={[despacho.despacho_lat, despacho.despacho_lng!]}
            icon={iconDespacho}
          >
            <Popup>🚚 Despachador en ruta</Popup>
          </Marker>
        )}
        {positions.length === 2 && (
          <Polyline
            positions={positions}
            color="#0ea5e9"
            weight={3}
            dashArray="8,6"
          />
        )}
      </MapContainer>
    </div>
  );
}
