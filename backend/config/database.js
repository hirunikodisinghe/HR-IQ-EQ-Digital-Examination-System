const sql = require("mssql");

const databaseConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_DATABASE,

  options: {
    encrypt:
      String(process.env.DB_ENCRYPT).toLowerCase() === "true",

    trustServerCertificate:
      String(process.env.DB_TRUST_CERTIFICATE).toLowerCase() === "true",
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },

  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(databaseConfig)
      .connect()
      .then((pool) => {
        console.log("SQL Server connected successfully");
        return pool;
      })
      .catch((error) => {
        poolPromise = null;
        console.error(
          "SQL Server connection failed:",
          error.message
        );
        throw error;
      });
  }

  return poolPromise;
}

module.exports = {
  sql,
  getPool,
};