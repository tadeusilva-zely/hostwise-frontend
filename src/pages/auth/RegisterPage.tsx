import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        cnpj: form.cnpj || undefined,
        phone: form.phone || undefined,
      });
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
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-hw-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-hw-purple" />
          </div>
          <h1 className="text-2xl font-bold text-hw-navy-900">Criar Conta</h1>
          <p className="text-hw-navy-500 mt-1">Preencha seus dados para comecar</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label htmlFor="cnpj" className="block text-sm font-medium text-hw-navy-700 mb-1.5">
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
            <label htmlFor="email" className="block text-sm font-medium text-hw-navy-700 mb-1.5">
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
                Criar Conta
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-hw-navy-500 mt-6">
          Ja tem conta?{' '}
          <Link to="/login" className="text-hw-purple font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
