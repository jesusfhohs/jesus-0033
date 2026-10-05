import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons';

interface SaldoCardProps {
    saldo: number;
}

export default function SaldoCard({ saldo }: SaldoCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faMoneyBill} className="text-blue-500 text-xl" />
                <div>
                    <p className="text-sm text-gray-400 mb-1">Saldo</p>
                    <p className="text-2xl font-bold text-gray-800">${saldo.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}