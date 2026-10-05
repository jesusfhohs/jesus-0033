export class ExpirationDate {
  private readonly value: string;
  private readonly month: number;
  private readonly year: number;

  constructor(value: string) {
    const regex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    const match = value.match(regex);
    if (!match || !match[1] || !match[2]) {
      throw new Error('Formato de fecha inválido (mm/YY)');
    }

    this.month = parseInt(match[1], 10);
    this.year = 2000 + parseInt(match[2], 10);
    this.value = value;

    // Validar que no esté expirada
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (this.year < currentYear || (this.year === currentYear && this.month < currentMonth)) {
      throw new Error('Tarjeta expirada');
    }
  }

  getValue(): string {
    return this.value;
  }

  getMonth(): number {
    return this.month;
  }

  getYear(): number {
    return this.year;
  }

  equals(other: ExpirationDate): boolean {
    return this.value === other.value;
  }
}