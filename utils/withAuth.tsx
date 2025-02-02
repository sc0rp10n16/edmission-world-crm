"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const withAuth = (WrappedComponent: React.ComponentType, allowedRoles: string[]) => {
  return function ProtectedRoute() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/login");
      } else if (
        status === "authenticated" &&
        !allowedRoles.includes(session?.user?.role as string)
      ) {
        router.push("/unauthorized");
      }
    }, [status, session, router]);

    if (status === "loading") {
      return <div>Loading...</div>;
    }

    return <WrappedComponent />;
  };
};

export default withAuth;