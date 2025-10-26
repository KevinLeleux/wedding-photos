import { r2 } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Key parameter is required" },
        { status: 400 }
      );
    }

    // Récupérer l'image depuis R2
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    const response = await r2.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Convertir le stream en buffer
    const buffer = await response.Body.transformToByteArray();

    // Convertir le buffer en Blob pour NextResponse
    const blob = new Blob([new Uint8Array(buffer)], {
      type: response.ContentType || "image/jpeg",
    });

    // Retourner l'image avec les bons headers pour le téléchargement
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": response.ContentType || "image/jpeg",
        "Content-Disposition": `attachment; filename="${key}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement" },
      { status: 500 }
    );
  }
}

export { GET };
