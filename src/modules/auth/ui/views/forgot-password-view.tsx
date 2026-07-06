"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
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

const formSchema = z.object({
  email: z.string().email(),
});

export const ForgotPasswordView = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setSuccess(null);
    setPending(true);

    const redirectTo = `${window.location.origin}/reset-password`;

    authClient.forgetPassword(
      {
        email: data.email.trim().toLowerCase(),
        redirectTo,
      },
      {
        onSuccess: () => {
          setPending(false);
          setSuccess(
            "If an account exists for this email, a reset link has been sent. Check your inbox (and spam). Google/GitHub users can use this to add an email password.",
          );
        },
        onError: ({ error: resetError }) => {
          setPending(false);
          setError(resetError.message);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <h1 className="text-2xl font-bold">Forgot password</h1>
                <p className="text-muted-foreground text-balance text-sm">
                  Enter your email and we will send a link to reset or set your password.
                </p>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
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

              {!!success && (
                <Alert className="bg-emerald-500/10 border-none">
                  <AlertTitle className="text-emerald-700">{success}</AlertTitle>
                </Alert>
              )}

              <Button disabled={pending} type="submit" className="w-full">
                Send reset link
              </Button>

              <div className="text-center text-sm">
                <Link href="/sign-in" className="underline underline-offset-4">
                  Back to sign in
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
