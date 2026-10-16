export class CVV {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.length !== 3 || !/^\d{3}$/.test(value)) {
      throw new Error('CVV inválido (3 dígitos requeridos)');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CVV): boolean {
    return this.value === other.value;
  }
}