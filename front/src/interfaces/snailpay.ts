export interface ChargeRequest {
  cardNumber: string;
  expiration: string;
  cvv: string;
  cardholderName: string;
  amount: number;
}

export interface ChargeResponse {
  id: string;
  status: 'approved' | 'rejected' | 'error';
  statusDetail: string;
  transactionAmount: number;
  dateCreated: string;
  authorizationCode?: string;
  reference: string;
  payerId: string;
  payerEmail: string;
  cardNumber: string;
  cvv: string;
}

export interface TransactionRecord {
  id: string;
  date: string;
  amount: number;
  status: 'approved' | 'rejected' | 'error';
  statusDetail: string;
  reference?: string;
  authorizationCode?: string;
  cardNumberMasked: string;
}