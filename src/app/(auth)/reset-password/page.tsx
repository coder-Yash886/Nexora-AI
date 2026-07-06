import { Suspense } from "react";

import { LoadingState } from "@/components/loading-state";
import { ResetPasswordView } from "@/modules/auth/ui/views/reset-password-view";

const Page = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <Suspense
          fallback={
            <LoadingState title="Loading" description="Please wait..." />
          }
        >
          <ResetPasswordView />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
