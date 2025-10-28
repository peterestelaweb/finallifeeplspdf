/**
 * Google Apps Script - VERSIÓN ORIGINAL QUE FUNCIONABA
 * Copia y pega este código en script.google.com
 */

// Token de seguridad para validar las peticiones
const VALID_TOKEN = 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04';

// ID de la hoja de cálculo (reemplazar con el ID real cuando crees la hoja)
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

    // Obtener datos individuales con los nombres que envía el formulario
    const timestamp = new Date();
    const name = params.name || params.nombre || '';
    const email = params.email || '';
    const phone = params.phone || params.telefono || '';
    const motivo = params.motivo || '';
    const ayuda = params.ayuda || params.message || '';
    const pinCliente = params.pinCliente || params.pin_cliente || '';
    const recomendado = params.recomendado || params.recomendado || '';
    const source = params.source || 'lifepluspdf.peterestela.com';
    const tieneCliente = params.tieneCliente || params.tiene_cliente || 'No';

    // Mapear motivo a texto legible
    const motivos = {
        'información': 'Información sobre productos',
        'informacion': 'Información sobre productos',
        'compra': 'Quiero comprar productos',
        'oportunidad': 'Oportunidad de negocio',
        'soporte': 'Soporte técnico',
        'otro': 'Otro'
    };
    const motivoTexto = motivos[motivo] || motivo;

    // ENVIAR EMAIL DIRECTAMENTE (esto es lo que funcionaba antes)
    const emailAddress = 'maykasunshineteam@gmail.com';
    const subject = 'Nuevo contacto de LifePlus - ' + name;

    const body = `
🌞 SUNSHINE TEAM
Nuevo contacto de LifePlus

📋 Información del Contacto

Fecha:	${timestamp.toLocaleDateString()}, ${timestamp.toLocaleTimeString()}
Nombre:	${name}
Email:	${email}
Teléfono:	${phone}
Motivo:	${motivoTexto}
Tiene cliente:	${tieneCliente}
PIN Cliente:	${pinCliente}
Recomendado por:	${recomendado}
❓ ¿Cómo podemos ayudar?

${ayuda}

---
Enviado desde: ${source}
IP: ${Session.getActiveUserLocale() || 'web'}
🌞 SUNSHINE TEAM - LifePlus
    `.trim();

    // Enviar email
    MailApp.sendEmail({
      to: emailAddress,
      subject: subject,
      body: body
    });

    // Guardar en Google Sheets como respaldo (opcional)
    if (SPREADSHEET_ID !== 'TU_SPREADSHEET_ID_AQUI') {
      try {
        const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

        // Crear fila con datos
        const rowData = [
          timestamp,
          name,
          email,
          phone,
          motivoTexto,
          ayuda,
          tieneCliente,
          pinCliente,
          recomendado,
          source,
          Session.getActiveUserLocale() || 'web'
        ];

        // Agregar fila a la hoja
        sheet.appendRow(rowData);
      } catch (sheetError) {
        console.log('Error guardando en hoja: ' + sheetError.toString());
      }
    }

    // Responder con éxito
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Datos guardados correctamente y email enviado',
      timestamp: timestamp.toISOString(),
      email_sent: true
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Manejar errores
    console.log('Error en doPost: ' + error.toString());

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString(),
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para crear la hoja de cálculo automáticamente
function createSpreadsheet() {
  const spreadsheet = SpreadsheetApp.create('Contactos LifePlus PDF');
  const sheet = spreadsheet.getActiveSheet();

  // Configurar encabezados
  const headers = [
    'Timestamp',
    'Nombre',
    'Email',
    'Teléfono',
    'Motivo',
    'Ayuda',
    'Tiene Cliente',
    'PIN Cliente',
    'Recomendado por',
    'Fuente',
    'IP'
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

  // Compartir la hoja
  spreadsheet.addEditor('maykasunshineteam@gmail.com');

  return {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    message: 'Hoja de cálculo creada y compartida correctamente'
  };
}

// Función para testear el script
function testPost() {
  const testData = {
    token: VALID_TOKEN,
    name: 'Test User',
    email: 'test@example.com',
    phone: '600000000',
    motivo: 'oportunidad',
    ayuda: 'Test de ayuda desde Google Script',
    pinCliente: '6411840',
    recomendado: 'Test Recommendation',
    source: 'test.google.script'
  };

  const e = { parameter: testData };
  return doPost(e);
}