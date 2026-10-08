"use client";

import AuthForm from "@/components/layout/AuthForm";
import useFetchState from "@/hooks/useFetchState";
import apiClient from "@/lib/apiClient";
import { AuthFieldsNameType, AuthUserResponseType } from "@/types/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LOGIN_FIELDS = [
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
  const { error, loading, setLoading, setError } =
    useFetchState<AuthUserResponseType>();
  const router = useRouter();

  const handleSubmit = async (values: Record<AuthFieldsNameType, string>) => {
    setError(undefined);
    setLoading(true);

    const { data, error, status } = await apiClient<AuthUserResponseType>(
      "auth/login",
      {
        method: "POST",
        body: values,
      }
    );

    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
    }

    setLoading(false);

    if (status >= 200 && status < 300 && !error) {
      router.push("/");
    } else {
      setError(error || "Registration failed");
    }
  };

  return (
    <>
      {error ? (
        <p className="absolute top-2 left-2">{JSON.stringify(error)}</p>
      ) : null}
      <div className="h-screen flex items-center justify-center">
        <AuthForm
          fields={[...LOGIN_FIELDS]}
          title={"Login to your account"}
          subtitle="Enter your credentials below to login to your account"
          submitHandler={handleSubmit}
          isLoading={loading}
          footerContent={
            <div>
              {`${"Don't have an account? "}`}
              <Link
                className="underline hover:scale-105 text-primary"
                href="/auth/register"
              >
                Sign Up
              </Link>
            </div>
          }
        />
      </div>
    </>
  );
};

export default Page;
