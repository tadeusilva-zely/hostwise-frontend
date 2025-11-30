import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getMe } from '../../services/api';
import { mockHotels } from '../../mocks';
import type { MockHotel } from '../../mocks';
import {
  Building2,
  Plus,
  Star,
  MapPin,
  ExternalLink,
  CheckCircle,
  Users,
  Crown,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

// Plan limits
const PLAN_LIMITS = {
  STARTER: { ownHotels: 1, competitors: 1 },
  INSIGHT: { ownHotels: 1, competitors: 5 },
  PRO: { ownHotels: 3, competitors: 15 },
};

export function HotelsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hotels, setHotels] = useState<MockHotel[]>(mockHotels);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const plan = (user?.plan || 'STARTER') as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[plan];

  const ownHotels = hotels.filter(h => h.isOwn);
  const competitorHotels = hotels.filter(h => !h.isOwn);

  const canAddOwnHotel = ownHotels.length < limits.ownHotels;
  const canAddCompetitor = competitorHotels.length < limits.competitors;

  const handleAddHotel = (newHotel: MockHotel) => {
    setHotels([...hotels, newHotel]);
    setIsModalOpen(false);
  };

  const handleRemoveHotel = (hotelId: string) => {
    setHotels(hotels.filter(h => h.id !== hotelId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hw-navy-900">Meus Hoteis</h1>
          <p className="text-hw-navy-500 mt-1">
            Gerencie seus hoteis e concorrentes monitorados
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Hotel
        </Button>
      </div>

      {/* Plan Limits Card */}
      <Card className="bg-gradient-to-r from-hw-purple-50 to-hw-purple-100 border border-hw-purple-200">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-hw-purple rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-hw-navy-900">
                Plano {plan === 'STARTER' ? 'Starter' : plan === 'INSIGHT' ? 'Insight' : 'Pro'}
              </p>
              <p className="text-sm text-hw-navy-600">
                {ownHotels.length}/{limits.ownHotels} hotel(is) proprio(s) | {competitorHotels.length}/{limits.competitors} concorrente(s)
              </p>
            </div>
          </div>
          {(ownHotels.length >= limits.ownHotels || competitorHotels.length >= limits.competitors) && (
            <Link to="/billing">
              <Button variant="primary" size="sm">
                Fazer upgrade
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Own Hotels Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-hw-purple" />
          <h2 className="text-lg font-semibold text-hw-navy-900">Meu(s) Hotel(is)</h2>
          <span className="text-sm text-hw-navy-500">({ownHotels.length}/{limits.ownHotels})</span>
        </div>

        {ownHotels.length === 0 ? (
          <Card className="border-dashed border-2 border-hw-navy-200">
            <CardContent className="text-center py-8">
              <Building2 className="w-12 h-12 text-hw-navy-300 mx-auto mb-3" />
              <p className="text-hw-navy-600 mb-4">Adicione seu hotel para comecar a monitorar</p>
              <Button variant="primary" onClick={() => setIsModalOpen(true)} disabled={!canAddOwnHotel}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Meu Hotel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownHotels.map(hotel => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onRemove={() => handleRemoveHotel(hotel.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Competitors Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-hw-purple" />
          <h2 className="text-lg font-semibold text-hw-navy-900">Concorrentes</h2>
          <span className="text-sm text-hw-navy-500">({competitorHotels.length}/{limits.competitors})</span>
        </div>

        {competitorHotels.length === 0 ? (
          <Card className="border-dashed border-2 border-hw-navy-200">
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-hw-navy-300 mx-auto mb-3" />
              <p className="text-hw-navy-600 mb-4">Adicione concorrentes para comparar tarifas</p>
              <Button variant="primary" onClick={() => setIsModalOpen(true)} disabled={!canAddCompetitor}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Concorrente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitorHotels.map(hotel => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onRemove={() => handleRemoveHotel(hotel.id)}
              />
            ))}
            {canAddCompetitor && (
              <Card
                className="border-dashed border-2 border-hw-navy-200 cursor-pointer hover:border-hw-purple-300 hover:bg-hw-purple-50 transition-colors"
                onClick={() => setIsModalOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px]">
                  <Plus className="w-8 h-8 text-hw-navy-400 mb-2" />
                  <p className="text-sm text-hw-navy-600">Adicionar concorrente</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Add Hotel Modal */}
      {isModalOpen && (
        <AddHotelModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddHotel}
          canAddOwn={canAddOwnHotel}
          canAddCompetitor={canAddCompetitor}
        />
      )}
    </div>
  );
}

// Hotel Card Component
function HotelCard({ hotel, onRemove }: { hotel: MockHotel; onRemove: () => void }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className={cn(
      'relative overflow-hidden',
      hotel.isOwn && 'ring-2 ring-hw-purple ring-offset-2'
    )}>
      {hotel.isOwn && (
        <div className="absolute top-2 right-2 bg-hw-purple text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Meu Hotel
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Photo */}
          <div className="w-20 h-20 bg-hw-navy-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={hotel.photoUrl}
              alt={hotel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Hotel';
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-hw-navy-900 truncate">{hotel.name}</h3>

            <div className="flex items-center gap-2 mt-1 text-sm text-hw-navy-500">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{hotel.city}, {hotel.country}</span>
            </div>

            <div className="flex items-center gap-4 mt-2">
              {/* Stars */}
              <div className="flex items-center gap-1">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                <span className="bg-hw-purple text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                  {hotel.reviewScore}
                </span>
                <span className="text-xs text-hw-navy-500">({hotel.reviewCount})</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-hw-navy-400">
                Atualizado: {formatDate(hotel.lastFetchAt)}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={hotel.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-hw-navy-400 hover:text-hw-purple transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={onRemove}
                  className="text-hw-navy-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Hotel Modal Component
function AddHotelModal({
  onClose,
  onAdd,
  canAddOwn,
  canAddCompetitor,
}: {
  onClose: () => void;
  onAdd: (hotel: MockHotel) => void;
  canAddOwn: boolean;
  canAddCompetitor: boolean;
}) {
  const [url, setUrl] = useState('');
  const [isOwn, setIsOwn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.includes('booking.com')) {
      setError('Por favor, insira uma URL valida do Booking.com');
      return;
    }

    if (isOwn && !canAddOwn) {
      setError('Voce atingiu o limite de hoteis proprios do seu plano');
      return;
    }

    if (!isOwn && !canAddCompetitor) {
      setError('Voce atingiu o limite de concorrentes do seu plano');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create mock hotel from URL
    const newHotel: MockHotel = {
      id: Date.now().toString(),
      name: isOwn ? 'Novo Hotel Proprio' : 'Novo Concorrente',
      city: 'Rio de Janeiro',
      country: 'Brasil',
      address: 'Endereco sera carregado...',
      starRating: 4,
      reviewScore: 8.0,
      reviewCount: 100,
      photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      bookingUrl: url,
      isOwn,
      lastFetchAt: new Date(),
      createdAt: new Date(),
    };

    onAdd(newHotel);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-hw-navy-100">
          <h2 className="text-lg font-semibold text-hw-navy-900">Adicionar Hotel</h2>
          <button
            onClick={onClose}
            className="text-hw-navy-400 hover:text-hw-navy-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Hotel Type */}
          <div>
            <label className="block text-sm font-medium text-hw-navy-700 mb-2">
              Tipo de Hotel
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsOwn(true)}
                disabled={!canAddOwn}
                className={cn(
                  'p-3 rounded-lg border-2 text-left transition-colors',
                  isOwn
                    ? 'border-hw-purple bg-hw-purple-50'
                    : 'border-hw-navy-200 hover:border-hw-navy-300',
                  !canAddOwn && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Building2 className={cn('w-5 h-5 mb-1', isOwn ? 'text-hw-purple' : 'text-hw-navy-400')} />
                <p className={cn('font-medium', isOwn ? 'text-hw-purple' : 'text-hw-navy-700')}>
                  Meu Hotel
                </p>
                <p className="text-xs text-hw-navy-500">Seu proprio hotel</p>
              </button>

              <button
                type="button"
                onClick={() => setIsOwn(false)}
                disabled={!canAddCompetitor}
                className={cn(
                  'p-3 rounded-lg border-2 text-left transition-colors',
                  !isOwn
                    ? 'border-hw-purple bg-hw-purple-50'
                    : 'border-hw-navy-200 hover:border-hw-navy-300',
                  !canAddCompetitor && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Users className={cn('w-5 h-5 mb-1', !isOwn ? 'text-hw-purple' : 'text-hw-navy-400')} />
                <p className={cn('font-medium', !isOwn ? 'text-hw-purple' : 'text-hw-navy-700')}>
                  Concorrente
                </p>
                <p className="text-xs text-hw-navy-500">Hotel para monitorar</p>
              </button>
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-hw-navy-700 mb-2">
              URL do Booking.com
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.booking.com/hotel/br/..."
              className="w-full px-3 py-2 border border-hw-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw-purple focus:border-transparent"
              required
            />
            <p className="text-xs text-hw-navy-500 mt-1">
              Cole a URL completa da pagina do hotel no Booking.com
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
              Adicionar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
