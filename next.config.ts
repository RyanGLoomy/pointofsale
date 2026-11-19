import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sematkan CSS langsung ke dalam HTML (inline <style>) alih-alih file
  // stylesheet terpisah. Ini membuat tampilan tetap utuh walau ada pihak
  // (ekstensi/jaringan) yang memblokir unduhan file *.css.
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;
