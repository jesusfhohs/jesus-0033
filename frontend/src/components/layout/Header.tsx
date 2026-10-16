import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/hooks/useAuth';
import { useSaldo } from '@/context/useSaldo';
import { RecargarSaldoModal } from '@/components/snailpay';
import Button from '@/components/common/Button';

export default function Header() {
  const { user } = useAuth();
  const { recargarSaldo } = useSaldo();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRecargarSuccess = (amount: number) => {
    recargarSaldo(amount);
  };

  return (
    <header className="header h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
          Recargar Saldo
        </Button>
        <span className="text-sm text-gray-500">{user?.nombreCompleto}</span>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faUser} />
        </div>
      </div>

      <RecargarSaldoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRecargarSuccess}
      />
    </header>
  );
}