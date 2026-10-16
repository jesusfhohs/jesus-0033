import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '@/api/axiosClient';
import { processCharge } from '@/api/snailpay';
import { getCurrentUser } from '@/api/auth';
import type { ChargeRequest } from '@/interfaces/snailpay';
import type { Usuario } from '@/interfaces/user';

vi.mock('@/api/auth', () => ({
  getCurrentUser: vi.fn(),
}));

const PAYER: Usuario = {
  id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  nombreCompleto: 'Juan Perez',
  email: 'juan@example.com',
  password: '1234',
  saldo: 500,
  totalApuestas: 0,
  apuestasGanadas: 0,
  apuestasPerdidas: 0,
};

function buildChargeRequest(overrides: Partial<ChargeRequest> = {}): ChargeRequest {
  return {
    cardNumber: '1234 1234 1234 1234',
    expiration: '12/26',
    cvv: '543',
    cardholderName: 'Juan Perez',
    amount: 250.5,
    ...overrides,
  };
}

function buildBackendResponse(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'ca2b1f4e-0f1e-4a5e-9a11-000000000001',
    status: 'approved',
    status_detail: 'Pago aprobado',
    transaction_amount: 250.5,
    date_created: '2026-06-15T12:00:00.000Z',
    authorization_code: 'ABC123',
    reference: 'PA-XY7Z2K',
    payer_id: PAYER.id,
    payer_email: PAYER.email,
    card_number: '**** **** **** 1234',
    cvv: 'NTQz',
    ...overrides,
  };
}

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

describe('processCharge - envío de la recarga al back', () => {
  let postSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockedGetCurrentUser.mockReturnValue({ isAuthenticated: true, user: PAYER });
    postSpy = vi.spyOn(axiosClient, 'post');
    postSpy.mockResolvedValue({ data: { done: true, msg: 'Pago aprobado', data: buildBackendResponse() } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hace POST al endpoint de charge de snailpay', async () => {
    await processCharge(buildChargeRequest());

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy.mock.calls[0]?.[0]).toBe('/snailpay/charge');
  });

  it('envía el monto que capturó el usuario, sin modificarlo', async () => {
    await processCharge(buildChargeRequest({ amount: 250.5 }));

    const payload = postSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.amount).toBe(250.5);
  });

  it.each([0.01, 1234.56])('conserva el monto %s con sus centavos', async (amount) => {
    await processCharge(buildChargeRequest({ amount }));

    const payload = postSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.amount).toBe(amount);
  });

  it('codifica el CVV en base64 antes de enviarlo', async () => {
    await processCharge(buildChargeRequest({ cvv: '543' }));

    const payload = postSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.cvv).toBe('NTQz');
  });

  it('envía el id y el email del usuario que está en sesión como pagador', async () => {
    await processCharge(buildChargeRequest());

    const payload = postSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.payerId).toBe(PAYER.id);
    expect(payload.payerEmail).toBe(PAYER.email);
  });

  it('envía los datos de la tarjeta tal como los digita el usuario', async () => {
    await processCharge(buildChargeRequest());

    const payload = postSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).toMatchObject({
      cardNumber: '1234 1234 1234 1234',
      expiration: '12/26',
      cardholderName: 'Juan Perez',
    });
  });

  it('convierte la respuesta snake_case del back a camelCase', async () => {
    const result = await processCharge(buildChargeRequest());

    expect(result.data).toEqual({
      id: 'ca2b1f4e-0f1e-4a5e-9a11-000000000001',
      status: 'approved',
      statusDetail: 'Pago aprobado',
      transactionAmount: 250.5,
      dateCreated: '2026-06-15T12:00:00.000Z',
      authorizationCode: 'ABC123',
      reference: 'PA-XY7Z2K',
      payerId: PAYER.id,
      payerEmail: PAYER.email,
      cardNumber: '**** **** **** 1234',
      cvv: 'NTQz',
    });
  });

  it('marca success y message cuando el back aprueba la recarga', async () => {
    const result = await processCharge(buildChargeRequest());

    expect(result.success).toBe(true);
    expect(result.message).toBe('Pago aprobado');
  });

  it('devuelve success false con el mensaje cuando el back rechaza el pago', async () => {
    postSpy.mockResolvedValue({
      data: {
        done: false,
        msg: 'Saldo Insuficiente',
        data: buildBackendResponse({
          status: 'rejected',
          status_detail: 'Saldo Insuficiente',
          transaction_amount: 300,
          authorization_code: undefined,
        }),
      },
    });

    const result = await processCharge(buildChargeRequest({ amount: 300 }));

    expect(result.success).toBe(false);
    expect(result.message).toBe('Saldo Insuficiente');
    expect(result.data.status).toBe('rejected');
    expect(result.data.transactionAmount).toBe(300);
  });

  it('lanza error y no llama al back cuando no hay sesión', async () => {
    mockedGetCurrentUser.mockReturnValue({ isAuthenticated: false, user: null });

    await expect(processCharge(buildChargeRequest())).rejects.toThrow('Usuario no autenticado');
    expect(postSpy).not.toHaveBeenCalled();
  });
});
