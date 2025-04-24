export default ({ env }) => {
  const connectionString = env('DATABASE_URL');

  return {
    connection: {
      client: 'postgres',
      connection: connectionString
        ? {
            connectionString: connectionString,
            ssl: { rejectUnauthorized: false },
          }
        : {
            host: env('DATABASE_HOST', 'localhost'),
            port: env.int('DATABASE_PORT', 5432),
            database: env('DATABASE_NAME', 'strapi'),
            user: env('DATABASE_USERNAME', 'strapi'),
            password: env('DATABASE_PASSWORD', 'strapi'),
            ssl: env.bool('DATABASE_SSL', false)
              ? { rejectUnauthorized: false }
              : false,
            schema: env('DATABASE_SCHEMA', 'public'),
          },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
