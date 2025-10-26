import { Group, Pagination as MantinePagination, Stack } from "@mantine/core";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  return (
    <Stack
      justify="center"
      align="center"
      gap="md"
      mt="md">
      <Group justify="center">
        <MantinePagination
          value={currentPage}
          onChange={onPageChange}
          total={totalPages}
          size="md"
          radius="md"
          withEdges
          siblings={2}
          boundaries={1}
          disabled={disabled}
        />
      </Group>
    </Stack>
  );
}
