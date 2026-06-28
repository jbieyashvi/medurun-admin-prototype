const isDev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/medurun-admin-prototype",
  images: { unoptimized: true },
  // Local dev only: redirect bare "/" to the basePath so http://localhost:3000 works.
  // Skipped for the static export build (redirects() is incompatible with output: export).
  ...(isDev && {
    async redirects() {
      return [{ source: "/", destination: "/medurun-admin-prototype", basePath: false, permanent: false }];
    },
  }),
};
export default nextConfig;
