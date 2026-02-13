"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login, loginWithMagicLink } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await login(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else if (result?.redirect) {
      router.push(result.redirect);
    }
  }

  async function handleMagicLink(formData: FormData) {
    setError(null);
    setMessage(null);
    setMagicLinkLoading(true);
    const result = await loginWithMagicLink(formData);
    setMagicLinkLoading(false);
    if (result?.error) {
      setError(result.error);
    } else if (result?.message) {
      setMessage(result.message);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your Courtside Finance account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {message && (
            <p className="text-sm text-green-600">{message}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <form action={handleMagicLink}>
          <input type="hidden" name="email" id="magic-link-email" />
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={magicLinkLoading}
            onClick={(e) => {
              const emailInput = document.getElementById("email") as HTMLInputElement;
              const hiddenInput = document.getElementById("magic-link-email") as HTMLInputElement;
              hiddenInput.value = emailInput.value;
            }}
          >
            {magicLinkLoading ? "Sending..." : "Send magic link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
