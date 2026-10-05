import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProcessChargeUseCase } from '@/modules/snailpay/application/process-charge';
import type { ProcessChargeInput } from '@/modules/snailpay/application/process-charge';
import type { SnailPayConfigPort } from '@/modules/snailpay/domain/ports/SnailPayConfigPort';
import type { SnailPayConfig } from '@/config/snailpay';

const FIXED_DATE = '2026-06-15T12:00:00.000Z';

const CONFIG: SnailPayConfig = {
  snailpay_enabled: true,
  test_cards: [
    { number: '1234123412341234', expiration: '12/26', cvv: '543', amount: '' },
    { number: '1554155415541554', expiration: '11/26', cvv: '456', amount: '100' },
  ],
};

const DISABLED_CONFIG: SnailPayConfig = { ...CONFIG, snailpay_enabled: false };

class FakeConfigAdapter implements SnailPayConfigPort {
  private readonly config: SnailPayConfig;

  constructor(config: SnailPayConfig) {
    this.config = config;
  }

  getConfig(): SnailPayConfig {
    return this.config;
  }
}

function createUseCase(config: SnailPayConfig): ProcessChargeUseCase {
  return new ProcessChargeUseCase(new FakeConfigAdapter(config));
}

function buildInput(overrides: Partial<ProcessChargeInput> = {}): ProcessChargeInput {
  return {
    cardNumber: '1234 1234 1234 1234',
    expiration: '12/26',
    cvv: Buffer.from('543', 'utf-8').toString('base64'),
    cardholderName: 'Juan Perez',
    amount: 100,
    payerId: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    payerEmail: 'juan@example.com',
    ...overrides,
  };
}

const LIMITED_CARD = {
  cardNumber: '1554 1554 1554 1554',
  expiration: '11/26',
  cvv: Buffer.from('456', 'utf-8').toString('base64'),
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(FIXED_DATE));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ProcessChargeUseCase - recarga del monto enviado desde el front', () => {
  it('aprueba la recarga y devuelve exactamente el monto que envió el usuario', async () => {
    const result = await createUseCase(CONFIG).execute(buildInput({ amount: 250.5 }));

    expect(result.status).toBe('approved');
    expect(result.status_detail).toBe('Pago aprobado');
    expect(result.transaction_amount).toBe(250.5);
    expect(result.payer_id).toBe('3f2504e0-4f89-11d3-9a0c-0305e82c3301');
    expect(result.payer_email).toBe('juan@example.com');
  });

  it.each([0.01, 1234.56, 99999.99])('conserva el monto %s con sus centavos', async (amount) => {
    const result = await createUseCase(CONFIG).execute(buildInput({ amount }));

    expect(result.status).toBe('approved');
    expect(result.transaction_amount).toBe(amount);
  });

  it('devuelve el monto como primer dato del cargo aprobado', async () => {
    const result = await createUseCase(CONFIG).execute(buildInput({ amount: 40.75 }));

    expect(result.id).toBeTruthy();
    expect(result.card_number).toBe('**** **** **** 1234');
    expect(result.reference).toMatch(/^PA-[A-Z0-9]{6}$/);
    expect(result.authorization_code).toMatch(/^[A-Z0-9]{6}$/);
    expect(result.date_created).toBe(FIXED_DATE);
    expect(result.cvv).toBe(Buffer.from('543', 'utf-8').toString('base64'));
  });

  it('respeta el límite de la tarjeta de prueba', async () => {
    const aprobado = await createUseCase(CONFIG).execute(buildInput({ ...LIMITED_CARD, amount: 100 }));

    expect(aprobado.status).toBe('approved');
    expect(aprobado.transaction_amount).toBe(100);
  });

  it('rechaza el monto que supera el límite de la tarjeta de prueba', async () => {
    const result = await createUseCase(CONFIG).execute(buildInput({ ...LIMITED_CARD, amount: 100.01 }));

    expect(result.status).toBe('rejected');
    expect(result.status_detail).toBe('Saldo Insuficiente');
    expect(result.transaction_amount).toBe(100.01);
    expect(result.authorization_code).toBeUndefined();
  });

  it.each([0, -50, NaN])('rechaza el monto %s sin lanzar excepción', async (amount) => {
    await expect(createUseCase(CONFIG).execute(buildInput({ amount }))).resolves.toMatchObject({
      status: 'rejected',
      status_detail: 'Monto debe ser mayor a cero',
      transaction_amount: 0,
    });
  });

  it('rechaza un número de tarjeta inválido sin lanzar excepción', async () => {
    const result = await createUseCase(CONFIG).execute(buildInput({ cardNumber: '4111' }));

    expect(result.status).toBe('rejected');
    expect(result.status_detail).toBe('Número de tarjeta inválido');
    expect(result.transaction_amount).toBe(100);
    expect(result.card_number).toBe('**** **** **** 4111');
  });

  it('normaliza el número de tarjeta con espacios que envía el front', async () => {
    const result = await createUseCase(CONFIG).execute(
      buildInput({ cardNumber: '1234 1234 1234 1234', amount: 10 })
    );

    expect(result.status).toBe('approved');
    expect(result.card_number).toBe('**** **** **** 1234');
  });

  it('rechaza un formato de vencimiento inválido', async () => {
    const result = await createUseCase(CONFIG).execute(buildInput({ expiration: '13/26' }));

    expect(result.status).toBe('rejected');
    expect(result.status_detail).toBe('Formato de fecha inválido (mm/YY)');
  });

  it('rechaza una tarjeta vencida', async () => {
    const result = await createUseCase(CONFIG).execute(buildInput({ expiration: '01/20' }));

    expect(result.status).toBe('rejected');
    expect(result.status_detail).toBe('Tarjeta expirada');
  });

  it.each(['999', '544'])('rechaza el CVV %s que no coincide con la configuración', async (cvv) => {
    const result = await createUseCase(CONFIG).execute(
      buildInput({ cvv: Buffer.from(cvv, 'utf-8').toString('base64') })
    );

    expect(result.status).toBe('rejected');
    expect(result.status_detail).toBe('Datos de tarjeta inválidos');
  });

  it('rechaza un CVV que no tenga 3 dígitos', async () => {
    const result = await createUseCase(CONFIG).execute(
      buildInput({ cvv: Buffer.from('54', 'utf-8').toString('base64') })
    );

    expect(result.status).toBe('rejected');
    expect(result.status_detail).toBe('CVV inválido (3 dígitos requeridos)');
  });

  it('devuelve error cuando el sistema de pagos está deshabilitado', async () => {
    const result = await createUseCase(DISABLED_CONFIG).execute(buildInput({ amount: 300 }));

    expect(result.status).toBe('error');
    expect(result.status_detail).toBe('Sistema de pagos no disponible');
    expect(result.transaction_amount).toBe(300);
  });
});
