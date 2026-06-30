"use client";

import { ErrorState } from "@/components/error-state";

const Error = () => {
  return (
    <ErrorState
      title="Error Loading Meetings"
      description="Something went wrong"
    />
  );
};

export default Error;
