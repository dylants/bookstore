import { Client, Environment } from 'square';

const squareClientSingleton = () => {
  return new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox,
  });
};

declare global {
  // eslint-disable-next-line no-var
  var square: undefined | ReturnType<typeof squareClientSingleton>;
}

const square = globalThis.square ?? squareClientSingleton();

export default square;

if (process.env.NODE_ENV !== 'production') globalThis.square = square;
