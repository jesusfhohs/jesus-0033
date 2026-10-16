export interface ChargeRequest {
  card_number: string;
  expiration: string;
  cvv: string;
  cardholder_name: string;
  amount: number;
  payer_id: string;
  payer_email: string;
}

export interface ChargeResponse {
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
  cvv: string;
}