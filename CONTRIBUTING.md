# Contributing to NexusCore

First off, thank you for considering contributing to NexusCore. It's people like you that make NexusCore a great framework for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Styleguides](#styleguides)

## Code of Conduct

This project and everyone participating in it is governed by the [NexusCore Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. 

## Getting Started

1. Fork the repository and create your branch from `main`.
2. Clone your fork locally.
3. Run `npm install` to install all dependencies.
4. Run `npm run build` to ensure everything compiles correctly.
5. Run `npm run test` to verify the test suite passes.

## How to Contribute

### Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/YourOrg/NexusCore/issues/new?template=bug_report.md); it's that easy!

Please provide as much relevant information as possible, including:
- Operating system
- Version of Node.js/TypeScript
- Detailed steps to reproduce the issue

### Suggesting Enhancements

If you have an idea that would make this framework better, please [open a feature request](https://github.com/YourOrg/NexusCore/issues/new?template=feature_request.md). 

### Pull Requests

1. **Ensure your code adheres to standard conventions.** We use ESLint and Prettier.
2. **Add tests.** Any undocumented or untested code enhancements will be rejected.
3. **Update documentation.** If you change an API or add a highly-requested feature, please update the README and docs accordingly.
4. **Link issues.** If your PR resolves an open issue, link to it in the PR description using keywords like `Fixes #123`.

## Styleguides

- Ensure you use `camelCase` for variables and functions.
- Classes and interfaces should use `PascalCase`.
- Write descriptive standard commit messages. We use conventional commits format.
