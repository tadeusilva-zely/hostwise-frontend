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
    // Invalidate user query to refresh plan info
    queryClient.invalidateQueries({ queryKey: ['me'] });
  }, [queryClient]);

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card className="text-center">
        <div className="w-16 h-16 bg-hw-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-hw-green" />
        </div>

        <h1 className="text-2xl font-bold text-hw-navy-900 mb-2">
          Assinatura confirmada!
        </h1>

        <p className="text-hw-navy-600 mb-6">
          Obrigado por assinar o HostWise. Você agora tem acesso a todas as
          funcionalidades do seu plano.
        </p>

        <div className="space-y-3">
          <Link to="/dashboard" className="block">
            <Button variant="primary" className="w-full">
              Ir para o Dashboard
            </Button>
          </Link>

          <Link to="/competitors" className="block">
            <Button variant="secondary" className="w-full">
              Adicionar Concorrentes
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
