export class Amount {
  private readonly value: number;

  constructor(value: number) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error('Monto debe ser mayor a cero');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }
}