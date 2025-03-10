import DropFile from "@/components/drop-file";
import { SignIn } from "@/components/sign-in";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { Container, Stack, Text } from "@mantine/core";

export default async function Home() {
  const session = await auth();
  return (
    <Container size="xs">
      {session ? (
        <Stack>
          <Text>Connecté en tant que {session.user?.email}</Text>
          <SignOutButton />
          <DropFile />
        </Stack>
      ) : (
        <SignIn />
      )}
    </Container>
  );
}
