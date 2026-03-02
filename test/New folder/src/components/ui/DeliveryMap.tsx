// src/components/ui/DeliveryMap.tsx
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix lỗi icon mặc định của Leaflet trong Next.js
const icon = L.icon({
  iconUrl: "/assets-gift-payment/SvgAsset6.svg", // Tận dụng icon có sẵn của bạn làm Pin
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface DeliveryMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

// Component con để xử lý sự kiện click trên map
const LocationMarker = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  // Mặc định focus vào Hà Nội nếu chưa có vị trí
  useEffect(() => {
    if (!position) {
       const hanoi = new L.LatLng(21.0285, 105.8542);
       map.setView(hanoi, 13);
    }
  }, [map, position]);

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({ onLocationSelect }) => {
  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0">
      <MapContainer 
        center={[21.0285, 105.8542]} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="w-full h-full"
        style={{ height: "100%", minHeight: "300px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;