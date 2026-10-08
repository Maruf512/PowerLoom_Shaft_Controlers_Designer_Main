import { ApiErrorType } from "@/types/api";
import { useState } from "react";

const useFetchState = <T,>(initialLoading = false) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<ApiErrorType>();

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
  };
};

export default useFetchState;
