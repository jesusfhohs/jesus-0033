export class CardNumber {
  private readonly value: string;

  constructor(value: string) {
    const cleanValue = value.replace(/\s/g, '');
    if (!cleanValue || cleanValue.length !== 16 || !/^\d{16}$/.test(cleanValue)) {
      throw new Error('Número de tarjeta inválido: debe tener 16 dígitos');
    }
    this.value = cleanValue;
  }

  getValue(): string {
    return this.value;
  }

  getMasked(): string {
    return `**** **** **** ${this.value.slice(-4)}`;
  }

  equals(other: CardNumber): boolean {
    return this.value === other.value;
  }
}