import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function CheckoutSuccess() {
  const [_searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['me'] });
  }, [queryClient]);

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: '#10b981' }} />
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
          Assinatura confirmada!
        </h1>

        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Obrigado por assinar o HostWise. Você agora tem acesso a todas as
          funcionalidades do seu plano.
        </p>

        <div className="space-y-3">
          <Link to="/dashboard" className="block">
            <Button variant="primary" className="w-full">
              Ir para o Dashboard
            </Button>
          </Link>

          <Link to="/hotels" className="block">
            <Button variant="secondary" className="w-full">
              Adicionar Concorrentes
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
