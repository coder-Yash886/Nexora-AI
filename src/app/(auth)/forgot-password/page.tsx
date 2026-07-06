import { ForgotPasswordView } from "@/modules/auth/ui/views/forgot-password-view";

const Page = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <ForgotPasswordView />
      </div>
    </div>
  );
};

export default Page;
