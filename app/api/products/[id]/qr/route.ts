import QRCode from "qrcode";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${base.replace(/\/$/, "")}/verify/${id}`;

  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: 320,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  return new NextResponse(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
