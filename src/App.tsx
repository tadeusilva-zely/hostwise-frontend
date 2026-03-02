import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';
import { queryClient } from './lib/queryClient';
import { useTracking } from './hooks/useTracking';
import { CookieConsentBanner } from './components/ui/CookieConsentBanner';

function App() {
  const { showConsentBanner, handleConsentGiven } = useTracking();

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          {showConsentBanner && (
            <CookieConsentBanner onConsentGiven={handleConsentGiven} />
          )}
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
