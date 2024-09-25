import {withSentryConfig} from '@sentry/nextjs';
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");
import pkg from './package.json' with {type: 'json'};
import child_process from 'child_process';

// starts a command line process to get the git hash
const commitHash = child_process
    .execSync('git log --pretty=format:"%h" -n1')
    .toString()
    .trim();


/** @type {import("next").NextConfig} */
const config = {
    env: {
        // add the package.json version and git hash to the environment
        APP_VERSION: pkg.version,
        REPO_LINK: pkg.repo,
        COMMIT_HASH: commitHash,
        COLLECT_API_ENDPOINT: 'api/beep',
    },
    async rewrites() {
        return [
            {
                source: "/send/:path*",
                destination: "https://app.posthog.com/:path*",
            },
        ];
    },
};

export default withSentryConfig(config, {
// For all available options, see:
// https://github.com/getsentry/sentry-webpack-plugin#options

org: "simon-bechard",
project: "coinstacker",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Hides source maps from generated client bundles
hideSourceMaps: true,

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});