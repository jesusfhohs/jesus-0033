export interface SaldoContextValue {
  saldo: number;
  totalApuestas: number;
  apuestasGanadas: number;
  apuestasPerdidas: number;
  setSaldo: (nuevoSaldo: number) => void;
  setTotalApuestas: (nuevoTotal: number) => void;
  setApuestasGanadas: (nuevoValor: number) => void;
  setApuestasPerdidas: (nuevoValor: number) => void;
  actualizarSaldo: (cambio: number) => void;
  actualizarTotalApuestas: (cambio: number) => void;
  recargarSaldo: (monto: number) => void;
}
