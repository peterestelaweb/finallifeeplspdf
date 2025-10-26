/**
 * Google Apps Script para recibir datos de formulario de contacto
 * Versión actualizada para manejar campos separados
 */

// Token de seguridad para validar las peticiones
const VALID_TOKEN = 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04';

// ID de la hoja de cálculo (reemplazar con el ID real)
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';

function doPost(e) {
  try {
    // Obtener parámetros de la petición
    const params = e.parameter;

    // Validar token de seguridad
    if (params.token !== VALID_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Token inválido'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Obtener datos individuales
    const timestamp = new Date();
    const name = params.name || '';
    const email = params.email || '';
    const phone = params.phone || '';
    const motivo = params.motivo || '';
    const ayuda = params.ayuda || '';
    const pinCliente = params.pinCliente || '';
    const recomendado = params.recomendado || '';
    const source = params.source || '';

    // Acceder a la hoja de cálculo
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    // Crear fila con datos en columnas separadas
    const rowData = [
      timestamp,
      name,
      email,
      phone,
      motivo,
      ayuda,
      pinCliente,
      recomendado,
      source
    ];

    // Agregar fila a la hoja
    sheet.appendRow(rowData);

    // Responder con éxito
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Datos guardados correctamente',
      row: rowData
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Manejar errores
    Logger.log(error.toString());

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para probar el script
function testPost() {
  const testData = {
    token: VALID_TOKEN,
    name: 'Test User',
    email: 'test@example.com',
    phone: '123456789',
    motivo: 'informacion',
    ayuda: 'Test de ayuda',
    pinCliente: '123456',
    recomendado: 'Test Recommendation',
    source: 'test.local'
  };

  const e = { parameter: testData };
  return doPost(e);
}

// Función para configurar la hoja de cálculo
function setupSheet() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

  // Configurar encabezados
  const headers = [
    'Timestamp',
    'Nombre',
    'Email',
    'Teléfono',
    'Motivo',
    'Ayuda',
    'PIN Cliente',
    'Recomendado por',
    'Fuente'
  ];

  // Limpiar hoja y agregar encabezados
  sheet.clear();
  sheet.appendRow(headers);

  // Formatear encabezados
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f0f0f0');

  // Ajustar ancho de columnas
  sheet.autoResizeColumns(1, headers.length);

  return 'Hoja configurada correctamente';
}