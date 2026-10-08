"use client";

import DesignerEditor from "@/components/layout/DesignerEditor";
import { useToast } from "@/components/ui/ToastProvider";
import useFetchState from "@/hooks/useFetchState";
import useUser from "@/hooks/useUser";
import apiClient from "@/lib/apiClient";
import { Design, DesignType } from "@/types/data";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const AdminDesignEditPage = () => {
  const { data, setData, error, setError } = useFetchState<DesignType>();
  const toast = useToast();
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("Invalid designer id");
      return;
    }
    const fetchDesigner = async () => {
      const { data, error } = await apiClient<Design>(
        `auth/admin/designs/${id}`
      );
      if (error || !data) {
        setError("Error fetching designer data for update");
        setLoading(false);
        return;
      }
      setData({
        name: data.name,
        total_color_palettes: data.total_color_palettes,
        color_box_1: data.color_box_1,
        color_box_2: data.color_box_2,
        color_box_3: data.color_box_3,
        color_box_4: data.color_box_4,
        starting_position: data.starting_position,
        machine_type: data.machine_type,
        design_grids: data.design_grids,
      });
      setLoading(false);
    };
    fetchDesigner();
  }, [id, setData, setError]);

  const updateHandler = async (designerData: DesignType) => {
    const { error } = await apiClient<Design>(`auth/admin/designs/${id}`, {
      method: "PUT",
      body: designerData,
    });
    if (error) {
      toast(typeof error === "string" ? error : "Error updating design", "error");
      return;
    }
    toast("Design updated successfully", "success");
    router.push("/admin");
  };

  if (user && !user.is_admin)
    return <p className="text-center text-sm">Access denied — admins only.</p>;

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          <span className="ml-3 text-primary">Loading...</span>
        </div>
      ) : error ? (
        <p className="font-semibold text-base text-center capitalize tracking-wide">
          {error}
        </p>
      ) : (
        data && (
          <DesignerEditor
            designerState={data}
            handler={updateHandler}
            title="Update"
          />
        )
      )}
    </div>
  );
};

export default AdminDesignEditPage;
