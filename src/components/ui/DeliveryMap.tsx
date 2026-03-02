"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix lỗi icon mặc định của Leaflet trong Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl, 
  iconRetinaUrl, 
  shadowUrl,
  iconSize: [25, 41], 
  iconAnchor: [12, 41], 
  popupAnchor: [1, -34], 
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface DeliveryMapProps {
  lat?: number;
  lng?: number;
  addressQuery: string; // Chuỗi tìm kiếm từ Dropdown
  onLocationSelect: (data: { lat: number, lng: number, address?: any, error?: boolean }) => void;
}

// Component điều khiển logic Map (Search & FlyTo)
const MapController = ({ lat, lng, query, onLocationSelect }: any) => {
  const map = useMap();
  const [isSearching, setIsSearching] = useState(false);
  const prevQuery = useRef("");

  useEffect(() => {
    // FIX CHẶT: Nếu query rỗng hoặc null, tuyệt đối không loading
    if (!query || query.trim() === "") {
        setIsSearching(false);
        prevQuery.current = ""; // Reset prevQuery để lần sau nhập lại sẽ trigger
        return;
    }
    
    if (query === prevQuery.current) return;
    prevQuery.current = query;
    
    setIsSearching(true);

    const searchLocation = async () => {
      try {
        const parts = query.split(',').map((s: string) => s.trim());
        let data = [];
        
        // Ưu tiên 1: Tìm chính xác full địa chỉ
        const urlFull = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Vietnam")}&addressdetails=1&limit=1`;
        let res = await fetch(urlFull);
        data = await res.json();

        // Ưu tiên 2: Fallback (Bỏ phần đầu - thường là tên đường/ngõ ngách nếu người dùng nhập tay)
        if (!data || data.length === 0) {
            if (parts.length >= 2) {
                // Thử tìm Quận + Tỉnh
                const backupQuery = parts.slice(1).join(", ");
                const urlBackup = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(backupQuery + ", Vietnam")}&addressdetails=1&limit=1`;
                res = await fetch(urlBackup);
                data = await res.json();
            }
        }

        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          
          // QUAN TRỌNG: Cập nhật ngược lại cho cha NGAY LẬP TỨC
          // Việc này sẽ khiến cha re-render -> truyền props lat/lng mới xuống -> Marker tự nhảy
          onLocationSelect({ lat: newLat, lng: newLng });

          // Hiệu ứng bay mượt mà đến vị trí mới
          map.flyTo([newLat, newLng], 16, {
            duration: 1.5, // Bay trong 1.5 giây
            easeLinearity: 0.25
          });
        }
      } catch (e) {
        console.error("Map search error", e);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce nhẹ để tránh spam API khi user thao tác nhanh
    const timer = setTimeout(searchLocation, 800);
    return () => clearTimeout(timer);
  }, [query, map, onLocationSelect]);

  // 2. Tự động Center map nếu props lat/lng thay đổi từ nguồn khác (ví dụ load data có sẵn)
  useEffect(() => {
      if (lat && lng) {
          // Chỉ flyTo nếu khoảng cách đủ xa (tránh giật khi đang drag nhẹ)
          const currentCenter = map.getCenter();
          const distance = currentCenter.distanceTo([lat, lng]);
          if (distance > 1000) { // Nếu lệch quá 1km thì mới bay
             map.flyTo([lat, lng], 16, { duration: 1 });
          }
      }
  }, [lat, lng, map]);

  return (
    <>
        {/* Loading Indicator đè lên Map */}
        {isSearching && (
            <div className="absolute inset-0 bg-white/60 z-[1000] flex flex-col items-center justify-center backdrop-blur-[2px] transition-all">
                <div className="bg-white px-5 py-3 rounded-xl shadow-2xl border border-brand-orange/30 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-brand-orange animate-pulse">Đang tìm địa chỉ...</span>
                </div>
            </div>
        )}
    </>
  );
};

const DraggableMarker = ({ lat, lng, onLocationSelect }: any) => {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(() => ({
        async dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            const { lat, lng } = marker.getLatLng();
            // Gọi Reverse Geocoding khi thả Pin
            try {
               const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
               const data = await res.json();
               onLocationSelect({ lat, lng, address: data.address }); 
            } catch (e) {
               onLocationSelect({ lat, lng, error: true });
            }
          }
        },
    }), [onLocationSelect]);

    // Vị trí hiển thị của Marker luôn dựa vào props lat/lng
    // Khi MapController tìm ra toạ độ mới -> Update Parent -> Props update -> Marker nhảy
    const position: L.LatLngExpression = (lat && lng) ? [lat, lng] : [21.0285, 105.8542];

    return (
        <Marker 
            draggable={true} 
            eventHandlers={eventHandlers} 
            position={position} 
            ref={markerRef}
            autoPan={true} // Tự động di chuyển map khi kéo marker ra mép
        >
            <Popup>Giao hàng tại đây</Popup>
        </Marker>
    )
}

const DeliveryMap: React.FC<DeliveryMapProps> = (props) => {
  // Center mặc định (Hà Nội) hoặc vị trí hiện tại
  const defaultCenter: [number, number] = (props.lat && props.lng) ? [props.lat, props.lng] : [21.0285, 105.8542];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 relative z-0">
       <MapContainer 
            center={defaultCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }} 
            scrollWheelZoom={true}
       >
        <TileLayer 
            attribution='&copy; OpenStreetMap' 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        {/* Controller chịu trách nhiệm Search & Fly */}
        <MapController 
            query={props.addressQuery} 
            lat={props.lat} 
            lng={props.lng} 
            onLocationSelect={props.onLocationSelect} 
        />
        
        {/* Marker chịu trách nhiệm hiển thị Pin */}
        <DraggableMarker 
            lat={props.lat} 
            lng={props.lng} 
            onLocationSelect={props.onLocationSelect}
        />

      </MapContainer>
    </div>
  );
};

export default DeliveryMap;