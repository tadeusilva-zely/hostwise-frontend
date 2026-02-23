import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { validateInvitation, acceptInvitationApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { logout } = useAuth();

  const [inviteData, setInviteData] = useState<{ email: string; organizationName: string } | null>(null);
  const [validating, setValidating] = useState(true);
  const [invalidToken, setInvalidToken] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
      setValidating(false);
      return;
    }

    logout();

    validateInvitation(token)
      .then((data) => {
        setInviteData(data);
      })
      .catch(() => {
        setInvalidToken(true);
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await acceptInvitationApi({
        token: token!,
        password: form.password,
        name: form.name,
        phone: form.phone || undefined,
      });

      localStorage.setItem('hw_token', result.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Erro ao aceitar convite. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--surface-border)',
  };

  if (validating) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-2xl p-8 text-center" style={cardStyle}>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#818cf8' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Validando convite...</p>
        </div>
      </div>
    );
  }

  if (invalidToken) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-2xl p-8 text-center" style={cardStyle}>
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
            Convite invalido
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            Este link de convite expirou ou ja foi utilizado.
          </p>
          <Link to="/login" className="inline-block btn-primary px-6 py-2">
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl shadow-2xl p-8" style={cardStyle}>
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
            Aceitar Convite
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Voce foi convidado para{' '}
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{inviteData?.organizationName}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={inviteData?.email || ''}
              disabled
              className="input opacity-60"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Nome *
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Seu nome completo"
              required
              className="input"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Telefone
            </label>
            <input
              id="phone"
              type="text"
              value={form.phone}
              onChange={(e) => updateField('phone', formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Senha *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="Minimo 8 caracteres"
                required
                minLength={8}
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Confirmar Senha *
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Repita a senha"
              required
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Aceitar Convite e Criar Conta
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
