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

### Setup Postgres

Install PostgreSQL and populate the `.env` file with the correct `DATABASE_URL` string to connect to PostgreSQL. Some articles to help setup:

- Prisma and PostgreSQL: https://www.prisma.io/docs/orm/overview/databases/postgresql
- .env files: https://www.prisma.io/docs/orm/more/development-environment/environment-variables/env-files

### Run Migrations

To run migrations:

```
$ npx prisma migrate dev
```

### Create New Migration

To create a new migration (and run it):

```
$ npx prisma migrate dev --name <update name>
```

## Logging

[Pino](https://github.com/pinojs/pino) logger is setup to use within the app. Configuration can be found in the [logger.ts](src/lib/logger.ts) file.

## Tests

Lint and Jest tests are run during CI. To run them locally:

```
$ yarn test
```
