import { ImageWithDimensions } from "@/types/image";
import { Button, Group, Loader, Modal, Stack } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageModalProps {
  opened: boolean;
  onClose: () => void;
  image: ImageWithDimensions | null;
  onDownload: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function ImageModal({
  opened,
  onClose,
  image,
  onDownload,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: ImageModalProps) {
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (opened && image) {
      setImageLoading(true);

      const img = new window.Image();
      img.onload = () => {
        console.log("Image loaded successfully:", image.key);
        setImageLoading(false);
      };
      img.onerror = (e) => {
        console.error("Image failed to load:", image.key, e);
        setImageLoading(false);
      };
      img.src = image.url;

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [opened, image]);

  if (!image) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      padding="lg">
      <Stack align="center">
        {imageLoading ? (
          <Stack
            h="80vh"
            justify="center"
            align="center">
            <Loader />
          </Stack>
        ) : (
          <Image
            src={image.url}
            alt={image.key}
            width={image.width || 800}
            height={image.height || 600}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: "20px",
              display: imageLoading ? "none" : "block",
            }}
            loading="lazy"
            quality={70}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
          />
        )}

        <Group
          justify="center"
          align="center">
          {hasPrevious && (
            <Button
              variant="light"
              size="sm"
              onClick={onPrevious}
              leftSection={<IconChevronLeft size={16} />}>
              Précédente
            </Button>
          )}

          <Button
            radius="md"
            onClick={onDownload}
            variant="filled"
            disabled={imageLoading}>
            Télécharger
          </Button>

          {hasNext && (
            <Button
              variant="light"
              size="sm"
              onClick={onNext}
              rightSection={<IconChevronRight size={16} />}>
              Suivante
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
