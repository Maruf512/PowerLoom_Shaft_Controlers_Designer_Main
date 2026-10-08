"use client";

import DataTable from "@/components/ui/DataTable";
import Filter from "@/components/ui/Filter";
import { designColumn } from "@/constants/dataTable";
import useFetchState from "@/hooks/useFetchState";
import useFilter from "@/hooks/useFilter";
import apiClient from "@/lib/apiClient";
import { DesignDataRecievedType, DesignDataType } from "@/types/data";
import { useEffect, useMemo, useState } from "react";

const Page = () => {
  const { search, setSearch } = useFilter();
  const { data, setData } = useFetchState<DesignDataType[]>();
  const [reload, setReload] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchDesigns = async () => {
      const { data, error } = await apiClient<DesignDataRecievedType[]>(
        "designer/designs",
        {
          method: "GET",
        }
      );

      if (data && !error) {
        const mutatedData = data.map((design) => ({
          id: design.id,
          name: design.name,
          total_color_palettes: design.total_color_palettes,
          machine_type: design.machine_type,
          date: design.updated_at.split("T")[0],
        }));

        setData(mutatedData);
      }
      setLoading(false);
    };

    fetchDesigns();
  }, [reload, setData]);

  // Client-side filtering — no refetch on keystrokes. Matches name,
  // machine type, date and id.
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data || [];
    return (data || []).filter((d) =>
      [d.name, d.machine_type, d.date, String(d.id)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      {/* <div className="flex flex-col gap-4 lg:flex-row justify-center lg:justify-between bg-surface rounded-radius-lg">
        <Navigator />
        <UserDetails />
      </div> */}
      <div>
        <Filter
          search={search}
          setSearch={setSearch}
          // setDisplay={setDisplay}
          // display={display}
        />
      </div>
      {search.trim() && !loading ? (
        <p className="text-xs text-muted px-1">
          Showing {filteredData.length} of {(data || []).length} designs
        </p>
      ) : null}
      <div>
        <DataTable
          data={filteredData}
          columns={designColumn}
          setReload={setReload}
          loading={loading}
          emptyMessage={
            search.trim()
              ? `No designs match "${search.trim()}"`
              : "No Data Found"
          }
        />
      </div>
    </div>
  );
};

export default Page;
