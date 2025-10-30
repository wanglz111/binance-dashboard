import crypto from "crypto";
import { env } from "@/lib/env";

const DEFAULT_RECV_WINDOW = 10_000;

export type HttpMethod = "GET" | "POST" | "DELETE" | "PUT";

type QueryValue = string | number | boolean | undefined | null;

export class BinanceRestClient {
  private readonly apiKey?: string;
  private readonly apiSecret?: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = env.BINANCE_API_KEY;
    this.apiSecret = env.BINANCE_API_SECRET;
    this.baseUrl = env.BINANCE_REST_URL;
  }

  private ensureCredentials() {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error(
        "Missing Binance API credentials. Please set BINANCE_API_KEY and BINANCE_API_SECRET environment variables.",
      );
    }
  }

  async signedFetch<T>(
    path: string,
    params: Record<string, QueryValue> = {},
    method: HttpMethod = "GET",
    init?: RequestInit,
  ): Promise<T> {
    this.ensureCredentials();

    const timestamp = Date.now();
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      searchParams.append(key, String(value));
    }

    searchParams.append("recvWindow", String(DEFAULT_RECV_WINDOW));
    searchParams.append("timestamp", String(timestamp));

    const signature = this.sign(searchParams.toString());
    searchParams.append("signature", signature);

    const url = `${this.baseUrl}${path}?${searchParams.toString()}`;

    const response = await fetch(url, {
      method,
      headers: {
        "X-MBX-APIKEY": this.apiKey!,
      },
      ...init,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Binance API request failed (${response.status}): ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async keyedFetch<T>(
    path: string,
    method: HttpMethod = "POST",
    params: Record<string, QueryValue> = {},
  ): Promise<T> {
    this.ensureCredentials();

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      searchParams.append(key, String(value));
    }

    const queryString =
      searchParams.size > 0 ? `?${searchParams.toString()}` : "";

    const url = `${this.baseUrl}${path}${queryString}`;

    const response = await fetch(url, {
      method,
      headers: {
        "X-MBX-APIKEY": this.apiKey!,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Binance API request failed (${response.status}): ${errorText}`,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  async publicFetch<T>(
    path: string,
    params: Record<string, QueryValue> = {},
  ): Promise<T> {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      searchParams.append(key, String(value));
    }

    const url =
      searchParams.size > 0
        ? `${this.baseUrl}${path}?${searchParams.toString()}`
        : `${this.baseUrl}${path}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Binance public API request failed (${response.status}): ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  private sign(payload: string) {
    return crypto
      .createHmac("sha256", this.apiSecret!)
      .update(payload)
      .digest("hex");
  }
}
