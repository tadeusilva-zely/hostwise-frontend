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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
          Configurações
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
          Gerencie sua conta e preferências.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: '#818cf8' }} />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              <span className="text-2xl font-bold text-white">
                {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{authUser?.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{authUser?.email}</p>
              {authUser?.phone && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{authUser.phone}</p>
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
            <Bell className="w-5 h-5" style={{ color: '#818cf8' }} />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Alertas de preço</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Receba notificações quando concorrentes mudarem preços
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" disabled />
                <div
                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{ backgroundColor: 'var(--surface-border)' }}
                />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Resumo semanal</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Receba um resumo semanal da concorrência
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" disabled />
                <div
                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{ backgroundColor: 'var(--surface-border)' }}
                />
              </label>
            </div>
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Configurações de notificação estarão disponíveis em breve.
          </p>
        </CardContent>
      </Card>

      {/* Billing shortcut */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: '#818cf8' }} />
            Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
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
          <Users className="w-5 h-5" style={{ color: '#818cf8' }} />
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
          <p className="text-sm text-red-400">
            {(createInvite.error as any)?.response?.data?.error || 'Erro ao enviar convite.'}
          </p>
        )}

        {/* Members */}
        {teamLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#818cf8' }} />
          </div>
        ) : members.length > 0 ? (
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Membros</p>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.3))' }}
                    >
                      <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>
                        {member.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.email}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--surface-card)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}
                  >
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
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Convites pendentes</p>
            <div className="space-y-2">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{invite.email}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const baseUrl = window.location.origin;
                        handleCopyLink(`${baseUrl}/convite/${invite.token}`);
                      }}
                      className="p-2 transition-colors rounded"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                      title="Copiar link"
                    >
                      {copiedLink.includes(invite.token) ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => revokeInvite.mutate(invite.id)}
                      className="p-2 transition-colors rounded"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
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
