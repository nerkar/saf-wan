import QRCode from "qrcode";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ productId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { productId } = await params;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${base.replace(/\/$/, "")}/verify/${productId}`;

  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: 320,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
