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
    trustServerCertificate: false
  }
}

// We'll modify our executeQuery function to handle parameters properly
export async function executeQuery<T>(
  query: string, 
  params: { [key: string]: any } = {}
): Promise<T[]> {
  try {
    // Create a new connection pool
    const pool = await sql.connect(sqlConfig)
    
    // Create a new request object
    const request = pool.request()
    
    // Add any parameters to the request
    // This is where we properly declare our SQL parameters
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value)
    })
    
    // Execute the query with the properly declared parameters
    const result = await request.query(query)
    
    return result.recordset
  } catch (err) {
    console.error('Query execution failed:', err)
    throw err
  }
}