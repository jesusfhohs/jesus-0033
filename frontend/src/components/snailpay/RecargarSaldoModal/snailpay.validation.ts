import { z } from 'zod';

export const recargarSaldoSchema = z.object({
    cardNumber: z.string().refine(
        (val) => val.replace(/\s/g, '').length === 16,
        'El número de tarjeta debe tener 16 dígitos'
    ),
    expiration: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato inválido (mm/YY)'),
    cvv: z.string().length(3, 'El CVV debe tener 3 dígitos'),
    cardholderName: z.string().min(1, 'Nombre requerido'),
    amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
});

export type RecargarSaldoFormData = z.infer<typeof recargarSaldoSchema>;

export function validateRecargarSaldo(data: RecargarSaldoFormData): Partial<Record<keyof RecargarSaldoFormData, string>> {
    const result = recargarSaldoSchema.safeParse(data);
    if (result.success) return {};
    const errors: Partial<Record<keyof RecargarSaldoFormData, string>> = {};
    for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof RecargarSaldoFormData;
        if (!errors[path]) errors[path] = issue.message;
    }
    return errors;
}