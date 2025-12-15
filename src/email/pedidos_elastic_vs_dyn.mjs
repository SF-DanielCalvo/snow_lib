/**
 * Generate HTML email for Elastic vs Dynamics orders report
 * 
 * @param {Array<Object>} tableRowsData - Array of order data objects (required)
 * @returns {Promise<Object>} Response object with generated HTML
 * 
 * @example
 * const result = await CreateEmailHTML([{NumeroPedido: '12345', Cliente: 'ClientA', Catalogo: 'Cat1', TipoPedido: 'Type1', Temporada: 'S1', Marca: 'Brand', FileName: 'file.xml'}]);
 * 
 * @example
 * const orderData = [{NumeroPedido: '67890', Cliente: 'ClientB', Catalogo: 'Cat2', TipoPedido: 'Type2', Temporada: 'S2', Marca: 'BrandB', FileName: 'order.xml'}];
 * const result = await CreateEmailHTML(orderData);
 */
export async function Create_Email_HTML(tableRowsData) {
    try {
        const Verifications = Verification(tableRowsData)
        if (Verifications.statusCode !== 200) {
            return Verifications
        }

        const result = await Call_CreateEmailHTML(tableRowsData)

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
//  FUNCTION: Generate Email HTML
//----------------------------------------------
/**
 * Creates complete HTML email by injecting table rows into template
 * 
 * @param {Array<Object>} tableRowsData - Array of order data objects
 * @returns {Object} Response object with HTML string
 */
async function Call_CreateEmailHTML(tableRowsData) {
    let httpStatusCode
    let body

    try {
        // Step 1: Get email template
        const emailTemplate = getEmailTemplate()

        // Step 2: Generate table rows HTML
        const tableRowsHTML = generateTableRows(tableRowsData)

        // Step 3: Replace placeholder with actual rows
        const completeHTML = emailTemplate.replace('[[ROWS]]', tableRowsHTML)

        // Step 4: Return success
        httpStatusCode = 200
        body = {
            HTML: completeHTML,
            RowCount: tableRowsData.length,
        }
    } catch (e) {
        console.error("Error generating email HTML:", e)
        httpStatusCode = 500
        body = {
            Code: e.code || 'UnknownError',
            Message: e.message,
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

function Verification(tableRowsData) {
    const Verification_tableRowsData = Verifications_tableRowsData(tableRowsData)

    const errors = []

    // Collect all errors
    if (Verification_tableRowsData.statusCode !== 200) {
        errors.push(Verification_tableRowsData.body.Message)
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

/**
 * Validates tableRowsData parameter
 * 
 * @param {Array<Object>} tableRowsData - Data to validate
 * @returns {Object} Validation result
 */
function Verifications_tableRowsData(tableRowsData) {
    if (!tableRowsData) {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: {
                Code: "InvalidParameterValue",
                Message: "The 'tableRowsData' parameter is required.",
            },
        }
    }

    if (!Array.isArray(tableRowsData)) {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: {
                Code: "InvalidParameterValue",
                Message: "The 'tableRowsData' parameter must be an array.",
            },
        }
    }

    if (tableRowsData.length === 0) {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: {
                Code: "InvalidParameterValue",
                Message: "The 'tableRowsData' parameter must contain at least one item.",
            },
        }
    }

    // Validate each row has required properties
    const requiredFields = ['NumeroPedido', 'Cliente', 'Catalogo', 'TipoPedido', 'Temporada', 'Marca', 'FileName']
    for (let i = 0; i < tableRowsData.length; i++) {
        const row = tableRowsData[i]
        for (const field of requiredFields) {
            if (!row.hasOwnProperty(field)) {
                return {
                    statusCode: 400,
                    headers: defaultHeaders(),
                    body: {
                        Code: "InvalidParameterValue",
                        Message: `Row at index ${i} is missing required field '${field}'.`,
                    },
                }
            }
        }
    }

    return {
        statusCode: 200,
        headers: defaultHeaders(),
        body: {},
    }
}

//----------------------------------------------
//  HELPER FUNCTIONS
//----------------------------------------------

/**
 * Get the email HTML template
 * 
 * @returns {string} Email template with [[ROWS]] placeholder
 */
function getEmailTemplate() {
    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Programmatic Report</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin: 0; padding: 0; background-color: #d7dde5; word-spacing: normal;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
        style="background-color: #d7dde5; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                    style="max-width: 600px; width: 100%; border-collapse: collapse; margin: 0 auto;">
                    <tr>
                        <td style="padding: 0;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="background-color: #46808C; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 24px 20px; text-align: center;">
                                        <img alt="OnePage Logo"
                                            src="https://snowfactory.s3.eu-west-3.amazonaws.com/logos/logo_snowfactory_completo_gris.png"
                                            onerror="this.onerror=null;this.src='https://placehold.co/150x50/333333/ffffff?text=LOGO';"
                                            style="display: block; border: 0; max-width: 150px; width: 100%; height: auto;"
                                            width="150" />
                                    </td>
                                </tr>
                            </table>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="background-color: #ffffff; border-collapse: collapse;">
                                <tr>
                                    <td
                                        style="padding: 32px 24px; font-family: Ubuntu, Helvetica, Arial, sans-serif; color: #000000; font-size: 16px; line-height: 1.5; text-align: center;">
                                        <div style="text-align: center; padding-bottom: 16px;">
                                            <span
                                                style="font-size: 24px; font-weight: bold; color: #1f2937; line-height: 1.2;">
                                                PROGRAMA AUTOMATICO
                                            </span>
                                        </div>
                                        <div style="text-align: center; padding-bottom: 24px;">
                                            <span style="font-size: 20px; color: #374151; line-height: 1.2;">
                                                REPORTE PEDIDOS DYNAMCIS VS ELASTIC
                                            </span>
                                        </div>
                                        <div style="text-align: center; padding-bottom: 24px;">
                                            <span
                                                style="font-size: 13px; color: #4b5563; line-height: 1.6; display: inline-block; max-width: 500px;">
                                                Pedidos generados y finalizados en <b
                                                    style="font-weight: bold;">Elastic</b> que aún no han sido
                                                transferidos a <b style="font-weight: bold;">Dynamics</b>.
                                                <div style="padding-top: 8px;">
                                                    Se debe tener en cuenta que pueden encontrarse en el <b
                                                        style="font-weight: bold;">TDI</b> o en proceso de transferencia
                                                    de <b style="font-weight: bold;">Elastic</b> a <b
                                                        style="font-weight: bold;">Dynamics</b>.
                                                </div>
                                            </span>
                                        </div>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0"
                                            width="100%"
                                            style="border-collapse: collapse; margin: 20px 0; border: 1px solid #e5e7eb;">

                                            <!-- Table Header -->
                                            <thead style="background-color: #f3f4f6;">
                                                <tr>
                                                    <th
                                                        style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 10px; font-weight: bold; text-align: center; color: #1f2937; text-transform: uppercase; line-height: 1.2;">
                                                        NumeroPedido</th>
                                                    <th
                                                        style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 10px; font-weight: bold; text-align: center; color: #1f2937; text-transform: uppercase; line-height: 1.2;">
                                                        Cliente</th>
                                                    <th
                                                        style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 10px; font-weight: bold; text-align: center; color: #1f2937; text-transform: uppercase; line-height: 1.2;">
                                                        Catalogo</th>
                                                    <th
                                                        style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 10px; font-weight: bold; text-align: center; color: #1f2937; text-transform: uppercase; line-height: 1.2;">
                                                        TipoPedido</th>
                                                    <th
                                                        style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 10px; font-weight: bold; text-align: center; color: #1f2937; text-transform: uppercase; line-height: 1.2;">
                                                        Temporada</th>
                                                    <th
                                                        style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 10px; font-weight: bold; text-align: center; color: #1f2937; text-transform: uppercase; line-height: 1.2;">
                                                        Marca</th>
                                                    <th
                                                        style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 10px; font-weight: bold; text-align: center; color: #1f2937; text-transform: uppercase; line-height: 1.2;">
                                                        FileName</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                [[ROWS]]
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                    style="max-width: 600px; width: 100%; border-collapse: collapse; margin: 0 auto;">
                    <tr>
                        <td align="center"
                            style="padding: 16px 24px 0px 24px; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 10px; color: #6b7280; line-height: 1.5; text-align: center;">
                            Por favor, no responda a este correo electrónico.
                        </td>
                    </tr>
                    <tr>
                        <td align="left"
                            style="padding: 16px 24px 32px 24px; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 9px; color: #9ca3af; line-height: 1.5; text-align: justify;">
                            AVISO DE CONFIDENCIALIDAD: Este mensaje y sus archivos van dirigidos exclusivamente a su
                            destinatario, pudiendo contener información confidencial sometida a secreto profesional. No
                            está permitida su reproducción o distribución sin la autorización expresa de SNOW FACTORY,
                            SL. Si usted no es el destinatario final por favor elimínelo e infórmenos por esta vía.
                            <br><br>
                            De conformidad con lo establecido en el Reglamento General -UE- 2016/679, del Parlamento y
                            Consejo de Europa,  la LOPD 3/2018, de garantía de los derechos digitales, la Ley 34/2002,
                            de 11 de julio, de Servicios de la Sociedad de la Información y el Comercio Electrónico, y
                            la Ley 9/2014, de 9 de mayo, General de Telecomunicaciones, le informamos que sus datos son
                            tratados con la finalidad de gestionar los servicios contratados y mandarle información de
                            nuestra entidad, SNOW FACTORY, SL.
                            Asimismo, le informamos la posibilidad de ejercer los derechos de acceso, rectificación,
                            oposición, supresión, limitación y portabilidad de sus datos ante SNOW FACTORY, SL: Ctra, de
                            Cornellá, 140 7º A, 08950 de Esplugues de Llobregat (Barcelona), indicando en todo caso la
                            Referencia: "Protección de datos" y acompañando algún documento que acredite su identidad,
                            como copia del DNI.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}

/**
 * Generate HTML table rows from order data
 * 
 * @param {Array<Object>} tableRowsData - Array of order objects
 * @returns {string} HTML string containing all table rows
 */
function generateTableRows(tableRowsData) {
    const rows = []

    for (const rowData of tableRowsData) {
        let row = '<tr style="background-color: #ffffff;">\n'
        row += `<td style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center; color: #374151;">${rowData.NumeroPedido}</td>\n`
        row += `<td style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center; color: #374151;">${rowData.Cliente}</td>\n`
        row += `<td style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center; color: #374151;">${rowData.Catalogo}</td>\n`
        row += `<td style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center; color: #374151;">${rowData.TipoPedido}</td>\n`
        row += `<td style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center; color: #374151;">${rowData.Temporada}</td>\n`
        row += `<td style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center; color: #374151;">${rowData.Marca}</td>\n`
        row += `<td style="padding: 10px 4px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center; color: #374151;">${rowData.FileName}</td>\n`
        row += '</tr>\n'
        rows.push(row)
    }

    return rows.join('')
}

//----------------------------------------------
//  DEFAULT RESPONSE HEADERS
//----------------------------------------------

/**
 * Returns default HTTP response headers
 * 
 * @returns {Object} Headers object with CORS and content-type settings
 */
function defaultHeaders() {
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
    }
}

/*
=======================================================================
                             REFERENCE
=======================================================================

* HTML Email Best Practices:
  https://www.campaignmonitor.com/dev-resources/guides/coding-html-emails/

* Email Template Documentation:
  HTML email templates for reporting Elastic vs Dynamics order discrepancies

* Purpose:
  Generates a fully formatted HTML email report showing orders that have been
  completed in Elastic but not yet transferred to Dynamics. The report includes
  order details in a styled table with company branding and legal disclaimers.
  This is used for automated monitoring and alerting of pending order transfers
  between systems.

* Use Cases:
  - Generate daily/weekly reports of pending order transfers
  - Alert administrators of orders stuck in transfer pipeline
  - Create audit trails for order synchronization
  - Monitor TDI (integration) process status
  - Email notifications for system administrators

* Parameters:
  - tableRowsData (required): Array of order objects, each containing:
    * NumeroPedido: Order number
    * Cliente: Customer name/code
    * Catalogo: Catalog identifier
    * TipoPedido: Order type
    * Temporada: Season/campaign
    * Marca: Brand
    * FileName: Associated file name

* Response Format:
  {
    "HTML": "<complete HTML string>",
    "RowCount": number
  }

* Error Handling:
  - 400: Invalid parameters (missing, wrong type, empty array, missing fields)
  - 500: Internal error during HTML generation

* Security Considerations:
  - Input data is not sanitized - ensure data source is trusted
  - HTML injection possible if data contains malicious HTML/JS
  - IMPORTANT: Validate and sanitize data before calling this function
  - Email contains company confidential information
  - Ensure email is sent only to authorized recipients
  - Consider encrypting email content for sensitive data

* Important Notes:
  - Email template uses inline CSS for maximum email client compatibility
  - Template includes Snow Factory branding and logo
  - Contains legal disclaimers (GDPR, confidentiality)
  - Responsive design with mobile viewport support
  - Fallback logo URL if primary logo fails to load
  - All required fields must be present in each row object
  - Empty arrays are rejected (at least one row required)
  - Template is hardcoded in Spanish language
  - Logo hosted on S3 (ensure availability)

=======================================================================
*/
