import { SignIn } from "@/components/sign-in";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { Container } from "@mantine/core";

export default async function Home() {
  const session = await auth();
  return (
    <Container size="xs">
      {session ? (
        <div>
          <p>Connecté en tant que {session.user?.email}</p>
          <SignOutButton />
        </div>
      ) : (
        <SignIn />
      )}
    </Container>
  );
}
