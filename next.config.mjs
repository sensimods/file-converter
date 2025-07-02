// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Add experimental.optimizePackageImports for Next.js 15
//   // to potentially help with bundling large libraries.
//   // Note: This is an experimental flag.
//   experimental: {
//     optimizePackageImports: [
//       'sharp', // Suggest to optimize sharp imports
//     ],
//   },
//   // Optionally, you might need to tell Next.js to bundle `sharp`
//   // especially if deploying to environments other than Vercel where
//   // it might not be pre-installed or automatically handled.
//   // For Vercel, it often works out of the box with `sharp` installed.
//   webpack: (config, { isServer }) => {
//     // If you encounter issues with sharp on deployment,
//     // you might need to externalize it, but this can complicate Vercel builds.
//     // For most Vercel deployments, simply having sharp in package.json is enough.
//     // This is more of a fallback/troubleshooting step.
//     // if (isServer) {
//     //   config.externals.push('sharp');
//     // }
//     return config;
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // You can remove or comment out this experimental flag for sharp,
  // as it might be causing the bundler to look for dev dependencies.
  // experimental: {
  //   optimizePackageImports: [
  //     'sharp',
  //   ],
  // },

  webpack: (config, { isServer }) => {
    // Only apply this on the server-side build (for API routes, etc.)
    if (isServer) {
      // Externalize 'sharp' to prevent Webpack from bundling its native dependencies.
      // This tells Next.js that 'sharp' will be available in the Node.js runtime environment.
      config.externals.push('sharp');
    }

    return config;
  },
};

export default nextConfig;