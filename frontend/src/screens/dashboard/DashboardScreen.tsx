import { useSaldo } from '@/context/useSaldo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { DoughnutChart, BarChartVictories } from '@/components/dashboard';
import { SaldoCard } from '@/components/saldos';

export default function DashboardScreen() {
    const { saldo, totalApuestas, apuestasGanadas, apuestasPerdidas } = useSaldo();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-400 mt-1">Resumen de tu cuenta</p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Card Saldo */}
                <SaldoCard saldo={saldo} />

                {/* Card Total de apuestas */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faChartBar} className="text-blue-500 text-xl" />
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Total de apuestas</p>
                            <p className="text-2xl font-bold text-gray-800">{totalApuestas}</p>
                        </div>
                    </div>
                </div>

                <DoughnutChart apuestasGanadas={apuestasGanadas} apuestasPerdidas={apuestasPerdidas} />

                <BarChartVictories />
            </div>
        </div>
    );
}