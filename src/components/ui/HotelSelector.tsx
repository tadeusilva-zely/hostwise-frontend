import { Building2 } from 'lucide-react';
import type { Hotel } from '../../services/api';

interface HotelSelectorProps {
  ownHotels: Hotel[];
  competitorHotels: Hotel[];
  selectedHotelId: string;
  onChange: (hotelId: string) => void;
}

export function HotelSelector({ ownHotels, competitorHotels, selectedHotelId, onChange }: HotelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
      <select
        value={selectedHotelId}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--surface-border)',
          color: 'var(--text-primary)',
        }}
      >
        <option value="all">Todos os Hotéis</option>
        {ownHotels.map((h) => (
          <option key={h.id} value={h.id}>{h.name} (Meu Hotel)</option>
        ))}
        {competitorHotels.map((h) => (
          <option key={h.id} value={h.id}>{h.name}</option>
        ))}
      </select>
    </div>
  );
}
