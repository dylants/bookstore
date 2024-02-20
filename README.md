# bookstore

An application to help run a book store.

## Getting Started

1. Install dependencies

```
$ yarn
```

2. Setup the [database](#database)

3. Start the application

```
$ yarn dev
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

To run migrations (note: this will automatically run the [seed script](prisma/seed.ts) after migrations):

```
$ npx prisma migrate dev
```

or if you have an `.env.local` file:

```
$ npx dotenv -e .env.local -- prisma migrate dev
```

### Create New Migration

To create a new migration (and run it):

```
$ npx prisma migrate dev --name <update name>
```

### Seeds

Database seeds are found in the [seed script](prisma/seed.ts).

The following commands require an `.env.local` file with the `DATABASE_URL`.

Run the seeds:

```
$ yarn db:seed
```

Reset the database, re-run migrations, and re-seed the data:

```
$ yarn db:reset
```

#### Overrides

The seed script provides values for the number of entities to create. These can be overridden via the environment variables:

```
SEED_NUM_VENDORS
SEED_NUM_PUBLISHERS
SEED_NUM_AUTHORS
SEED_NUM_BOOKS
```

For instance, to set the number of Books to create to 5, set the environment variable `SEED_NUM_BOOKS=5` prior to running the seed script.

## Logging

[Pino](https://github.com/pinojs/pino) logger is setup to use within the app. Configuration can be found in the [logger.ts](src/lib/logger.ts) file.

## Tests

### Unit Tests

Lint and Jest tests are run during CI. These unit tests are stored along side the source code.

To run the tests:

```
$ yarn test
```

To run tests in watch mode:

```
$ yarn test:watch
```

### Playwright e2e Tests

Playwright tests are stored in [tests](tests/).

To run the tests:

```
$ yarn playwright test
```

To run the tests with the Playwright UI:

```
$ yarn playwright test --ui
```

## Storybook

This app uses [Storybook](https://storybook.js.org/) to demo UI components.

To run storybook:

```
$ yarn storybook
```
