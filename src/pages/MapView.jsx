import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Loader2, Star, MapPin } from 'lucide-react';
import moment from 'moment';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [points.length]);
  return null;
}

const ratingColor = (r) => {
  if (r >= 4) return '#22c55e';
  if (r === 3) return '#eab308';
  return '#ef4444';
};

export default function MapView() {
  const { data: stickers = [] } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id });
    },
  });

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['map-feedback', stickers],
    queryFn: async () => {
      if (stickers.length === 0) return [];
      const all = [];
      for (const s of stickers) {
        const fb = await base44.entities.Feedback.filter({ sticker_id: s.id });
        all.push(...fb.map(f => ({ ...f, _stickerLabel: s.driver_label })));
      }
      return all.filter(f => f.latitude && f.longitude);
    },
    enabled: stickers.length > 0,
  });

  const points = feedback.map(f => [f.latitude, f.longitude]);
  const center = points.length > 0 ? points[0] : [39.8283, -98.5795];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Feedback Map</h1>
        <p className="text-muted-foreground mt-1">See where your feedback is coming from.</p>
      </div>

      {feedback.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No geolocated feedback yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-border" style={{ height: 'calc(100dvh - 220px)', minHeight: '320px' }}>
          <MapContainer center={center} zoom={5} className="h-full w-full" style={{ zIndex: 0 }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <FitBounds points={points} />
            {feedback.map(f => (
              <CircleMarker
                key={f.id}
                center={[f.latitude, f.longitude]}
                radius={10}
                fillColor={ratingColor(f.rating)}
                color={ratingColor(f.rating)}
                fillOpacity={0.7}
                weight={2}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    {f.comment && <p>{f.comment}</p>}
                    {f._stickerLabel && <p className="text-gray-500">{f._stickerLabel}</p>}
                    <p className="text-gray-400 text-xs">{moment(f.created_date).format('MMM D, h:mm A')}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}