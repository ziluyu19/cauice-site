import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const logoPath = path.join(process.cwd(), "public", "logo.png");

  try {
    if (fs.existsSync(logoPath)) {
      const fileBuffer = fs.readFileSync(logoPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (e) {
    console.error("Failed to read logo:", e);
  }

  return new NextResponse("Not Found", { status: 404 });
}
