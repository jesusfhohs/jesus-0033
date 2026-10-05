import { CardNumber } from '@/modules/snailpay/domain/value-objects/CardNumber';
import { ExpirationDate } from '@/modules/snailpay/domain/value-objects/ExpirationDate';
import { CVV } from '@/modules/snailpay/domain/value-objects/CVV';
import { Amount } from '@/modules/snailpay/domain/value-objects/Amount';
import { Charge } from '@/modules/snailpay/domain/entities/Charge';
import type { SnailPayConfigPort } from '@/modules/snailpay/domain/ports/SnailPayConfigPort';

export interface ProcessChargeInput {
  cardNumber: string;
  expiration: string;
  cvv: string; // base64 encoded
  cardholderName: string;
  amount: number;
  payerId: string;
  payerEmail: string;
}

export interface ProcessChargeOutput {
  id: string;
  status: 'approved' | 'rejected' | 'error';
  status_detail: string;
  transaction_amount: number;
  date_created: string;
  authorization_code?: string;
  reference: string;
  payer_id: string;
  payer_email: string;
  card_number: string;
  cvv: string; // base64 encoded
}

function generateAuthCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PA-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function maskCardNumber(raw: string): string {
  const clean = raw.replace(/\s/g, '');
  return `**** **** **** ${clean.slice(-4)}`;
}

function decodeBase64CVV(base64: string): string {
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch {
    throw new Error('CVV inválido');
  }
}

export class ProcessChargeUseCase {
  private readonly configPort: SnailPayConfigPort;

  constructor(configPort: SnailPayConfigPort) {
    this.configPort = configPort;
  }

  async execute(input: ProcessChargeInput): Promise<ProcessChargeOutput> {
    const config = this.configPort.getConfig();

    if (!config.snailpay_enabled) {
      return this.buildErrorResponse(input, 'Sistema de pagos no disponible', 'error');
    }

    let decodedCVV: string;
    try {
      decodedCVV = decodeBase64CVV(input.cvv);
    } catch {
      return this.buildErrorResponse(input, 'CVV inválido', 'rejected');
    }

    let cardNumberVO: CardNumber;
    let expirationVO: ExpirationDate;
    let cvvVO: CVV;
    let amountVO: Amount;

    try {
      cardNumberVO = new CardNumber(input.cardNumber);
    } catch {
      return this.buildErrorResponse(input, 'Número de tarjeta inválido', 'rejected');
    }

    try {
      expirationVO = new ExpirationDate(input.expiration);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Formato de fecha inválido';
      return this.buildErrorResponse(input, msg, 'rejected');
    }

    try {
      cvvVO = new CVV(decodedCVV);
    } catch {
      return this.buildErrorResponse(input, 'CVV inválido (3 dígitos requeridos)', 'rejected');
    }

    try {
      amountVO = new Amount(input.amount);
    } catch {
      return this.buildErrorResponse(input, 'Monto debe ser mayor a cero', 'rejected');
    }

    const matchedCard = config.test_cards.find(
      (card) =>
        cardNumberVO.getValue() === card.number &&
        expirationVO.getValue() === card.expiration &&
        cvvVO.getValue() === card.cvv
    );

    if (!matchedCard) {
      return this.buildErrorResponse(input, 'Datos de tarjeta inválidos', 'rejected');
    }

    const cardLimit = matchedCard.amount;
    if (cardLimit !== '' && input.amount > Number(cardLimit)) {
      return this.buildErrorResponse(input, 'Saldo Insuficiente', 'rejected');
    }

    const charge = Charge.create({
      cardNumber: cardNumberVO,
      expirationDate: expirationVO,
      cvv: cvvVO,
      cardholderName: input.cardholderName,
      amount: amountVO,
      payerId: input.payerId,
      payerEmail: input.payerEmail,
      status: 'approved',
      statusDetail: 'Pago aprobado',
      authorizationCode: generateAuthCode(),
      reference: generateReference(),
    });

    const response = charge.toResponse();
    return {
      ...response,
      cvv: input.cvv, // Devolver el CVV en base64 original
    };
  }

  private buildErrorResponse(
    input: ProcessChargeInput,
    statusDetail: string,
    status: 'rejected' | 'error'
  ): ProcessChargeOutput {
    return {
      id: crypto.randomUUID(),
      status,
      status_detail: statusDetail,
      transaction_amount: Number.isFinite(input.amount) && input.amount > 0 ? input.amount : 0,
      date_created: new Date().toISOString(),
      reference: generateReference(),
      payer_id: input.payerId,
      payer_email: input.payerEmail,
      card_number: maskCardNumber(input.cardNumber),
      cvv: input.cvv,
    };
  }
}