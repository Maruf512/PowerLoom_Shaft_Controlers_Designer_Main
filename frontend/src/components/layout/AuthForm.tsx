"use client";

import { AuthFieldsNameType, AuthFormTypes } from "@/types/auth";
import { cn } from "@/utils/cn";
import { authFormValidator } from "@/utils/validators";
import React, { useMemo, useRef, useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import Button from "../ui/Button";

const AuthForm = ({
  fields,
  submitHandler,
  title,
  subtitle,
  footerContent,
  isLoading,
}: AuthFormTypes) => {
  // Stabilize fields identity (pages pass inline array literals) so the
  // memo doesn't recompute every render and cause hydration churn.
  const fieldKey = fields.map((f) => `${f.fieldName}:${f.fieldType}`).join("|");

  const initialFormData = useMemo(() => {
    return fields.reduce((acc, field) => {
      acc[field.fieldName] = "";
      return acc;
    }, {} as Record<AuthFieldsNameType, string>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldKey]);

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState(
    {} as Record<AuthFieldsNameType, string>
  );

  // Keep latest submitHandler without re-creating formHandler every render
  // (pages define handleSubmit inline).
  const submitRef = useRef(submitHandler);
  submitRef.current = submitHandler;

  const formHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = authFormValidator(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitRef.current(formData);
  };

  const handelChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: AuthFieldsNameType
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  // NOTE: native <form onSubmit> already handles Enter key.
  // A manual document keydown listener caused double submits, so it was removed.

  return (
    <form
      className="flex flex-col items-center px-5 py-6 rounded-radius-sm w-[90%] md:w-[35rem] lg:px-7 lg:py-9 bg-surface border border-muted shadow-sm"
      onSubmit={(e) => formHandler(e)}
    >
      <div className="w-full space-y-4">
        <div className="mb-6 space-y-1">
          <h3 className="text-lg md:text-xl text-strong font-semibold">
            {title}
          </h3>
          <p className="text-xs md:text-base line-clamp-2">{subtitle}</p>
        </div>
        {fields.map((field) => (
          <div key={field.fieldName} className="flex flex-col w-full">
            <label
              htmlFor={field.fieldName}
              className="capitalize text-sm md:text-basec font-medium"
            >
              {field.fieldName}
            </label>
            <div className="relative">
              <input
                className={cn(
                  "w-full px-3 py-1 border border-muted rounded-radius-sm bg-secondary text-sm md:text-base",
                  errors[field.fieldName] && "outline-1 outline-error"
                )}
                type={
                  field.fieldType === "password" && showPassword
                    ? "text"
                    : field.fieldType
                }
                id={field.fieldName}
                name={field.fieldName}
                value={formData[field.fieldName] ?? ""}
                placeholder={field.placeholder}
                onChange={(e) => handelChange(e, field.fieldName)}
              />
              {field.fieldType === "password" && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer px-1 py-1 hover:bg-on-surface duration-200 rounded-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <IoEyeOutline className="text-base md:text-lg" />
                  ) : (
                    <IoEyeOffOutline className="text-base md:text-lg" />
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-error">
              {errors && errors[field.fieldName]}
            </p>
          </div>
        ))}
      </div>
      <Button
        className="mt-6 w-full lg:text-base text-sm md:text-base"
        isLoading={isLoading}
        type="submit"
      >
        {title.split(" ")[0]}
      </Button>
      <div className="mt-2 text-sm md:text-base">{footerContent}</div>
    </form>
  );
};

export default AuthForm;
