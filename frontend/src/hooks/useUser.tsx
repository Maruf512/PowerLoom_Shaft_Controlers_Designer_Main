import apiClient from "@/lib/apiClient";
import { AuthUserResponseType } from "@/types/auth";
import { useCallback, useEffect, useState } from "react";

const useUser = () => {
  const [user, setUser] = useState<AuthUserResponseType | null>();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const { data } = await apiClient<AuthUserResponseType>("auth/profile");
    setUser(data);
    setRefreshing(false);
    return data;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, refresh, refreshing, setUser };
};

// Backwards compat: some components do `const user = useUser()`.
// They now get `{ user, ... }` — update those call sites to destructure.
export default useUser;
