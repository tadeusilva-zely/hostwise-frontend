import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Email ou senha incorretos.';
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
            Entrar no HostWise
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Acesse sua conta para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Nao tem conta?{' '}
          <Link to="/cadastro" className="font-medium hover:underline" style={{ color: '#818cf8' }}>
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
