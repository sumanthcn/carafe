import path from "path";

export default ({ env }) => {
  const client = env("DATABASE_CLIENT", "sqlite");

  // Heroku Postgres support: Parse DATABASE_URL if provided
  let postgresConnection;
  if (env("DATABASE_URL")) {
    const url = new URL(env("DATABASE_URL"));
    postgresConnection = {
      host: url.hostname,
      port: parseInt(url.port || "5432"),
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: {
        rejectUnauthorized: false,
      },
      schema: env("DATABASE_SCHEMA", "public"),
    };
  } else {
    postgresConnection = {
      host: env("DATABASE_HOST", "localhost"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME", "carafe_strapi"),
      user: env("DATABASE_USERNAME", "strapi"),
      password: env("DATABASE_PASSWORD", ""),
      ssl: env.bool("DATABASE_SSL", false) && {
        rejectUnauthorized: env.bool(
          "DATABASE_SSL_REJECT_UNAUTHORIZED",
          true
        ),
      },
      schema: env("DATABASE_SCHEMA", "public"),
    };
  }

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          "..",
          "..",
          env("DATABASE_FILENAME", ".tmp/data.db")
        ),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: postgresConnection,
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};
