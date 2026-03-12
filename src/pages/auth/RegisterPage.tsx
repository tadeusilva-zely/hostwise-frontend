import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { isValidCnpj } from '../../utils/cnpj';
import { trackStartTrial, trackCompleteRegistration } from '../../lib/tracking';
import { Turnstile } from '@marsidev/react-turnstile';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    organizationName: '',
    cnpj: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const hasTrackedStartTrial = useRef(false);

  useEffect(() => {
    if (!hasTrackedStartTrial.current) {
      hasTrackedStartTrial.current = true;
      trackStartTrial();
    }
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
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

    if (form.cnpj && !isValidCnpj(form.cnpj)) {
      setError('CNPJ inválido. Verifique os números digitados.');
      return;
    }

    if (siteKey && !turnstileToken) {
      setError('Complete a verificação de segurança.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: form.name,
        organizationName: form.organizationName,
        email: form.email,
        password: form.password,
        cnpj: form.cnpj || undefined,
        phone: form.phone || undefined,
        turnstileToken: turnstileToken || undefined,
      });
      trackCompleteRegistration();
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Erro ao criar conta. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-2xl shadow-2xl p-8"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Lexend', sans-serif" }}>H</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
            Criar Conta
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Preencha seus dados para comecar</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label htmlFor="organizationName" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Nome do Hotel *
            </label>
            <input
              id="organizationName"
              type="text"
              value={form.organizationName}
              onChange={(e) => updateField('organizationName', e.target.value)}
              placeholder="Nome do seu hotel"
              required
              className="input"
            />
          </div>

          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              CNPJ
            </label>
            <input
              id="cnpj"
              type="text"
              value={form.cnpj}
              onChange={(e) => updateField('cnpj', formatCnpj(e.target.value))}
              placeholder="00.000.000/0000-00"
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
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="seu@email.com"
              required
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

          {siteKey && (
            <Turnstile
              siteKey={siteKey}
              onSuccess={setTurnstileToken}
              onError={() => setTurnstileToken('')}
              onExpire={() => setTurnstileToken('')}
              options={{ theme: 'auto', language: 'pt-BR' }}
            />
          )}

          <button
            type="submit"
            disabled={isLoading || (!!siteKey && !turnstileToken)}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Ja tem conta?{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: '#818cf8' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
