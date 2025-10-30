import { z } from "zod";

const bool = z
  .enum(["true", "false", "1", "0"], {
    errorMap: () => ({ message: "Expected a boolean-like string" }),
  })
  .transform((value) => value === "true" || value === "1");

const envSchema = z.object({
  BINANCE_API_KEY: z.string().optional(),
  BINANCE_API_SECRET: z.string().optional(),
  BINANCE_INITIAL_EQUITY: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : 0))
    .pipe(z.number().nonnegative().default(0)),
  BINANCE_ACCOUNT_TYPE: z
    .enum(["futures", "spot"])
    .default("futures")
    .transform((value) => value),
  BINANCE_REST_URL: z.string().default("https://fapi.binance.com"),
  BINANCE_WS_URL: z.string().default("wss://fstream.binance.com"),
  DASHBOARD_MOCK_MODE: bool.default(false),
});

export const env = envSchema.parse({
  BINANCE_API_KEY: process.env.BINANCE_API_KEY,
  BINANCE_API_SECRET: process.env.BINANCE_API_SECRET,
  BINANCE_INITIAL_EQUITY: process.env.BINANCE_INITIAL_EQUITY,
  BINANCE_ACCOUNT_TYPE: process.env.BINANCE_ACCOUNT_TYPE,
  BINANCE_REST_URL: process.env.BINANCE_REST_URL,
  BINANCE_WS_URL: process.env.BINANCE_WS_URL,
  DASHBOARD_MOCK_MODE: process.env.DASHBOARD_MOCK_MODE,
});

export type Env = typeof env;
