import { NextResponse } from "next/server";
import { binanceService } from "@/lib/binance/service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const listenKey = await binanceService.createListenKey();
    return NextResponse.json({ listenKey });
  } catch (error) {
    console.error("[listen-key] Failed to create listen key", error);
    return NextResponse.json(
      { error: "Failed to create listen key" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const listenKey = body?.listenKey;

    if (!listenKey || typeof listenKey !== "string") {
      return NextResponse.json(
        { error: "listenKey is required" },
        { status: 400 },
      );
    }

    await binanceService.keepAliveListenKey(listenKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[listen-key] Failed to refresh listen key", error);
    return NextResponse.json(
      { error: "Failed to refresh listen key" },
      { status: 500 },
    );
  }
}
