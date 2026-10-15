import type { NextConfig } from 'next';
const config: NextConfig = process.env.STATIC_EXPORT === '1'
  ? { output: 'export', basePath: '/tipster-audit', images: { unoptimized: true } }
  : {};
export default config;
