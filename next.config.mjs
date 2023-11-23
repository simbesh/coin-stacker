/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");
import pkg from './package.json' assert {type: 'json'};
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
        COMMIT_HASH: commitHash,
        COLLECT_API_ENDPOINT: 'api/beep',
    }
};

export default config;
