/** @vercel-platform qr — encodes NEXT_PUBLIC_APP_URL/verify/… via getProductVerificationUrl */
import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getProductVerificationUrl } from "@/lib/verification-url";

type Params = { params: Promise<{ productId: string }> };

/**
 * QR image for a product. Encodes getProductVerificationUrl(productId).
 *
 * - Default: PNG (`Content-Type: image/png`)
 * - `?format=svg`: SVG (`Content-Type: image/svg+xml`)
 */
export async function GET(request: Request, { params }: Params) {
  const { productId } = await params;
  const targetUrl = getProductVerificationUrl(productId);
  const format = new URL(request.url).searchParams.get("format");

  if (format === "svg") {
    const svg = await QRCode.toString(targetUrl, {
      type: "svg",
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const png = await QRCode.toBuffer(targetUrl, {
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
