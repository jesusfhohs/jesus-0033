import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faXmark,
    faExclamationTriangle,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import Card from '@/components/common/Card';
import { getTransactions, type TransactionRecord } from '@/utils/transactionHistory';
import { useState, useEffect } from 'react';

export default function TransactionHistoryCard() {
    const [transactions, setTransactions] = useState<TransactionRecord[]>(() => getTransactions());

    const loadTransactions = () => {
        setTransactions(getTransactions());
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'caracoles_transactions') {
                loadTransactions();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const getStatusIcon = (status: TransactionRecord['status']) => {
        switch (status) {
            case 'approved':
                return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
            case 'rejected':
                return <FontAwesomeIcon icon={faXmark} className="text-red-500" />;
            case 'error':
                return <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: TransactionRecord['status']) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'error':
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                Historial de recargas
            </h2>

            {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <FontAwesomeIcon icon={faClock} className="text-3xl mb-2 opacity-50" />
                    <p>No hay recargas aún</p>
                    <p className="text-sm mt-1">Tu historial aparecerá aquí después de realizar una recarga</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-400">Fecha</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-400">Referencia</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-400">Tarjeta</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-400">Monto</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-400">Estado</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-400">Detalle</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-400">Código Auth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-600">{formatDate(tx.date)}</td>
                                    <td className="py-3 px-4 text-gray-600 font-mono">{tx.reference || '-'}</td>
                                    <td className="py-3 px-4 text-gray-600 font-mono">{tx.cardNumberMasked}</td>
                                    <td className="py-3 px-4 text-right font-semibold text-gray-800">
                                        ${(tx.amount ?? 0).toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                                            {getStatusIcon(tx.status)}
                                            <span className="ml-1 capitalize">{tx.status}</span>
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{tx.statusDetail}</td>
                                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                                        {tx.authorizationCode || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}