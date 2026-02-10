import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { validateInvitation, acceptInvitationApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
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

    // Logout current user if any, so the invite creates a fresh account
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

      // Store token and redirect
      localStorage.setItem('hw_token', result.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Erro ao aceitar convite. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-8 h-8 text-hw-purple animate-spin mx-auto mb-4" />
          <p className="text-hw-navy-600">Validando convite...</p>
        </div>
      </div>
    );
  }

  if (invalidToken) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-hw-navy-900 mb-2">Convite invalido</h1>
          <p className="text-hw-navy-500 mb-6">
            Este link de convite expirou ou ja foi utilizado.
          </p>
          <Link
            to="/login"
            className="inline-block btn-primary px-6 py-2"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-hw-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-hw-purple" />
          </div>
          <h1 className="text-2xl font-bold text-hw-navy-900">Aceitar Convite</h1>
          <p className="text-hw-navy-500 mt-1">
            Voce foi convidado para <span className="font-semibold text-hw-navy-700">{inviteData?.organizationName}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-hw-navy-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={inviteData?.email || ''}
              disabled
              className="input bg-hw-navy-50 text-hw-navy-500"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-hw-navy-700 mb-1.5">
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
            <label htmlFor="phone" className="block text-sm font-medium text-hw-navy-700 mb-1.5">
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
            <label htmlFor="password" className="block text-sm font-medium text-hw-navy-700 mb-1.5">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-hw-navy-400 hover:text-hw-navy-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-hw-navy-700 mb-1.5">
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
