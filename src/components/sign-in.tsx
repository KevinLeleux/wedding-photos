import { signIn } from "@/lib/auth";
import { Button, Input, InputLabel, Stack } from "@mantine/core";

export function SignIn() {
  return (
    <form
      action={async (formData) => {
        "use server";
        await signIn("credentials", formData);
      }}>
      <Stack>
        <InputLabel>Mot de passe</InputLabel>
        <Input
          name="password"
          type="password"
          placeholder="Mot de passe"
        />
        <Button type="submit">Se connecter</Button>
      </Stack>
    </form>
  );
}
