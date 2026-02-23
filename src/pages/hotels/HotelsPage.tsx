import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  getMe,
  getHotels,
  createHotelApi,
  deleteHotelApi,
  searchHotelApi,
  searchLocationsApi,
  searchHotelsInLocationApi,
} from '../../services/api';
import type { Hotel, HotelSearchResult, LocationSearchResult, HotelInLocationResult } from '../../services/api';
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
  Loader2,
  Search,
  ArrowLeft,
  Globe,
  Link2,
  Star as StarIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export function HotelsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const {
    data: hotelsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = [...data.ownHotels, ...data.competitorHotels].some(
        (h) => !h.dataFetchedAt
      );
      return hasPending ? 30000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHotelApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });

  const plan = user?.effectivePlan || user?.plan || 'STARTER';
  const limits = hotelsData?.limits || { ownHotels: 1, competitors: 1 };

  const ownHotels = hotelsData?.ownHotels || [];
  const competitorHotels = hotelsData?.competitorHotels || [];

  const canAddOwnHotel = ownHotels.length < limits.ownHotels;
  const canAddCompetitor = competitorHotels.length < limits.competitors;

  const handleRemoveHotel = (hotelId: string) => {
    deleteMutation.mutate(hotelId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#818cf8' }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Erro ao carregar hoteis</h2>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Tente novamente mais tarde.</p>
        <Button variant="secondary" onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
            Meus Hoteis
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Gerencie seus hoteis e concorrentes monitorados
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Hotel
        </Button>
      </div>

      {/* Plan Limits Card */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
          border: '1px solid rgba(79,70,229,0.3)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Plano {plan === 'STARTER' ? 'Starter' : plan === 'INSIGHT' ? 'Insight' : 'Pro'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
      </div>

      {/* Own Hotels Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5" style={{ color: '#818cf8' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Meu(s) Hotel(is)</h2>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({ownHotels.length}/{limits.ownHotels})</span>
        </div>

        {ownHotels.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ border: '2px dashed var(--surface-border)' }}
          >
            <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Adicione seu hotel para comecar a monitorar</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} disabled={!canAddOwnHotel}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Meu Hotel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownHotels.map(hotel => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onRemove={() => handleRemoveHotel(hotel.id)}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === hotel.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Competitors Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" style={{ color: '#818cf8' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Concorrentes</h2>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({competitorHotels.length}/{limits.competitors})</span>
        </div>

        {competitorHotels.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ border: '2px dashed var(--surface-border)' }}
          >
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Adicione concorrentes para comparar tarifas</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} disabled={!canAddCompetitor}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Concorrente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitorHotels.map(hotel => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onRemove={() => handleRemoveHotel(hotel.id)}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === hotel.id}
              />
            ))}
            {canAddCompetitor && (
              <div
                className="rounded-2xl cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[200px]"
                style={{ border: '2px dashed var(--surface-border)' }}
                onClick={() => setIsModalOpen(true)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)'; }}
              >
                <Plus className="w-8 h-8 mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Adicionar concorrente</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Hotel Modal */}
      {isModalOpen && (
        <AddHotelModal
          onClose={() => setIsModalOpen(false)}
          canAddOwn={canAddOwnHotel}
          canAddCompetitor={canAddCompetitor}
        />
      )}
    </div>
  );
}

// Hotel Card Component
function HotelCard({
  hotel,
  onRemove,
  isDeleting,
}: {
  hotel: Hotel;
  onRemove: () => void;
  isDeleting: boolean;
}) {
  const isFetching = !hotel.dataFetchedAt;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div
      className={cn('relative rounded-2xl overflow-hidden transition-opacity', isDeleting && 'opacity-50')}
      style={{
        backgroundColor: 'var(--surface-card)',
        border: hotel.isOwn ? '2px solid #4f46e5' : '1px solid var(--surface-border)',
        boxShadow: hotel.isOwn ? '0 0 0 4px rgba(79,70,229,0.1)' : undefined,
      }}
    >
      {hotel.isOwn && (
        <div
          className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          <CheckCircle className="w-3 h-3" />
          Meu Hotel
        </div>
      )}

      <div className="p-4">
        <div className="flex gap-4">
          {/* Photo */}
          <div
            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
            style={{ backgroundColor: 'var(--surface-secondary)' }}
          >
            {hotel.photoUrl ? (
              <img
                src={hotel.photoUrl}
                alt={hotel.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{hotel.name}</h3>

            {hotel.city && (
              <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                <MapPin className="w-4 h-4" />
                <span className="truncate">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
              </div>
            )}

            <div className="flex items-center gap-4 mt-2">
              {hotel.starRating && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: hotel.starRating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}

              {hotel.reviewScore && (
                <div className="flex items-center gap-1">
                  <span
                    className="text-white text-xs px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                  >
                    {Number(hotel.reviewScore).toFixed(1)}
                  </span>
                  {hotel.reviewCount && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({hotel.reviewCount})</span>
                  )}
                </div>
              )}
            </div>

            {isFetching ? (
              <div className="flex items-center gap-2 mt-3">
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#818cf8' }} />
                <span className="text-xs font-medium" style={{ color: '#818cf8' }}>Coletando dados do Booking.com...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Atualizado: {formatDate(hotel.lastFetchAt)}
                </span>

                <div className="flex items-center gap-2">
                  {hotel.bookingUrl && (
                    <a
                      href={hotel.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={onRemove}
                    disabled={isDeleting}
                    className="transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Hotel Modal Component
function AddHotelModal({
  onClose,
  canAddOwn,
  canAddCompetitor,
}: {
  onClose: () => void;
  canAddOwn: boolean;
  canAddCompetitor: boolean;
}) {
  const [searchMode, setSearchMode] = useState<'url' | 'city'>('url');
  const [step, setStep] = useState<'search' | 'select' | 'select-location' | 'select-hotel'>('search');
  const [url, setUrl] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [isOwn, setIsOwn] = useState(canAddOwn);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<HotelSearchResult[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelSearchResult | null>(null);
  const [locationResults, setLocationResults] = useState<LocationSearchResult[]>([]);
  const [hotelResults, setHotelResults] = useState<HotelInLocationResult[]>([]);
  const [selectedCityHotel, setSelectedCityHotel] = useState<HotelInLocationResult | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: searchHotelApi,
    onSuccess: (results) => {
      if (results.length === 0) {
        setError('Nenhum hotel encontrado para esta URL. Verifique se a URL esta correta.');
        return;
      }
      setSearchResults(results);
      setStep('select');
      setError('');
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao buscar hotel');
    },
  });

  const locationSearchMutation = useMutation({
    mutationFn: searchLocationsApi,
    onSuccess: (results) => {
      if (results.length === 0) {
        setError('Nenhuma cidade encontrada. Tente outro termo.');
        return;
      }
      setLocationResults(results);
      setStep('select-location');
      setError('');
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao buscar cidades');
    },
  });

  const hotelsInLocationMutation = useMutation({
    mutationFn: ({ destId, destType }: { destId: string; destType: string }) =>
      searchHotelsInLocationApi(destId, destType),
    onSuccess: (results) => {
      if (results.length === 0) {
        setError('Nenhum hotel encontrado nesta localidade.');
        return;
      }
      setHotelResults(results);
      setStep('select-hotel');
      setError('');
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao buscar hoteis');
    },
  });

  const createMutation = useMutation({
    mutationFn: createHotelApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      onClose();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao adicionar hotel');
    },
  });

  const checkPlanLimits = () => {
    if (isOwn && !canAddOwn) {
      setError('Voce atingiu o limite de hoteis proprios do seu plano');
      return false;
    }
    if (!isOwn && !canAddCompetitor) {
      setError('Voce atingiu o limite de concorrentes do seu plano');
      return false;
    }
    return true;
  };

  const handleUrlSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!url.includes('booking.com')) {
      setError('Por favor, insira uma URL valida do Booking.com');
      return;
    }
    if (!checkPlanLimits()) return;
    searchMutation.mutate(url);
  };

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!checkPlanLimits()) return;
    locationSearchMutation.mutate(cityQuery);
  };

  const handleSelectLocation = (location: LocationSearchResult) => {
    setSelectedLocationName(location.name);
    setError('');
    hotelsInLocationMutation.mutate({ destId: location.dest_id, destType: location.dest_type });
  };

  const handleConfirmUrl = () => {
    if (!selectedHotel) return;
    createMutation.mutate({
      bookingUrl: url,
      isOwn,
      bookingHotelId: selectedHotel.dest_id,
      name: selectedHotel.name,
    });
  };

  const handleConfirmCity = () => {
    if (!selectedCityHotel) return;
    createMutation.mutate({
      isOwn,
      bookingHotelId: selectedCityHotel.hotel_id,
      name: selectedCityHotel.name,
    });
  };

  const handleBack = () => {
    setError('');
    if (step === 'select') {
      setStep('search');
      setSelectedHotel(null);
      setSearchResults([]);
    } else if (step === 'select-location') {
      setStep('search');
      setLocationResults([]);
    } else if (step === 'select-hotel') {
      setStep('select-location');
      setSelectedCityHotel(null);
      setHotelResults([]);
    }
  };

  const handleSwitchMode = (mode: 'url' | 'city') => {
    setSearchMode(mode);
    setError('');
    setUrl('');
    setCityQuery('');
  };

  const stepTitle = () => {
    if (step === 'search') return 'Adicionar Hotel';
    if (step === 'select') return 'Selecionar Hotel';
    if (step === 'select-location') return 'Selecionar Cidade';
    if (step === 'select-hotel') return `Hoteis em ${selectedLocationName}`;
    return 'Adicionar Hotel';
  };

  const showBackButton = step !== 'search';

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-secondary)',
    border: '1px solid var(--surface-border)',
    color: 'var(--text-primary)',
    borderRadius: 8,
    padding: '8px 12px',
    width: '100%',
    fontSize: 14,
    outline: 'none',
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{stepTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step: Search */}
        {step === 'search' && (
          <div className="p-4 space-y-4">
            {/* Hotel Type */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Tipo de Hotel
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsOwn(true)}
                  disabled={!canAddOwn}
                  className={cn('p-3 rounded-lg border-2 text-left transition-colors', !canAddOwn && 'opacity-50 cursor-not-allowed')}
                  style={{
                    borderColor: isOwn ? '#4f46e5' : 'var(--surface-border)',
                    backgroundColor: isOwn ? 'rgba(79,70,229,0.1)' : 'var(--surface-secondary)',
                  }}
                >
                  <Building2 className="w-5 h-5 mb-1" style={{ color: isOwn ? '#818cf8' : 'var(--text-muted)' }} />
                  <p className="font-medium text-sm" style={{ color: isOwn ? '#818cf8' : 'var(--text-secondary)' }}>
                    Meu Hotel
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Seu proprio hotel</p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOwn(false)}
                  disabled={!canAddCompetitor}
                  className={cn('p-3 rounded-lg border-2 text-left transition-colors', !canAddCompetitor && 'opacity-50 cursor-not-allowed')}
                  style={{
                    borderColor: !isOwn ? '#4f46e5' : 'var(--surface-border)',
                    backgroundColor: !isOwn ? 'rgba(79,70,229,0.1)' : 'var(--surface-secondary)',
                  }}
                >
                  <Users className="w-5 h-5 mb-1" style={{ color: !isOwn ? '#818cf8' : 'var(--text-muted)' }} />
                  <p className="font-medium text-sm" style={{ color: !isOwn ? '#818cf8' : 'var(--text-secondary)' }}>
                    Concorrente
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hotel para monitorar</p>
                </button>
              </div>
            </div>

            {/* Search Mode Tabs */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Como deseja buscar?
              </label>
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--surface-border)' }}
              >
                <button
                  type="button"
                  onClick={() => handleSwitchMode('url')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: searchMode === 'url' ? '#4f46e5' : 'var(--surface-secondary)',
                    color: searchMode === 'url' ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  <Link2 className="w-4 h-4" />
                  Por Link
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('city')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: searchMode === 'city' ? '#4f46e5' : 'var(--surface-secondary)',
                    color: searchMode === 'city' ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  <Globe className="w-4 h-4" />
                  Por Cidade
                </button>
              </div>
            </div>

            {/* URL Search Form */}
            {searchMode === 'url' && (
              <form onSubmit={handleUrlSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    URL do Booking.com
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.booking.com/hotel/br/..."
                    style={inputStyle}
                    required
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Cole a URL completa da pagina do hotel no Booking.com
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" isLoading={searchMutation.isPending} className="flex-1">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </form>
            )}

            {/* City Search Form */}
            {searchMode === 'city' && (
              <form onSubmit={handleCitySearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Cidade ou Regiao
                  </label>
                  <input
                    type="text"
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    placeholder="Ex: Goiania, Rio de Janeiro, Gramado..."
                    style={inputStyle}
                    required
                    minLength={2}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Digite o nome da cidade ou regiao para buscar hoteis
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" isLoading={locationSearchMutation.isPending} className="flex-1">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Step: Select hotel from URL search */}
        {step === 'select' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                Encontramos {searchResults.length} resultado(s). Selecione o hotel correto:
              </p>

              {searchResults.map((result) => (
                <button
                  key={result.dest_id}
                  type="button"
                  onClick={() => setSelectedHotel(result)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors"
                  style={{
                    borderColor: selectedHotel?.dest_id === result.dest_id ? '#4f46e5' : 'var(--surface-border)',
                    backgroundColor: selectedHotel?.dest_id === result.dest_id ? 'rgba(79,70,229,0.1)' : 'var(--surface-secondary)',
                  }}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--surface-card)' }}>
                    {result.image_url ? (
                      <img src={result.image_url} alt={result.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{result.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{result.city_name}{result.region ? `, ${result.region}` : ''}{result.country ? `, ${result.country}` : ''}</span>
                    </div>
                  </div>
                  {selectedHotel?.dest_id === result.dest_id && (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#818cf8' }} />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="px-4">
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              </div>
            )}

            <div className="flex gap-3 p-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
              <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">Voltar</Button>
              <Button type="button" variant="primary" onClick={handleConfirmUrl} disabled={!selectedHotel} isLoading={createMutation.isPending} className="flex-1">Confirmar</Button>
            </div>
          </div>
        )}

        {/* Step: Select location */}
        {step === 'select-location' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Selecione a cidade ou regiao:</p>

              {locationResults.map((location) => (
                <button
                  key={`${location.dest_id}-${location.dest_type}`}
                  type="button"
                  onClick={() => handleSelectLocation(location)}
                  disabled={hotelsInLocationMutation.isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors"
                  style={{
                    borderColor: 'var(--surface-border)',
                    backgroundColor: 'var(--surface-secondary)',
                    opacity: hotelsInLocationMutation.isPending ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { if (!hotelsInLocationMutation.isPending) (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)'; }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(79,70,229,0.15)' }}>
                    <Globe className="w-5 h-5" style={{ color: '#818cf8' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{location.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{location.region ? `${location.region}, ` : ''}{location.country}</span>
                    </div>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{location.nr_hotels} hoteis</span>
                </button>
              ))}

              {hotelsInLocationMutation.isPending && (
                <div className="flex items-center justify-center py-4 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#818cf8' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Buscando hoteis...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="px-4">
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              </div>
            )}

            <div className="flex gap-3 p-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
              <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">Voltar</Button>
            </div>
          </div>
        )}

        {/* Step: Select hotel from city search */}
        {step === 'select-hotel' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{hotelResults.length} hotel(is) encontrado(s). Selecione:</p>

              {hotelResults.map((hotel) => (
                <button
                  key={hotel.hotel_id}
                  type="button"
                  onClick={() => setSelectedCityHotel(hotel)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors"
                  style={{
                    borderColor: selectedCityHotel?.hotel_id === hotel.hotel_id ? '#4f46e5' : 'var(--surface-border)',
                    backgroundColor: selectedCityHotel?.hotel_id === hotel.hotel_id ? 'rgba(79,70,229,0.1)' : 'var(--surface-secondary)',
                  }}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--surface-card)' }}>
                    {hotel.photo_url ? (
                      <img src={hotel.photo_url} alt={hotel.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{hotel.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {hotel.star_rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: hotel.star_rating }).map((_, i) => (
                            <StarIcon key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                      {hotel.review_score > 0 && (
                        <span className="text-white text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                          {hotel.review_score.toFixed(1)}
                        </span>
                      )}
                      {hotel.distance && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{hotel.distance}</span>}
                    </div>
                  </div>
                  {selectedCityHotel?.hotel_id === hotel.hotel_id && (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#818cf8' }} />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="px-4">
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              </div>
            )}

            <div className="flex gap-3 p-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
              <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">Voltar</Button>
              <Button type="button" variant="primary" onClick={handleConfirmCity} disabled={!selectedCityHotel} isLoading={createMutation.isPending} className="flex-1">Confirmar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
