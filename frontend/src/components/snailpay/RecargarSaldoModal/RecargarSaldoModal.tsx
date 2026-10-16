import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import RecargarSaldoForm from './RecargarSaldoForm';

interface RecargarSaldoModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (amount: number) => void;
}

export default function RecargarSaldoModal({ isOpen, onClose, onSuccess }: RecargarSaldoModalProps) {
	if (!isOpen) return null;

	return (
		<>
			<div
				className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
				onClick={onClose}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
			>
				<div
					className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden"
					onClick={(e) => e.stopPropagation()}
					>
					<div className="flex items-center justify-between p-4 border-b border-gray-200">
						<h2 id="modal-title" className="text-lg font-semibold text-gray-800">
						SnailPay 
						</h2>
						<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Cerrar"
						>
						<FontAwesomeIcon icon={faXmark} size="lg" />
						</button>
					</div>
					<div className="p-4">
						<RecargarSaldoForm onSuccess={onSuccess} onClose={onClose} />
					</div>
				</div>
			</div>
		</>
	);
}