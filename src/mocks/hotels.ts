export interface MockHotel {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  photoUrl: string;
  bookingUrl: string;
  isOwn: boolean;
  lastFetchAt: Date;
  createdAt: Date;
}

export const mockHotels: MockHotel[] = [
  {
    id: '1',
    name: 'Hotel Copacabana Palace',
    city: 'Rio de Janeiro',
    country: 'Brasil',
    address: 'Av. Atlântica, 1702 - Copacabana',
    starRating: 5,
    reviewScore: 9.2,
    reviewCount: 3847,
    photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    bookingUrl: 'https://www.booking.com/hotel/br/copacabana-palace.html',
    isOwn: true,
    lastFetchAt: new Date(),
    createdAt: new Date('2025-11-01'),
  },
  {
    id: '2',
    name: 'Hotel Fasano Rio de Janeiro',
    city: 'Rio de Janeiro',
    country: 'Brasil',
    address: 'Av. Vieira Souto, 80 - Ipanema',
    starRating: 5,
    reviewScore: 9.4,
    reviewCount: 2156,
    photoUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    bookingUrl: 'https://www.booking.com/hotel/br/fasano-rio.html',
    isOwn: false,
    lastFetchAt: new Date(),
    createdAt: new Date('2025-11-05'),
  },
  {
    id: '3',
    name: 'Belmond Copacabana Palace',
    city: 'Rio de Janeiro',
    country: 'Brasil',
    address: 'Av. Atlântica, 1020 - Copacabana',
    starRating: 5,
    reviewScore: 9.0,
    reviewCount: 1823,
    photoUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    bookingUrl: 'https://www.booking.com/hotel/br/belmond-copacabana.html',
    isOwn: false,
    lastFetchAt: new Date(),
    createdAt: new Date('2025-11-10'),
  },
  {
    id: '4',
    name: 'Hotel Emiliano Rio',
    city: 'Rio de Janeiro',
    country: 'Brasil',
    address: 'Av. Atlântica, 3804 - Copacabana',
    starRating: 5,
    reviewScore: 9.1,
    reviewCount: 987,
    photoUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
    bookingUrl: 'https://www.booking.com/hotel/br/emiliano-rio.html',
    isOwn: false,
    lastFetchAt: new Date(),
    createdAt: new Date('2025-11-15'),
  },
];

// Helper to get own hotels
export const getOwnHotels = () => mockHotels.filter(h => h.isOwn);

// Helper to get competitor hotels
export const getCompetitorHotels = () => mockHotels.filter(h => !h.isOwn);
