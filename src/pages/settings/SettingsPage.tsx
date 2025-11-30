import { useUser } from '@clerk/clerk-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Bell, Shield, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hw-navy-900">Configurações</h1>
        <p className="text-hw-navy-500 mt-1">
          Gerencie sua conta e preferências.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <img
              src={user?.imageUrl}
              alt={user?.fullName || 'Avatar'}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <p className="font-semibold text-hw-navy-900">{user?.fullName}</p>
              <p className="text-sm text-hw-navy-500">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => user?.update}
          >
            Editar Perfil
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-hw-navy-900">Alertas de preço</p>
                <p className="text-sm text-hw-navy-500">
                  Receba notificações quando concorrentes mudarem preços
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" disabled />
                <div className="w-11 h-6 bg-hw-navy-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-hw-purple after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-hw-navy-900">Resumo semanal</p>
                <p className="text-sm text-hw-navy-500">
                  Receba um resumo semanal da concorrência
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" disabled />
                <div className="w-11 h-6 bg-hw-navy-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-hw-purple after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
          <p className="text-xs text-hw-navy-400 mt-4">
            Configurações de notificação estarão disponíveis em breve.
          </p>
        </CardContent>
      </Card>

      {/* Billing shortcut */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-hw-navy-600 mb-4">
            Gerencie seu plano, método de pagamento e veja faturas.
          </p>
          <Link to="/billing/manage">
            <Button variant="secondary" size="sm">
              Gerenciar Assinatura
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
