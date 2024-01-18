import pino, { LoggerOptions } from "pino";

// https://github.com/pinojs/pino/blob/master/docs/api.md#pinooptions-destination--logger
const options: LoggerOptions = {
  browser: {
    asObject: true,
  },
  // "silent" to disable logging
  level: "info",
};

const logger = pino(options);

export default logger;
