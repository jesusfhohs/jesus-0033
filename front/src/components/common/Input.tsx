import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  	({ className, label, error, id, type = 'text', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = useState(false);

    return (
		<div className="w-full">
			{label && (
			<label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
				{label}
			</label>
			)}
			<div className="relative">
			<input
				ref={ref}
				id={inputId}
				type={isPassword && !showPassword ? 'password' : 'text'}
				className={twMerge(
				clsx(
					'w-full px-4 py-2.5 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12',
					error ? 'border-red-500' : 'border-gray-300',
					className
				)
				)}
				{...props}
			/>
			{isPassword && (
				<button
				type="button"
				onClick={() => setShowPassword(!showPassword)}
				className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
				tabIndex={-1}
				aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
				>
				<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-5 h-5" />
				</button>
			)}
			</div>
			{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
		</div>
    );
});

Input.displayName = 'Input';
export default Input;