export class EntityError extends Error {
  property?: string;
  constructor(message: string, property?: string) {
    super(message);
    this.property = property;
  }
}
