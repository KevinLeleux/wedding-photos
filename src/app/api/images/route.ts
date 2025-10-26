import { r2 } from "@/lib/r2";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Validation des paramètres
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 images par page

    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    const allImages: Array<{
      Key?: string;
      Size?: number;
      LastModified?: Date;
    }> = [];
    let continuationToken: string | undefined;
    let totalImages = 0;

    // D'abord, récupérons le nombre total d'images
    do {
      const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME!,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      });

      const response = await r2.send(command);

      const pageImages =
        response.Contents?.filter(
          (item) =>
            item.Key &&
            imageExtensions.some((ext) => item.Key!.toLowerCase().endsWith(ext))
        ) || [];

      allImages.push(...pageImages);
      totalImages += pageImages.length;

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Trier les images par nom de fichier pour un ordre cohérent
    allImages.sort((a, b) => {
      if (a.Key && b.Key) {
        return a.Key.localeCompare(b.Key);
      }
      return 0;
    });

    // Calcul de la pagination
    const totalPages = Math.ceil(totalImages / validatedLimit);
    const startIndex = (validatedPage - 1) * validatedLimit;
    const endIndex = startIndex + validatedLimit;

    // Récupération des images pour la page demandée
    const pageImages = allImages.slice(startIndex, endIndex).map((item) => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `${process.env.R2_PUBLIC_URL}/${item.Key}`,
    }));

    console.log(
      `Page ${validatedPage}/${totalPages} - Récupération de ${pageImages.length} images sur ${totalImages} totales`
    );

    return NextResponse.json({
      images: pageImages,
      total: totalImages,
      page: validatedPage,
      limit: validatedLimit,
      totalPages,
      hasNext: validatedPage < totalPages,
      hasPrev: validatedPage > 1,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des images:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les images" },
      { status: 500 }
    );
  }
}

export { GET };
