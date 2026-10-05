import { useState } from 'react';
import { useSaldo } from '@/context/useSaldo';
import { RecargarSaldoModal } from '@/components/snailpay';
import { SaldoCard, TransactionHistoryCard } from '@/components/saldos';

export default function SaldoScreen() {
    const { saldo, recargarSaldo } = useSaldo();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRecargarSuccess = (amount: number) => {
        recargarSaldo(amount);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Saldo y movimientos</h1>
                <p className="text-gray-400 mt-1">Gestiona tu saldo y consulta el historial de recargas</p>
            </div>

            <SaldoCard saldo={saldo} />
            <TransactionHistoryCard />
            <RecargarSaldoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleRecargarSuccess} />
        </div>
    );
}