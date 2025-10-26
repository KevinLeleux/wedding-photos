"use client";

import { ImageData, ImageWithDimensions } from "@/types/image";
import { Card, Center, Grid, Loader, Stack, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import ImageModal from "./components/ImageModal";
import Pagination from "./components/Pagination";

export default function Home() {
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedImage, setSelectedImage] =
    useState<ImageWithDimensions | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<{
    total: number;
    totalPages: number;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["images", currentPage, itemsPerPage],
    queryFn: async () => {
      const response = await fetch(
        `/api/images?page=${currentPage}&limit=${itemsPerPage}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des images");
      }
      const data = await response.json();

      const imagesWithDimensions = await Promise.all(
        data.images.map(async (image: ImageData) => {
          return new Promise<ImageWithDimensions>((resolve) => {
            const img = new window.Image();
            img.onload = () => {
              resolve({
                ...image,
                width: img.naturalWidth,
                height: img.naturalHeight,
                isHorizontal: img.naturalWidth > img.naturalHeight,
              });
            };
            img.onerror = () => {
              resolve({
                ...image,
                width: 400,
                height: 400,
                isHorizontal: false,
              });
            };
            img.src = image.url;
          });
        })
      );

      return {
        images: imagesWithDimensions,
        paginationData: {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev,
        },
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // Mettre à jour les informations de pagination quand les données changent
  useEffect(() => {
    if (data?.paginationData) {
      setPaginationInfo({
        total: data.paginationData.total,
        totalPages: data.paginationData.totalPages,
      });
    }
  }, [data?.paginationData]);

  const handlePageChange = useCallback((page: number) => {
    // Mettre à jour immédiatement la page courante
    setCurrentPage(page);

    // Vérifier si on a déjà cette page en cache

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openModal = useCallback((image: ImageWithDimensions) => {
    setSelectedImage(image);
    setModalOpened(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpened(false);
    setSelectedImage(null);
  }, []);

  const downloadImage = useCallback(async () => {
    if (!selectedImage) return;

    try {
      const downloadUrl = `/api/images/download?key=${encodeURIComponent(
        selectedImage.key
      )}`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = selectedImage.key;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(selectedImage.url, "_blank");
    }
  }, [selectedImage]);

  // Navigation entre les images
  const navigateToImage = useCallback(
    (imageIndex: number) => {
      if (data && imageIndex >= 0 && imageIndex < data.images.length) {
        const newImage = data.images[imageIndex];
        setSelectedImage(newImage);
        setModalOpened(true);
      }
    },
    [data]
  );

  const goToPreviousImage = useCallback(() => {
    if (!selectedImage || !data) return;
    const currentIndex = data.images.findIndex(
      (img) => img.key === selectedImage.key
    );
    if (currentIndex > 0) {
      navigateToImage(currentIndex - 1);
    }
  }, [selectedImage, data, navigateToImage]);

  const goToNextImage = useCallback(() => {
    if (!selectedImage || !data) return;
    const currentIndex = data.images.findIndex(
      (img) => img.key === selectedImage.key
    );
    if (currentIndex < data.images.length - 1) {
      navigateToImage(currentIndex + 1);
    }
  }, [selectedImage, data, navigateToImage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!modalOpened || !selectedImage) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          goToPreviousImage();
          break;
        case "ArrowRight":
          event.preventDefault();
          goToNextImage();
          break;
        case "Escape":
          event.preventDefault();
          closeModal();
          break;
      }
    };

    if (modalOpened) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [
    modalOpened,
    selectedImage,
    goToPreviousImage,
    goToNextImage,
    closeModal,
  ]);

  return (
    <Stack h="100vh">
      <Stack py="xl">
        <Title
          ta="center"
          order={1}
          mb="sm">
          Notre mariage - Émilie & Kevin
        </Title>
        {paginationInfo && paginationInfo.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginationInfo.totalPages}
            totalItems={paginationInfo.total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        )}
        {isLoading ? (
          <Center h="50vh">
            <Loader size="lg" />
          </Center>
        ) : (
          <Grid
            gutter="lg"
            justify="center"
            mx="auto"
            maw="1600px">
            {data?.images.map((image) => (
              <Grid.Col
                key={image.key}
                span={
                  image.isHorizontal
                    ? { base: 12, md: 8, lg: 5 }
                    : { base: 12, md: 4, lg: 3.5 }
                }>
                <Card
                  p={0}
                  shadow="md">
                  <Image
                    onClick={() => openModal(image)}
                    src={image.url}
                    alt={image.key}
                    width={image.isHorizontal ? 500 : 400}
                    height={image.isHorizontal ? 333 : 400}
                    style={{
                      cursor: "pointer",
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      objectFit: "cover",
                      maxHeight: image.isHorizontal ? "400px" : "400px",
                    }}
                    quality={40}
                  />
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {paginationInfo && paginationInfo.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginationInfo.totalPages}
            totalItems={paginationInfo.total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        )}
      </Stack>

      <ImageModal
        opened={modalOpened}
        onClose={closeModal}
        image={selectedImage}
        onDownload={downloadImage}
        onPrevious={goToPreviousImage}
        onNext={goToNextImage}
        hasPrevious={
          selectedImage && data
            ? data.images.findIndex((img) => img.key === selectedImage.key) > 0
            : false
        }
        hasNext={
          selectedImage && data
            ? data.images.findIndex((img) => img.key === selectedImage.key) <
              data.images.length - 1
            : false
        }
      />
    </Stack>
  );
}
