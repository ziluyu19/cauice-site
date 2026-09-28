import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const sourcePath =
    "C:/Users/lucia/.gemini/antigravity/brain/9f27260c-98db-4113-939b-257d6a99b87d/.user_uploaded/media_1790067483912.png";
  const destPath = path.join(process.cwd(), "public", "logo.png");

  try {
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(sourcePath, destPath);
    }
  } catch (e) {
    console.error("Failed to copy logo to public:", e);
  }

  try {
    const fileBuffer = fs.readFileSync(sourcePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
