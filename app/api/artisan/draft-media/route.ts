import { uploadArtisanDraftBlob } from "@/lib/storage";
import { getVerifiedUserId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = await getVerifiedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Expected non-empty file" }, { status: 400 });
  }

  try {
    const { url, mediaType } = await uploadArtisanDraftBlob({
      file,
      userId,
    });
    return NextResponse.json({ url, mediaType });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    const status =
      message.includes("not set") || message.includes("BLOB_READ_WRITE_TOKEN") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
