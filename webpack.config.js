const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");
module.exports = {
    devtool: "source-map",
    plugins: [
        sentryWebpackPlugin({
            org: "cyber4all-00",
            project: "clark-client",
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
                // Delete source maps after they're uploaded to Sentry.
                filesToDeleteAfterUpload: [
                    "./**/*.map",
                    ".*/**/public/**/*.map",
                    "./dist/**/client/**/*.map",
                ],
            },
        }),
    ],
};
