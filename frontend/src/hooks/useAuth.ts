import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '@/api/auth';
import { isValidEmail, passwordsMatch, isValidName, getPasswordErrors } from '@/utils/validation';
import type { RegisterData, LoginData, AuthState } from '@/interfaces/user';

export function useAuth() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(getCurrentUser);
  const [isLoading, setIsLoading] = useState(false);

  // Efecto para sincronizar el estado con localStorage en tiempo real
  useEffect(() => {
    const handleStorageChange = () => {
      const freshState = getCurrentUser();
      setAuthState(freshState);
    };
    // Escuchamos cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    // Ejecutar una vez al montar para asegurar estado inicial
    handleStorageChange();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const register = useCallback(
    async (data: RegisterData): Promise<boolean> => {
      if (!isValidName(data.nombreCompleto)) {
        Swal.fire('Error', 'El nombre completo debe tener al menos 3 caracteres', 'error');
        return false;
      }
      if (!isValidEmail(data.email)) {
        Swal.fire('Error', 'El correo electrónico no es válido', 'error');
        return false;
      }
      const passwordErrors = getPasswordErrors(data.password);
      if (passwordErrors.length > 0) {
        Swal.fire('Error', `Contraseña inválida:\n• ${passwordErrors.join('\n• ')}`, 'error');
        return false;
      }
      if (!passwordsMatch(data.password, data.passwordConfirm)) {
        Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
        return false;
      }

      setIsLoading(true);
      try {
        const result = await registerUser(data);
        if (result.success) {
          Swal.fire('Éxito', result.message, 'success');
          navigate('/login');
          return true;
        }
        Swal.fire('Error', result.message, 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const login = useCallback(
    async (data: LoginData): Promise<boolean> => {
      if (!isValidEmail(data.email)) {
        Swal.fire('Error', 'El correo electrónico no es válido', 'error');
        return false;
      }
      if (!data.password) {
        Swal.fire('Error', 'La contraseña es requerida', 'error');
        return false;
      }

      setIsLoading(true);
      try {
        const result = await loginUser(data);
        if (result.success) {
          const freshState = getCurrentUser();
          setAuthState(freshState);
          Swal.fire('Bienvenido', result.message, 'success');
          navigate('/dashboard');
          return true;
        }
        Swal.fire('Error', result.message, 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    logoutUser();
    // Forzar actualización inmediata del estado
    setAuthState({ isAuthenticated: false, user: null });
    navigate('/login');
  }, [navigate]);

  return {
    ...authState,
    isLoading,
    register,
    login,
    logout,
  };
}