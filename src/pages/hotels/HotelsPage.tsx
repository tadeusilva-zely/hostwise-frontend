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
    // Re-fetch periodically so we see when dataFetchedAt becomes non-null
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
        <Loader2 className="w-8 h-8 text-hw-purple animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-hw-navy-900">Erro ao carregar hoteis</h2>
        <p className="text-hw-navy-500 mt-1">Tente novamente mais tarde.</p>
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
                isDeleting={deleteMutation.isPending && deleteMutation.variables === hotel.id}
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
                isDeleting={deleteMutation.isPending && deleteMutation.variables === hotel.id}
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
    <Card className={cn(
      'relative overflow-hidden',
      hotel.isOwn && 'ring-2 ring-hw-purple ring-offset-2',
      isDeleting && 'opacity-50'
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
            {hotel.photoUrl ? (
              <img
                src={hotel.photoUrl}
                alt={hotel.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-hw-navy-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-hw-navy-900 truncate">{hotel.name}</h3>

            {hotel.city && (
              <div className="flex items-center gap-2 mt-1 text-sm text-hw-navy-500">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
              </div>
            )}

            <div className="flex items-center gap-4 mt-2">
              {/* Stars */}
              {hotel.starRating && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: hotel.starRating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}

              {/* Rating */}
              {hotel.reviewScore && (
                <div className="flex items-center gap-1">
                  <span className="bg-hw-purple text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                    {Number(hotel.reviewScore).toFixed(1)}
                  </span>
                  {hotel.reviewCount && (
                    <span className="text-xs text-hw-navy-500">({hotel.reviewCount})</span>
                  )}
                </div>
              )}
            </div>

            {/* Fetching indicator */}
            {isFetching ? (
              <div className="flex items-center gap-2 mt-3">
                <Loader2 className="w-3 h-3 text-hw-purple animate-spin" />
                <span className="text-xs text-hw-purple font-medium">Coletando dados do Booking.com...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-hw-navy-400">
                  Atualizado: {formatDate(hotel.lastFetchAt)}
                </span>

                <div className="flex items-center gap-2">
                  {hotel.bookingUrl && (
                    <a
                      href={hotel.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hw-navy-400 hover:text-hw-purple transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={onRemove}
                    disabled={isDeleting}
                    className="text-hw-navy-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Hotel Modal Component — supports URL and City search modes
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
  // URL search results
  const [searchResults, setSearchResults] = useState<HotelSearchResult[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelSearchResult | null>(null);
  // City search results
  const [locationResults, setLocationResults] = useState<LocationSearchResult[]>([]);
  const [hotelResults, setHotelResults] = useState<HotelInLocationResult[]>([]);
  const [selectedCityHotel, setSelectedCityHotel] = useState<HotelInLocationResult | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const queryClient = useQueryClient();

  // URL search mutation (existing)
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

  // City location search mutation
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

  // Hotels in location mutation
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-hw-navy-100">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="text-hw-navy-400 hover:text-hw-navy-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-hw-navy-900">{stepTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-hw-navy-400 hover:text-hw-navy-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step: Search */}
        {step === 'search' && (
          <div className="p-4 space-y-4">
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

            {/* Search Mode Tabs */}
            <div>
              <label className="block text-sm font-medium text-hw-navy-700 mb-2">
                Como deseja buscar?
              </label>
              <div className="flex rounded-lg border border-hw-navy-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('url')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
                    searchMode === 'url'
                      ? 'bg-hw-purple text-white'
                      : 'bg-white text-hw-navy-600 hover:bg-hw-navy-50'
                  )}
                >
                  <Link2 className="w-4 h-4" />
                  Por Link
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('city')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
                    searchMode === 'city'
                      ? 'bg-hw-purple text-white'
                      : 'bg-white text-hw-navy-600 hover:bg-hw-navy-50'
                  )}
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

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
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
                  <label className="block text-sm font-medium text-hw-navy-700 mb-2">
                    Cidade ou Regiao
                  </label>
                  <input
                    type="text"
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    placeholder="Ex: Goiania, Rio de Janeiro, Gramado..."
                    className="w-full px-3 py-2 border border-hw-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw-purple focus:border-transparent"
                    required
                    minLength={2}
                  />
                  <p className="text-xs text-hw-navy-500 mt-1">
                    Digite o nome da cidade ou regiao para buscar hoteis
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
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
              <p className="text-sm text-hw-navy-500 mb-3">
                Encontramos {searchResults.length} resultado(s). Selecione o hotel correto:
              </p>

              {searchResults.map((result) => (
                <button
                  key={result.dest_id}
                  type="button"
                  onClick={() => setSelectedHotel(result)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors',
                    selectedHotel?.dest_id === result.dest_id
                      ? 'border-hw-purple bg-hw-purple-50'
                      : 'border-hw-navy-200 hover:border-hw-navy-300'
                  )}
                >
                  <div className="w-14 h-14 bg-hw-navy-100 rounded-lg overflow-hidden flex-shrink-0">
                    {result.image_url ? (
                      <img
                        src={result.image_url}
                        alt={result.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-hw-navy-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-hw-navy-900 truncate">{result.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-sm text-hw-navy-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {result.city_name}{result.region ? `, ${result.region}` : ''}{result.country ? `, ${result.country}` : ''}
                      </span>
                    </div>
                  </div>

                  {selectedHotel?.dest_id === result.dest_id && (
                    <CheckCircle className="w-5 h-5 text-hw-purple flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="px-4">
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              </div>
            )}

            <div className="flex gap-3 p-4 border-t border-hw-navy-100">
              <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmUrl}
                disabled={!selectedHotel}
                isLoading={createMutation.isPending}
                className="flex-1"
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* Step: Select location (city search flow) */}
        {step === 'select-location' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <p className="text-sm text-hw-navy-500 mb-3">
                Selecione a cidade ou regiao:
              </p>

              {locationResults.map((location) => (
                <button
                  key={`${location.dest_id}-${location.dest_type}`}
                  type="button"
                  onClick={() => handleSelectLocation(location)}
                  disabled={hotelsInLocationMutation.isPending}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors',
                    'border-hw-navy-200 hover:border-hw-purple hover:bg-hw-purple-50',
                    hotelsInLocationMutation.isPending && 'opacity-50'
                  )}
                >
                  <div className="w-10 h-10 bg-hw-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-hw-purple" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-hw-navy-900 truncate">{location.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-sm text-hw-navy-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {location.region ? `${location.region}, ` : ''}{location.country}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-hw-navy-500">{location.nr_hotels} hoteis</span>
                  </div>
                </button>
              ))}

              {hotelsInLocationMutation.isPending && (
                <div className="flex items-center justify-center py-4 gap-2">
                  <Loader2 className="w-5 h-5 text-hw-purple animate-spin" />
                  <span className="text-sm text-hw-navy-500">Buscando hoteis...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="px-4">
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              </div>
            )}

            <div className="flex gap-3 p-4 border-t border-hw-navy-100">
              <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
            </div>
          </div>
        )}

        {/* Step: Select hotel from city search */}
        {step === 'select-hotel' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <p className="text-sm text-hw-navy-500 mb-3">
                {hotelResults.length} hotel(is) encontrado(s). Selecione:
              </p>

              {hotelResults.map((hotel) => (
                <button
                  key={hotel.hotel_id}
                  type="button"
                  onClick={() => setSelectedCityHotel(hotel)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors',
                    selectedCityHotel?.hotel_id === hotel.hotel_id
                      ? 'border-hw-purple bg-hw-purple-50'
                      : 'border-hw-navy-200 hover:border-hw-navy-300'
                  )}
                >
                  <div className="w-14 h-14 bg-hw-navy-100 rounded-lg overflow-hidden flex-shrink-0">
                    {hotel.photo_url ? (
                      <img
                        src={hotel.photo_url}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-hw-navy-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-hw-navy-900 truncate">{hotel.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-sm text-hw-navy-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
                      </span>
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
                        <span className="bg-hw-purple text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                          {hotel.review_score.toFixed(1)}
                        </span>
                      )}
                      {hotel.distance && (
                        <span className="text-xs text-hw-navy-400">{hotel.distance}</span>
                      )}
                    </div>
                  </div>

                  {selectedCityHotel?.hotel_id === hotel.hotel_id && (
                    <CheckCircle className="w-5 h-5 text-hw-purple flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="px-4">
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              </div>
            )}

            <div className="flex gap-3 p-4 border-t border-hw-navy-100">
              <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmCity}
                disabled={!selectedCityHotel}
                isLoading={createMutation.isPending}
                className="flex-1"
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
