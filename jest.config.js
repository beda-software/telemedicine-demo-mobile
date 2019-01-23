module.exports = {
    preset: 'react-native',
    transform: {
        '\\.jsx?$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
        '\\.tsx?$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
    },
    globals: {
        NODE_ENV: 'test',
        'ts-jest': {
            babelConfig: true,
        },
    },
    // This is the only part which you can keep
    // from the above linked tutorial's config:

    cacheDirectory: '.jest/cache',
    moduleDirectories: ['node_modules', '<rootDir>'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    testPathIgnorePatterns: ['/node_modules/'],
    verbose: true,
    testEnvironment: 'node',
};
