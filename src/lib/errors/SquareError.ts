export default class SquareError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SquareError';
  }
}
