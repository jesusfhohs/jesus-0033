import { useFormik } from 'formik';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { type RecargarSaldoFormData, validateRecargarSaldo } from './snailpay.validation';
import { processCharge, type ChargeResult } from '@/api/snailpay';
import { saveTransaction } from '@/utils/transactionHistory';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import type { FocusEvent } from 'react';

interface RecargarSaldoFormProps {
    onSuccess: (amount: number) => void;
    onClose: () => void;
}

export default function RecargarSaldoForm({ onSuccess, onClose }: RecargarSaldoFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof RecargarSaldoFormData, string>>>({});

    const formik = useFormik<RecargarSaldoFormData>({
        initialValues: {
            cardNumber: '',
            expiration: '',
            cvv: '',
            cardholderName: '',
            amount: 0,
        },
        onSubmit: async (values: RecargarSaldoFormData) => {
            const validationErrors = validateRecargarSaldo(values);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                formik.setTouched({
                    cardNumber: true,
                    expiration: true,
                    cvv: true,
                    cardholderName: true,
                    amount: true,
                });
                return;
            }

            setErrors({});
            setIsSubmitting(true);
            try {
                const result: ChargeResult = await processCharge(values);

                const transaction = {
                    id: result.data.id,
                    date: result.data.dateCreated,
                    amount: result.data.transactionAmount,
                    status: result.data.status,
                    statusDetail: result.data.statusDetail,
                    reference: result.data.reference,
                    authorizationCode: result.data.authorizationCode,
                    cardNumberMasked: result.data.cardNumber,
                };
                saveTransaction(transaction);

                if (result.success) {
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Pago aprobado. Saldo actualizado.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        background: '#ffffff',
                        color: '#212529',
                    });
                    onSuccess(result.data.transactionAmount);
                    onClose();
                    formik.resetForm();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: result.data.statusDetail,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        background: '#ffffff',
                        color: '#212529',
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error instanceof Error ? error.message : 'Error al procesar el pago',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    background: '#ffffff',
                    color: '#212529',
                });
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        const groups = digits.match(/.{1,4}/g) || [];
        return groups.join(' ');
    };

    const formatExpiration = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        }
        return digits;
    };

    const formatCVV = (value: string) => {
        return value.replace(/\D/g, '').slice(0, 3);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        formik.handleBlur(e);
    };

    const getError = (fieldName: keyof RecargarSaldoFormData) => {
        return formik.touched[fieldName] && errors[fieldName] ? errors[fieldName] : undefined;
    };

    const handleChange = (fieldName: keyof RecargarSaldoFormData, formatter?: (value: string) => string | number) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            let value: string | number = e.target.value;
            if (formatter) value = formatter(value);
            formik.setFieldValue(fieldName, value);
            if (errors[fieldName]) {
                setErrors(prev => ({ ...prev, [fieldName]: undefined }));
            }
        };
    };

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            <Input
                label="Número de tarjeta"
                placeholder="1234 5678 9012 3456"
                name="cardNumber"
                value={formik.values.cardNumber}
                onChange={handleChange('cardNumber', formatCardNumber)}
                onBlur={handleBlur}
                error={getError('cardNumber')}
                disabled={isSubmitting}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Fecha vencimiento (mm/YY)"
                    placeholder="12/26"
                    name="expiration"
                    value={formik.values.expiration}
                    onChange={handleChange('expiration', formatExpiration)}
                    onBlur={handleBlur}
                    error={getError('expiration')}
                    disabled={isSubmitting}
                />
                <Input
                    label="CVV"
                    type="password"
                    placeholder="***"
                    name="cvv"
                    value={formik.values.cvv}
                    onChange={handleChange('cvv', formatCVV)}
                    onBlur={handleBlur}
                    error={getError('cvv')}
                    disabled={isSubmitting}
                />
            </div>

            <Input
                label="Nombre Completo"
                placeholder="Nombre Completo"
                name="cardholderName"
                value={formik.values.cardholderName}
                onChange={formik.handleChange}
                onBlur={handleBlur}
                error={getError('cardholderName')}
                disabled={isSubmitting}
            />

            <Input
                label="Monto a recargar"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                name="amount"
                value={formik.values.amount}
                onChange={handleChange('amount', (v) => parseFloat(v) || 0)}
                onBlur={handleBlur}
                error={getError('amount')}
                disabled={isSubmitting}
            />

            <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isSubmitting}
            >
                Recargar Saldo
            </Button>
        </form>
    );
}