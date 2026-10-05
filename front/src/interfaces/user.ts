export interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  password: string;
  saldo: number;
  totalApuestas: number;
  apuestasGanadas: number;
  apuestasPerdidas: number;
}

export interface RegisterData {
  nombreCompleto: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Usuario | null;
}
