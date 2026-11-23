const ratingsConfig = require("./jest.ratings.config");

module.exports = {
    ...ratingsConfig,
    testMatch: [
        "<rootDir>/src/app/cube/browse/browse.component.spec.ts",
        "<rootDir>/src/app/components/search/search.component.spec.ts",
        "<rootDir>/src/app/core/learning-object-module/search/search.service.spec.ts",
    ],
};
