import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Bell, Shield, Users, Copy, Trash2, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTeamMembers, getInvitations, createInvitationApi, revokeInvitationApi } from '../../services/api';

export function SettingsPage() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = authUser?.role === 'OWNER';

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
            <div className="w-16 h-16 bg-hw-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-hw-purple">
                {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-hw-navy-900">{authUser?.name}</p>
              <p className="text-sm text-hw-navy-500">{authUser?.email}</p>
              {authUser?.phone && (
                <p className="text-sm text-hw-navy-400">{authUser.phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team (OWNER only) */}
      {isOwner && <TeamSection queryClient={queryClient} />}

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

function TeamSection({ queryClient }: { queryClient: ReturnType<typeof useQueryClient> }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState('');

  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: getTeamMembers,
  });

  const { data: invitationsData, isLoading: invitesLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: getInvitations,
  });

  const createInvite = useMutation({
    mutationFn: (email: string) => createInvitationApi(email),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      setInviteEmail('');
      // Auto-copy the link
      navigator.clipboard.writeText(data.inviteUrl);
      setCopiedLink(data.inviteUrl);
      setTimeout(() => setCopiedLink(''), 3000);
    },
  });

  const revokeInvite = useMutation({
    mutationFn: (id: string) => revokeInvitationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(''), 3000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      createInvite.mutate(inviteEmail.trim());
    }
  };

  const members = teamData?.members || [];
  const invitations = invitationsData?.invitations || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite form */}
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email do convidado"
            className="input flex-1"
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={createInvite.isPending}
          >
            {createInvite.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Convidar'
            )}
          </Button>
        </form>

        {createInvite.isError && (
          <p className="text-sm text-red-600">
            {(createInvite.error as any)?.response?.data?.error || 'Erro ao enviar convite.'}
          </p>
        )}

        {/* Members */}
        {teamLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-hw-purple animate-spin" />
          </div>
        ) : members.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-hw-navy-700 mb-2">Membros</p>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-hw-navy-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-hw-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-hw-purple">
                        {member.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-hw-navy-900">{member.name}</p>
                      <p className="text-xs text-hw-navy-500">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-hw-navy-100 text-hw-navy-600">
                    {member.role === 'OWNER' ? 'Dono' : 'Membro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Pending Invitations */}
        {invitesLoading ? null : invitations.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-hw-navy-700 mb-2">Convites pendentes</p>
            <div className="space-y-2">
              {invitations.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-hw-navy-900">{invite.email}</p>
                    <p className="text-xs text-hw-navy-500">
                      Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const baseUrl = window.location.origin;
                        handleCopyLink(`${baseUrl}/convite/${invite.token}`);
                      }}
                      className="p-2 text-hw-navy-400 hover:text-hw-purple transition-colors"
                      title="Copiar link"
                    >
                      {copiedLink.includes(invite.token) ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => revokeInvite.mutate(invite.id)}
                      className="p-2 text-hw-navy-400 hover:text-red-500 transition-colors"
                      title="Revogar convite"
                      disabled={revokeInvite.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
