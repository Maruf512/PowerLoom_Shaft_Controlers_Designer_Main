"use client";

import DesignDetails from "@/components/layout/DesignDetails";
import useFetchState from "@/hooks/useFetchState";
import apiClient from "@/lib/apiClient";
import { Design } from "@/types/data";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const { id } = useParams();

  const {
    data: designer,
    setData: setDesigner,
    error: designerError,
    setError: setDesignerError,
    loading,
    setLoading,
  } = useFetchState<Design>();
  const [apiBase, setApiBase] = useState("designer/designs");

  useEffect(() => {
    if (!id) {
      setDesignerError("Invalid designer id");
      return;
    }

    const fetchDesigner = async () => {
      setLoading(true);
      const own = await apiClient<Design>(`designer/designs/${id}`);
      if (own.data) {
        setDesigner(own.data);
        setLoading(false);
        return;
      }
      // Admin fallback: view any user's file
      const adm = await apiClient<Design>(`auth/admin/designs/${id}`);
      setLoading(false);
      if (adm.data) {
        setApiBase("auth/admin/designs");
        setDesigner(adm.data);
        return;
      }
      setDesignerError("Error fetching designer data");
    };

    fetchDesigner();
  }, [id, setDesigner, setDesignerError, setLoading]);

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          <span className="ml-3 text-primary">Loading...</span>
        </div>
      ) : designerError ? (
        <p className="font-semibold text-base text-center capitalize tracking-wide">
          {designerError}
        </p>
      ) : designer ? (
        <DesignDetails
          designer={designer}
          apiBase={apiBase}
          deleteRedirect={apiBase === "designer/designs" ? "/" : "/admin"}
        />
      ) : (
        <p className="font-semibold text-base text-center capitalize tracking-wide">
          No design data found.
        </p>
      )}
    </div>
  );
};

export default Page;
