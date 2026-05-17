import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../hooks';
import { Button, Input } from '../components';

export const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string }>({});
  const { loginAsAdmin } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!password.trim()) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    try {
      await loginAsAdmin(password);
      addNotification('success', 'Admin mode enabled.');
      navigate('/admin');
    } catch {
      addNotification('error', 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 text-text-primary mb-2">Admin Login</h1>
        <p className="text-text-secondary">Indtast admin-adgangskode for admin-tilstand.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="bg-accent rounded-lg p-8 aspect-square flex items-center justify-center">
            <div className="text-center">
              {/* <div className="text-6xl mb-4">Admin</div> */}
              <h2 className="text-h2 text-dark-text mb-2">Admin Mode</h2>
              <p className="text-dark-text">Administrér lagerindstillinger og systemdata.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Admin Adgangskode"
              type="password"
              placeholder="Indtast admin-adgangskoden"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              disabled={loading}
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Opening...' : 'Login som Admin'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => navigate('/inventory')}
                disabled={loading}
              >
                Tilbage til inventar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
