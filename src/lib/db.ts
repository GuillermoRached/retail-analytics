// src/lib/db.ts
import sql from 'mssql'

const sqlConfig = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  server: process.env.AZURE_SQL_SERVER as string,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
}

// Create a connection pool that we can reuse
let pool: sql.ConnectionPool | null = null;

async function getConnection() {
  try {
    if (pool) {
      return pool;
    }

    pool = await new sql.ConnectionPool(sqlConfig).connect();
    console.log('Connected to database successfully');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

export async function executeQuery<T>(query: string, params: { [key: string]: any } = {}): Promise<T[]> {
    try {
      const pool = await getConnection();
      const request = pool.request();
      
      // Add parameters to the request
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });
      
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error('Query execution failed:', err);
      throw err;
    }
  }