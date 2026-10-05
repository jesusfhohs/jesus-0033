import { z } from 'zod';

export const chargeSchema = z.object({
  body: z.object({
    cardNumber: z.string().refine(
      (val) => val.replace(/\s/g, '').length === 16,
      'Tarjeta debe tener 16 dígitos'
    ),
    expiration: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato mm/YY'),
    cvv: z.string().min(1, 'CVV requerido'),
    cardholderName: z.string().min(1, 'Nombre requerido'),
    amount: z.number().positive('Monto debe de ser mayor a 0'),
    payerId: z.string().uuid(),
    payerEmail: z.string().email(),
  }),
});

export type ChargeInput = z.infer<typeof chargeSchema.shape.body>;