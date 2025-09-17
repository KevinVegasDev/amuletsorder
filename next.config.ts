import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "headlessamulets.in",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
    ],
    qualities: [25, 50, 70, 75, 80, 85, 90, 95],
  },
};

export default nextConfig;
