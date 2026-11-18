module.exports = {
    preset: "jest-preset-angular",
    roots: ["src"],
    setupFilesAfterEnv: ["<rootDir>/src/setup-jest.ts"],
    moduleNameMapper: {
        "@env(.*)": "<rootDir>/src/environments/$1",
        "@entity(.*)": "<rootDir>/src/entity/$1",
    },
    transform: {
        "^.+\\.(ts|js|mjs|html|svg)$": [
            "jest-preset-angular",
            {
                tsconfig: "<rootDir>/tsconfig.json",
                stringifyContentPathRegex: "\\.(html|svg)$",
            },
        ],
    },
};
