import path from "path";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { combine, timestamp, label, printf, prettyPrint } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp as Date);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${timestamp} ${hour}:${minute}:${second} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    label({ label: "Arfatur Rahman" }),
    timestamp(),
    prettyPrint(),
    myFormat,
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        "logs",
        "winston",
        "success",
        "success-%DATE%.log",
      ),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

const errorLogger = createLogger({
  level: "error",
  format: combine(
    label({ label: "Arfatur Rahman" }),
    timestamp(),
    prettyPrint(),
    myFormat,
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        "logs",
        "winston",
        "error",
        "error-%DATE%.log",
      ),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export const Logger = {
  logger,
  errorLogger,
};
