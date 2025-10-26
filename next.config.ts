import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.mariage-emilie-et-kevin.fr",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
