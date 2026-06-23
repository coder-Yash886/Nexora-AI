"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@base-ui/react";
import { useRouter } from "next/navigation";

export const HomeView = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col p-4 gap-y-4">
      <p>Logged in as {session.user.name}</p>

      <Button
        className="w-full bg-black text-white cursor-pointer"
        onClick={() => authClient.signOut({
          fetchOptions: {
            onSuccess: () => router.push("/sign-in")
          }
        })
        }
      >
        Sign out
      </Button>
    </div>
  );
};

