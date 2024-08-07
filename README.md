# bookstore

An application to help run a book store.

![bookstore](https://github.com/dylants/bookstore/assets/1596740/29a06c8f-f8ba-43d1-9101-840be931ef23)

## Getting Started

_This app uses [bun](https://bun.sh/) for dependency management and script execution._

1. Install dependencies

```
bun install
```

2. Setup the [database](#database)

3. Start the application

```
bun dev
```

## Database

This project utilizes [Prisma](https://www.prisma.io/) for its ORM, and expects a PostgreSQL database instance.

The database schema is stored in the [schema.prisma](prisma/schema.prisma) file.

### Setup Postgres

Install PostgreSQL and populate the `.env` file with the correct `DATABASE_URL` string to connect to PostgreSQL. Some articles to help setup:

- Prisma and PostgreSQL: https://www.prisma.io/docs/orm/overview/databases/postgresql
- .env files: https://www.prisma.io/docs/orm/more/development-environment/environment-variables/env-files

The `DATABASE_URL` should be populated as such:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/bookstore"
```

### Run Migrations

To run migrations (note: this will automatically run the [seed script](#seeds) after migrations):

```
npx prisma migrate dev
```

or if you have an `.env.local` file:

```
npx dotenv -e .env.local -- prisma migrate dev
```

### Create New Migration

To create a new migration (and run it):

```
npx prisma migrate dev --name <update name>
```

### Seeds

Database seeds are found in the [seed script directory](prisma/seed/).

The following commands require an `.env.local` file with the `DATABASE_URL`.

To run the seed script to generate fake data:

```
bun db:seed
```

Reset the database, re-run migrations, and re-seed with fake data:

```
bun db:reset
```

#### Overrides

The seed script to generate fake data provides values for the number of entities to create. These can be overridden via the environment variables:

```
SEED_NUM_VENDORS
SEED_NUM_BOOKS
```

For instance, to set the number of Books to create to 5, set the environment variable `SEED_NUM_BOOKS=5` prior to running the seed script.

## Square

This application makes use of the Square API and SDK, specifically Square Terminal Checkout as a Point of Sale solution. For more information, see: https://developer.squareup.com/reference/square/terminal-api.

### Environment Variables

The following environment variables are required when using Square:

- `SQUARE_ACCESS_TOKEN`: The Square environment access token
- `SQUARE_DEVICE_ID`: The unique ID of the device used for Square Terminal Checkout

### Square Sandbox

Testing is available for Square via the Sandbox environment. In this environment, device IDs are used to simulate scenarios.

For Terminal API Checkout see:
https://developer.squareup.com/docs/devtools/sandbox/testing#terminal-api-checkouts

## Logging

[Pino](https://github.com/pinojs/pino) logger is setup to use within the app. Configuration can be found in the [logger.ts](src/lib/logger.ts) file.

## Tests

Lint and unit tests are run during CI.

### Lint

This project is configured to use ESLint as the linter.

To run both lint and compile TypeScript files:

```
bun run lint
```

### Unit Tests

The unit tests are stored along side the source code.

To run the tests:

```
bun run test
```

To run tests in watch mode:

```
bun run test:watch
```

### Playwright e2e Tests

Playwright tests are stored in [tests](tests/). Some tests require the app to be setup in a specific manner (such as Square sandbox with a specific device ID). See the tests for more details.

Note that these e2e tests are not run via the GitHub CI actions, since they require specific setup. They can be run locally, manually:

To run the tests:

```
bun playwright test
```

To run the tests with the Playwright UI:

```
bun playwright test --ui
```

To run the full e2e tests, which _!!resets the database!!_, applies seeds for CI, then runs the playwright e2e tests:

```
bun run test:e2e
```

## Storybook

This app uses [Storybook](https://storybook.js.org/) to demo UI components.

To run storybook:

```
bun storybook
```
