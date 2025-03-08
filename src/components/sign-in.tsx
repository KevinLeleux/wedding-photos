"use client";

import { Button, Input, InputLabel, Stack } from "@mantine/core";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn("credentials", { email, password });
      router.push("/");
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      setError("Erreur lors de la connexion. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4">
      <Stack>
        <InputLabel>Email</InputLabel>
        <Input
          name="email"
          type="email"
          placeholder="votre@email.com"
        />
        <InputLabel>Mot de passe</InputLabel>
        <Input
          name="password"
          type="password"
          placeholder="Mot de passe"
        />
        <Button
          type="submit"
          loading={loading}>
          Se connecter
        </Button>
      </Stack>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
