export const baseUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  // Strip trailing slashes so callers can safely do `${baseUrl()}/${path}/`
  return raw.replace(/\/+$/, "");
};
