import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '(models/.*)': '<rootDir>/src/$1',
    '(utils/.*)': '<rootDir>/src/$1',
    '(store/.*)': '<rootDir>/src/$1',
    '(constants/.*)': '<rootDir>/src/$1',
  },
  collectCoverage: true, // 开启覆盖率收集

  coverageDirectory: 'coverage', // 覆盖率报告的输出目录

  coverageProvider: 'v8', // 指定覆盖率报告的提供者
}

export default config
