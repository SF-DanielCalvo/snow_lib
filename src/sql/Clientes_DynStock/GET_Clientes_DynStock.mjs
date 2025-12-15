import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'))

/**
 * Get all records from Clientes_DynStock table
 * 
 * @param {Object} pool - Pool service instance (required)
 * @param {Function} queryFunctionToExecute - Function to execute the query (required)
 * @returns {Promise<Object>} Response object with query results
 * 
 * @example
 * const result = await GET_Clientes_DynStock(poolService, queryFunction);
 * 
 * @example
 * const result = await GET_Clientes_DynStock(poolService, async (pool, query) => await executeQuery(pool, query));
 */
export async function GET_Clientes_DynStock(pool, queryFunctionToExecute) {
    try {
        const Verifications = Verification(pool, queryFunctionToExecute)
        if (Verifications.statusCode !== 200) {
            return Verifications
        }

        const result = await Call_GET_Clientes_DynStock(pool, queryFunctionToExecute)

        return {
            statusCode: result.httpStatusCode,
            headers: defaultHeaders(),
            body: result.body,
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: defaultHeaders(),
            body: {
                Code: "InternalError",
                Message: "An error occurred while processing the request.",
                Error: error.message,
            },
        }
    }
}

//----------------------------------------------
//  FUNCTION: Execute GET_Clientes_DynStock Query
//----------------------------------------------
/**
 * Retrieves all records from Clientes_DynStock table
 * 
 * @param {Object} pool - Pool service instance
 * @param {Function} queryFunctionToExecute - Query execution function
 * @returns {Object} Response object with query results
 */
async function Call_GET_Clientes_DynStock(pool, queryFunctionToExecute) {
    let httpStatusCode
    let body

    try {
        // Step 1: Load query from config
        const query = config.queries.select.all

        // Step 2: Execute query using provided function
        const result = await queryFunctionToExecute(pool, query)

        // Step 3: Return success
        httpStatusCode = 200
        body = {
            Table: config.name,
            RowCount: result.rows ? result.rows.length : 0,
            Rows: result.rows || [],
            Query: query.trim(),
        }
    } catch (e) {
        console.error("Error executing query:", e)
        httpStatusCode = 500
        
        // Handle common database errors
        if (e.code === 'ELOGIN' || e.code === 'EAUTH' || e.code === '28000') {
            httpStatusCode = 401
            body = {
                Code: 'LoginFailed',
                Message: 'Login failed. Check your credentials.',
                Details: e.message,
            }
        } else if (e.code === 'ETIMEOUT' || e.code === 'ETIMEDOUT') {
            httpStatusCode = 504
            body = {
                Code: 'Timeout',
                Message: 'Connection timeout. The database server is not responding.',
                Details: e.message,
            }
        } else if (e.code === 'EREQUEST' || e.code === '42000' || e.message?.includes('syntax')) {
            httpStatusCode = 400
            body = {
                Code: 'InvalidRequest',
                Message: 'Invalid SQL query or request.',
                Details: e.message,
            }
        } else if (e.number === 208 || e.code === '42S02' || e.message?.includes('does not exist') || e.message?.includes('not found')) {
            httpStatusCode = 404
            body = {
                Code: 'InvalidObjectName',
                Message: `Table 'Clientes_DynStock' does not exist.`,
                Details: e.message,
            }
        } else if (e.number === 207 || e.code === '42S22' || e.message?.includes('column')) {
            httpStatusCode = 400
            body = {
                Code: 'InvalidColumnName',
                Message: 'One or more column names are invalid.',
                Details: e.message,
            }
        } else {
            body = {
                Code: e.code || 'UnknownError',
                Message: e.message,
                Number: e.number,
            }
        }
    }

    return {
        httpStatusCode,
        body,
    }
}

//----------------------------------------------
//  VERIFICATIONS
//----------------------------------------------

