import { encryptPassword, decryptPassword } from '@/utils/encryption';
import {
	findUserByEmail,
	saveUser,
	setAuth,
	getAuth,
	clearAuth,
	updateUser,
} from '@/utils/storage';
import {
	SALDO_INICIAL,
	TOTAL_APUESTAS_INICIAL,
	APUESTAS_GANADAS_INICIAL,
	APUESTAS_PERDIDAS_INICIAL,
} from '@/utils/constants';

import type { Usuario, RegisterData, LoginData, AuthState } from '@/interfaces/user';

export async function registerUser(data: RegisterData): Promise<{ success: boolean; message: string; user?: Usuario }> {
 
const existing = findUserByEmail(data.email);
  if (existing) {
    return { success: false, message: 'El correo ya está registrado' };
  }

  const newUser: Usuario = {
    id: crypto.randomUUID(),
    nombreCompleto: data.nombreCompleto,
    email: data.email,
    password: encryptPassword(data.password),
    saldo: SALDO_INICIAL,
    totalApuestas: TOTAL_APUESTAS_INICIAL,
    apuestasGanadas: APUESTAS_GANADAS_INICIAL,
    apuestasPerdidas: APUESTAS_PERDIDAS_INICIAL,
  };

  saveUser(newUser);
  return { success: true, message: 'Usuario registrado exitosamente', user: newUser };
}

export async function loginUser(data: LoginData): Promise<{ success: boolean; message: string; user?: Usuario }> {
  const user = findUserByEmail(data.email);
  if (!user) {
    return { success: false, message: 'Los datos no coinciden' };
  }

  const decrypted = decryptPassword(user.password);
  if (decrypted !== data.password) {
    return { success: false, message: 'Los datos no coinciden' };
  }

  setAuth(user);
  return { success: true, message: 'Inicio de sesión exitoso', user };
}

export function logoutUser(): void {
  clearAuth();
}

export function getCurrentUser(): AuthState {
  const user = getAuth();
  return {
    isAuthenticated: !!user,
    user,
  };
}

export function updateUserBalance(
  userId: string,
  saldo: number,
  totalApuestas: number,
  apuestasGanadas: number,
  apuestasPerdidas: number
): void {
  const { user } = getCurrentUser();
  if (user && user.id === userId) {
    const updated: Usuario = { ...user, saldo, totalApuestas, apuestasGanadas, apuestasPerdidas };
    updateUser(updated);
    setAuth(updated);
  }
}
