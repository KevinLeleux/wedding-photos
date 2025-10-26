"use client";

import { ImageData, ImageWithDimensions, PaginationData } from "@/types/image";
import { Card, Center, Grid, Loader, Stack, Title } from "@mantine/core";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ImageModal from "./components/ImageModal";
import Pagination from "./components/Pagination";

export default function Home() {
  const [images, setImages] = useState<ImageWithDimensions[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<PaginationData | null>(
    null
  );
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedImage, setSelectedImage] =
    useState<ImageWithDimensions | null>(null);

  const imageCache = useRef<
    Map<
      number,
      { images: ImageWithDimensions[]; paginationData: PaginationData }
    >
  >(new Map());

  const fetchImages = useCallback(
    async (page: number = 1) => {
      try {
        const cachedData = imageCache.current.get(page);
        if (cachedData) {
          const hasDimensions = cachedData.images.every(
            (img) => img.width && img.height && img.isHorizontal !== undefined
          );
          if (hasDimensions) {
            setImages(cachedData.images);
            setPaginationData(cachedData.paginationData);
            setLoading(false);
            return;
          }
        }

        setLoading(true);
        const response = await fetch(
          `/api/images?page=${page}&limit=${itemsPerPage}`
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
                  width: 300,
                  height: 400,
                  isHorizontal: false,
                });
              };
              img.src = image.url;
            });
          })
        );

        setImages(imagesWithDimensions);
        const paginationInfo = {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev,
        };
        setPaginationData(paginationInfo);

        const cacheImages = imagesWithDimensions.map((img) => ({
          ...img,
          width: img.isHorizontal ? 400 : 300,
          height: img.isHorizontal ? 267 : 400,
        }));
        imageCache.current.set(page, {
          images: cacheImages,
          paginationData: paginationInfo,
        });
      } catch (err) {
        console.error("Erreur lors du chargement des images:", err);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    fetchImages(currentPage);
  }, [fetchImages, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    // Mettre à jour immédiatement la page courante
    setCurrentPage(page);

    // Vérifier si on a déjà cette page en cache
    const cachedData = imageCache.current.get(page);
    if (cachedData) {
      // Page en cache - affichage instantané
      setImages(cachedData.images);
      setPaginationData(cachedData.paginationData);
      return;
    }

    // Page pas en cache - activer le loading
    setLoading(true);
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
      if (imageIndex >= 0 && imageIndex < images.length) {
        const newImage = images[imageIndex];
        setSelectedImage(newImage);
        setModalOpened(true);
      }
    },
    [images]
  );

  const goToPreviousImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(
      (img) => img.key === selectedImage.key
    );
    if (currentIndex > 0) {
      navigateToImage(currentIndex - 1);
    }
  }, [selectedImage, images, navigateToImage]);

  const goToNextImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(
      (img) => img.key === selectedImage.key
    );
    if (currentIndex < images.length - 1) {
      navigateToImage(currentIndex + 1);
    }
  }, [selectedImage, images, navigateToImage]);

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

  useEffect(() => {
    imageCache.current.clear();
  }, []);

  return (
    <Stack h="100vh">
      <Stack py="xl">
        <Title
          ta="center"
          order={1}
          mb="sm">
          Notre mariage - Émilie & Kevin
        </Title>
        {paginationData && paginationData.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.total}
            itemsPerPage={paginationData.limit}
            onPageChange={handlePageChange}
            disabled={loading}
          />
        )}
        {loading ? (
          <Center h="50vh">
            <Loader size="lg" />
          </Center>
        ) : (
          <Grid
            gutter="lg"
            justify="center"
            mx="auto"
            maw="1600px">
            {images.map((image) => (
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
                    width={image.isHorizontal ? 400 : 300}
                    height={image.isHorizontal ? 267 : 400}
                    style={{
                      cursor: "pointer",
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      objectFit: "cover",
                      maxHeight: image.isHorizontal ? "400px" : "400px",
                    }}
                    loading="lazy"
                    quality={40}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                  />
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {paginationData && paginationData.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.total}
            itemsPerPage={paginationData.limit}
            onPageChange={handlePageChange}
            disabled={loading}
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
          selectedImage
            ? images.findIndex((img) => img.key === selectedImage.key) > 0
            : false
        }
        hasNext={
          selectedImage
            ? images.findIndex((img) => img.key === selectedImage.key) <
              images.length - 1
            : false
        }
      />
    </Stack>
  );
}