function Verification(pool, queryFunctionToExecute) {
    const Verification_pool = Verifications_pool(pool)
    const Verification_queryFunctionToExecute = Verifications_queryFunctionToExecute(queryFunctionToExecute)

    const errors = []

    // Collect all errors
    if (Verification_pool.statusCode !== 200) {
        errors.push(Verification_pool.body.Message)
    }
    if (Verification_queryFunctionToExecute.statusCode !== 200) {
        errors.push(Verification_queryFunctionToExecute.body.Message)
    }

    if (errors.length > 0) {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: {
                Code: "InvalidParameterValue",
                Message: errors,
            },
        }
    }

    return {
        statusCode: 200,
        headers: defaultHeaders(),
        body: {},
    }
}

function Verifications_pool(pool) {
    if (!pool) {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: {
                Code: "InvalidParameterValue",
                Message: "The 'pool' parameter is required.",
            },
        }
    }

    if (typeof pool !== 'object' || !pool.pool) {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: {
                Code: "InvalidParameterValue",
                Message: "The 'pool' parameter must be a valid pool service object.",
            },
        }
    }

    return {
        statusCode: 200,
        headers: defaultHeaders(),
        body: {},
    }
}

function Verifications_queryFunctionToExecute(queryFunctionToExecute) {
    if (!queryFunctionToExecute) {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: {
                Code: "InvalidParameterValue",
                Message: "The 'queryFunctionToExecute' parameter is required.",
            },
        }
    }

    if (typeof queryFunctionToExecute !== 'function') {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: {
                Code: "InvalidParameterValue",
                Message: "The 'queryFunctionToExecute' parameter must be a function.",
            },
        }
    }

    return {
        statusCode: 200,
        headers: defaultHeaders(),
        body: {},
    }
}

//----------------------------------------------
//  DEFAULT RESPONSE HEADERS
//----------------------------------------------

function defaultHeaders() {
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    }
}

/*
=======================================================================
                             REFERENCE
=======================================================================

* SQL SELECT Documentation:
  https://en.wikipedia.org/wiki/Select_(SQL)

* Database Query Best Practices:
  Standard SQL SELECT operations for retrieving data

* Purpose:
  Retrieves all records from the Clientes_DynStock table. This table contains
  client configuration information for dynamic stock management, including
  FTP connection details and email settings. Uses a provided query execution
  function for flexibility, making it database-agnostic and compatible with
  any SQL database library.

* Use Cases:
  - Get complete list of dynamic stock clients
  - Retrieve client FTP configuration data
  - Export client connection settings for reporting
  - Integration with dynamic stock file transfer systems
  - Client inventory monitoring and configuration management

* Parameters:
  - pool (required): Pool service instance from your database library
  - queryFunctionToExecute (required): Function that executes queries (accepts pool and query)

* Response Format:
  {
    "Table": "Clientes_DynStock",
    "RowCount": number,
    "Rows": [{
      "CodigoCliente": "string",
      "TipoEnvio": "string",
      "FTP_Ip": "string",
      "FTP_UserName": "string",
      "FTP_Pass": "string",
      "FTP_Path": "string",
      "Email_Cliente": "string",
      "FTP_port": "string"
    }],
    "Query": "string"
  }

* Error Handling:
  - 400: Invalid parameters or SQL syntax error
  - 401: Authentication failed
  - 404: Table does not exist
  - 500: Internal server error
  - 504: Connection timeout

* Security Considerations:
  - Query is pre-built with no user input
  - Pool service must be properly authenticated
  - queryFunctionToExecute must be a trusted function
  - Contains sensitive data (FTP credentials, passwords)
  - IMPORTANT: Implement strict access controls for this data
  - Consider encrypting FTP_Pass field in database
  - Database-agnostic implementation works with any SQL database
  - Never log or expose FTP credentials in responses

* Important Notes:
  - Database-agnostic: works with MSSQL, MySQL, PostgreSQL, and other SQL databases
  - Requires a pool service instance from your database library
  - Query execution is delegated to provided function
  - Returns ALL records from the table (no filtering)
  - All columns from table are selected
  - Pool connections are NOT closed after queries - they're reused
  - Result structure uses 'rows' property (instead of 'recordset') for flexibility
  - Error handling covers multiple database error codes
  - Contains sensitive FTP credentials - handle with care
  - TipoEnvio indicates the delivery/sending method
  - FTP_port should be validated as numeric when used

=======================================================================
*/
