const tsconfig = require("./tsconfig.json")
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig)

module.exports = {
    "roots": [
        "<rootDir>/test"
    ],
    "transform": {
        "^.+\\.ts?$": "ts-jest"
    },

    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "testEnvironment": "node",
    moduleNameMapper,
};
