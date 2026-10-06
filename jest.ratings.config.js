// The legacy root Jest config replaces Angular's transformer with ts-jest.
// Keep the ticket's component tests on the preset's supported Angular transformer.
const { createCjsPreset } = require("jest-preset-angular/presets");

module.exports = {
    ...createCjsPreset({ tsconfig: "<rootDir>/src/tsconfig.spec.json" }),
    setupFilesAfterEnv: ["<rootDir>/src/setup-ratings-jest.ts"],
    moduleNameMapper: {
        "^app/(.*)$": "<rootDir>/src/app/$1",
        "^@env/(.*)$": "<rootDir>/src/environments/$1",
        "^@entity$": "<rootDir>/src/entity/index",
    },
    testMatch: [
        "<rootDir>/src/app/cube/details/components/rating-editor/**/*.spec.ts",
        "<rootDir>/src/app/cube/details/components/learning-object-ratings/**/*.spec.ts",
        "<rootDir>/src/app/cube/details/components/rating-comment.spec.ts",
    ],
};
