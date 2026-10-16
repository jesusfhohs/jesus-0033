import { CardNumber } from '../value-objects/CardNumber';
import { ExpirationDate } from '../value-objects/ExpirationDate';
import { CVV } from '../value-objects/CVV';
import { Amount } from '../value-objects/Amount';

export interface ChargeProps {
  id: string;
  cardNumber: CardNumber;
  expirationDate: ExpirationDate;
  cvv: CVV;
  cardholderName: string;
  amount: Amount;
  payerId: string;
  payerEmail: string;
  status: 'approved' | 'rejected' | 'error';
  statusDetail: string;
  authorizationCode?: string;
  reference: string;
  dateCreated: Date;
}

export class Charge {
  private props: ChargeProps;

  private constructor(props: ChargeProps) {
    this.props = props;
  }

  static create(props: Omit<ChargeProps, 'id' | 'dateCreated'> & { id?: string }): Charge {
    return new Charge({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      dateCreated: new Date(),
    });
  }

  getId(): string {
    return this.props.id;
  }

  getCardNumber(): CardNumber {
    return this.props.cardNumber;
  }

  getExpirationDate(): ExpirationDate {
    return this.props.expirationDate;
  }

  getCVV(): CVV {
    return this.props.cvv;
  }

  getCardholderName(): string {
    return this.props.cardholderName;
  }

  getAmount(): Amount {
    return this.props.amount;
  }

  getPayerId(): string {
    return this.props.payerId;
  }

  getPayerEmail(): string {
    return this.props.payerEmail;
  }

  getStatus(): 'approved' | 'rejected' | 'error' {
    return this.props.status;
  }

  getStatusDetail(): string {
    return this.props.statusDetail;
  }

  getAuthorizationCode(): string | undefined {
    return this.props.authorizationCode;
  }

  getReference(): string {
    return this.props.reference;
  }

  getDateCreated(): Date {
    return this.props.dateCreated;
  }

  toResponse(): {
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
  } {
    return {
      id: this.props.id,
      status: this.props.status,
      status_detail: this.props.statusDetail,
      transaction_amount: this.props.amount.getValue(),
      date_created: this.props.dateCreated.toISOString(),
      authorization_code: this.props.authorizationCode,
      reference: this.props.reference,
      payer_id: this.props.payerId,
      payer_email: this.props.payerEmail,
      card_number: this.props.cardNumber.getMasked(),
      cvv: this.props.cvv.getValue(),
    };
  }
}