"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const formSchema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetPasswordView = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  const [error, setError] = useState<string | null>(
    tokenError === "INVALID_TOKEN" ? "This reset link is invalid or expired." : null,
  );
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!token) {
      setError("Missing reset token. Please request a new link.");
      return;
    }

    setError(null);
    setPending(true);

    authClient.resetPassword(
      {
        newPassword: data.password,
        token,
      },
      {
        onSuccess: () => {
          setPending(false);
          setSuccess(true);
        },
        onError: ({ error: resetError }) => {
          setPending(false);
          setError(resetError.message);
        },
      },
    );
  };

  if (success) {
    return (
      <Card>
        <CardContent className="p-6 md:p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Password updated</h1>
          <p className="text-muted-foreground text-sm">
            You can now sign in with your email and new password.
          </p>
          <Button asChild className="w-full">
            <Link href="/sign-in">Go to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <CardContent className="p-6 md:p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Invalid reset link</h1>
          <p className="text-muted-foreground text-sm">
            Request a new password reset link from the forgot password page.
          </p>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Forgot password</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <h1 className="text-2xl font-bold">Set new password</h1>
                <p className="text-muted-foreground text-balance text-sm">
                  Choose a new password for your account.
                </p>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!!error && (
                <Alert className="bg-destructive/10 border-none">
                  <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}

              <Button disabled={pending} type="submit" className="w-full">
                Update password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
