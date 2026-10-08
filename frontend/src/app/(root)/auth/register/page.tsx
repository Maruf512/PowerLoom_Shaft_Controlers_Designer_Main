"use client";

import AuthForm from "@/components/layout/AuthForm";
import useFetchState from "@/hooks/useFetchState";
import apiClient from "@/lib/apiClient";
import { AuthFieldsNameType } from "@/types/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const REGISTER_FIELDS = [
  {
    fieldName: "name",
    fieldType: "text",
    placeholder: "Enter your name",
  },
  {
    fieldName: "email",
    fieldType: "email",
    placeholder: "Enter your email",
  },
  {
    fieldName: "password",
    fieldType: "password",
    placeholder: "Enter your password",
  },
] as const;

const Page = () => {
  const { error, loading, setLoading, setError } = useFetchState();
  const router = useRouter();

  const handleSubmit = async (values: Record<AuthFieldsNameType, string>) => {
    setError(undefined);
    setLoading(true);

    const { error, status } = await apiClient("auth/register", {
      method: "POST",
      body: values,
    });

    setLoading(false);

    if (status >= 200 && status < 300 && !error) {
      router.push("/auth/login");
    } else {
      setError(error || "Registration failed");
    }
  };

  return (
    <>
      {error ? (
        <p className="absolute top-2 left-2">{JSON.stringify(error)}</p>
      ) : null}
      <div className="flex items-center justify-center w-full h-screen">
        <AuthForm
          fields={[...REGISTER_FIELDS]}
          title={"Register your account"}
          subtitle="Enter your credentials below to register your account"
          submitHandler={handleSubmit}
          isLoading={loading}
          footerContent={
            <div>
              Already have an account?{" "}
              <Link
                className="underline hover:scale-105 text-primary"
                href="/auth/login"
              >
                Login
              </Link>
            </div>
          }
        />
      </div>
    </>
  );
};

export default Page;
