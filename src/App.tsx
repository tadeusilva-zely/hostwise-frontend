import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

// Get Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Clerk appearance customization - HostWise branding
const clerkAppearance = {
  baseTheme: undefined, // Force light mode
  variables: {
    colorPrimary: '#8B3DFF', // hw-purple
    colorText: '#0F172A', // hw-navy-900
    colorTextSecondary: '#475569', // hw-navy-600
    colorBackground: '#ffffff',
    colorInputBackground: '#F8FAFC', // hw-navy-50
    colorInputText: '#0F172A',
    colorDanger: '#EF4444',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorNeutral: '#64748B',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    rootBox: {
      width: '100%',
    },
    card: {
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      borderRadius: '0.75rem',
    },
    modalContent: {
      backgroundColor: '#ffffff',
    },
    formFieldInput: {
      backgroundColor: '#F8FAFC',
      borderColor: '#E2E8F0',
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
    },
    headerSubtitle: {
      color: '#64748B', // hw-navy-500
    },
    formButtonPrimary: {
      backgroundColor: '#8B3DFF',
      '&:hover': {
        backgroundColor: '#7C3AED', // hw-purple-600
      },
    },
    footerActionLink: {
      color: '#8B3DFF',
      '&:hover': {
        color: '#7C3AED',
      },
    },
    identityPreviewEditButton: {
      color: '#8B3DFF',
    },
  },
  layout: {
    socialButtonsPlacement: 'bottom' as const,
    socialButtonsVariant: 'iconButton' as const,
    termsPageUrl: '/terms',
    privacyPageUrl: '/privacy',
  },
};

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey} appearance={clerkAppearance}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
