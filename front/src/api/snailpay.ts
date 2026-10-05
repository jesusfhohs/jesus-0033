import { axiosClient } from './axiosClient';
import type { ChargeRequest, ChargeResponse } from '@/interfaces/snailpay';
import { encodeCVV } from '@/utils/snailpay';
import { getCurrentUser } from '@/api/auth';

export interface ChargeResult {
  success: boolean;
  data: ChargeResponse;
  message: string;
}

function toCamelCase(obj: Record<string, unknown>): ChargeResponse {
  return {
    id: obj.id as string,
    status: obj.status as 'approved' | 'rejected' | 'error',
    statusDetail: obj.status_detail as string,
    transactionAmount: obj.transaction_amount as number,
    dateCreated: obj.date_created as string,
    authorizationCode: obj.authorization_code as string | undefined,
    reference: obj.reference as string,
    payerId: obj.payer_id as string,
    payerEmail: obj.payer_email as string,
    cardNumber: obj.card_number as string,
    cvv: obj.cvv as string,
  };
}

export async function processCharge(data: ChargeRequest): Promise<ChargeResult> {
  const { user } = getCurrentUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const payload = {
    cardNumber: data.cardNumber,
    expiration: data.expiration,
    cvv: encodeCVV(data.cvv),
    cardholderName: data.cardholderName,
    amount: data.amount,
    payerId: user.id,
    payerEmail: user.email,
  };

  const response = await axiosClient.post<{ done: boolean; msg: string; data: Record<string, unknown> }>(
    '/snailpay/charge',
    payload
  );

  const responseData = response.data;

  return {
    success: responseData.done,
    data: toCamelCase(responseData.data),
    message: responseData.msg,
  };
}