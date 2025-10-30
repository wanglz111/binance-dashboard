import { NextResponse } from "next/server";
import { binanceService } from "@/lib/binance/service";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function GET() {
  try {
    const payload = await binanceService.getDashboardPayload();

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[dashboard] Failed to fetch dashboard payload", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
      },
      { status: 500 },
    );
  }
}
