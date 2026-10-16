import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { SaldoContext } from './saldoContext';
import { getCurrentUser, updateUserBalance } from '@/api/auth';
import { SALDO_INICIAL, TOTAL_APUESTAS_INICIAL, APUESTAS_GANADAS_INICIAL, APUESTAS_PERDIDAS_INICIAL } from '@/utils/constants';

function getInitialUserData() {
  const { user } = getCurrentUser();
  return {
    saldo: user?.saldo ?? SALDO_INICIAL,
    totalApuestas: user?.totalApuestas ?? TOTAL_APUESTAS_INICIAL,
    apuestasGanadas: user?.apuestasGanadas ?? APUESTAS_GANADAS_INICIAL,
    apuestasPerdidas: user?.apuestasPerdidas ?? APUESTAS_PERDIDAS_INICIAL,
  };
}

export function SaldoProvider({ children }: { children: ReactNode }) {
  const initialData = getInitialUserData();
  const [saldo, setSaldoState] = useState<number>(initialData.saldo);
  const [totalApuestas, setTotalApuestasState] = useState<number>(initialData.totalApuestas);
  const [apuestasGanadas, setApuestasGanadasState] = useState<number>(initialData.apuestasGanadas);
  const [apuestasPerdidas, setApuestasPerdidasState] = useState<number>(initialData.apuestasPerdidas);

  // Sincronizar con localStorage cuando cambie en otra pestaña
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'caracoles_auth') {
        const fresh = getCurrentUser();
        if (fresh.user) {
          setSaldoState(fresh.user.saldo);
          setTotalApuestasState(fresh.user.totalApuestas);
          setApuestasGanadasState(fresh.user.apuestasGanadas);
          setApuestasPerdidasState(fresh.user.apuestasPerdidas);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const persistir = useCallback(
    (nuevoSaldo: number, nuevoTotal: number, nuevasGanadas: number, nuevasPerdidas: number) => {
      const { user: currentUser } = getCurrentUser();
      if (currentUser) {
        updateUserBalance(currentUser.id, nuevoSaldo, nuevoTotal, nuevasGanadas, nuevasPerdidas);
      }
    },
    []
  );

  const setSaldo = useCallback(
    (nuevoSaldo: number) => {
      setSaldoState(nuevoSaldo);
      persistir(nuevoSaldo, totalApuestas, apuestasGanadas, apuestasPerdidas);
    },
    [totalApuestas, apuestasGanadas, apuestasPerdidas, persistir]
  );

  const setTotalApuestas = useCallback(
    (nuevoTotal: number) => {
      setTotalApuestasState(nuevoTotal);
      persistir(saldo, nuevoTotal, apuestasGanadas, apuestasPerdidas);
    },
    [saldo, apuestasGanadas, apuestasPerdidas, persistir]
  );

  const setApuestasGanadas = useCallback(
    (nuevoValor: number) => {
      setApuestasGanadasState(nuevoValor);
      persistir(saldo, totalApuestas, nuevoValor, apuestasPerdidas);
    },
    [saldo, totalApuestas, apuestasPerdidas, persistir]
  );

  const setApuestasPerdidas = useCallback(
    (nuevoValor: number) => {
      setApuestasPerdidasState(nuevoValor);
      persistir(saldo, totalApuestas, apuestasGanadas, nuevoValor);
    },
    [saldo, totalApuestas, apuestasGanadas, persistir]
  );

  const actualizarSaldo = useCallback(
    (cambio: number) => {
      setSaldoState((prev) => {
        const nuevo = prev + cambio;
        persistir(nuevo, totalApuestas, apuestasGanadas, apuestasPerdidas);
        return nuevo;
      });
    },
    [totalApuestas, apuestasGanadas, apuestasPerdidas, persistir]
  );

  const actualizarTotalApuestas = useCallback(
    (cambio: number) => {
      setTotalApuestasState((prev) => {
        const nuevo = prev + cambio;
        persistir(saldo, nuevo, apuestasGanadas, apuestasPerdidas);
        return nuevo;
      });
    },
    [saldo, apuestasGanadas, apuestasPerdidas, persistir]
  );

  const recargarSaldo = useCallback(
    (monto: number) => {
      setSaldoState((prev) => {
        const nuevo = prev + monto;
        persistir(nuevo, totalApuestas, apuestasGanadas, apuestasPerdidas);
        return nuevo;
      });
    },
    [totalApuestas, apuestasGanadas, apuestasPerdidas, persistir]
  );

  return (
    <SaldoContext.Provider
      value={{
        saldo,
        totalApuestas,
        apuestasGanadas,
        apuestasPerdidas,
        setSaldo,
        setTotalApuestas,
        setApuestasGanadas,
        setApuestasPerdidas,
        actualizarSaldo,
        actualizarTotalApuestas,
        recargarSaldo,
      }}
    >
      {children}
    </SaldoContext.Provider>
  );
}