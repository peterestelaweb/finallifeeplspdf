// Google Apps Script para recibir datos del formulario, guardar en Google Sheets y enviar email
// Para usar: Copia este código en tu hoja de cálculo -> Extensiones -> Apps Script

function doPost(e) {
  try {
    var id = '1f5rhND6QIS6zfIzzdK2lbSbBXI6q3ozj1cBl0UapKy0';
    var name = 'Hoja 1';
    var token = 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04';

    if (!e) return json({ ok: false, error: 'No request' });

    var data = e.parameter || {};
    if (data.token !== token) return json({ ok: false, error: 'Unauthorized' });

    // Obtener datos del formulario
    var nombre   = (data.name || data.nombre || '').trim();
    var email    = (data.email || '').trim();
    var telefono = (data.phone || data.telefono || '').trim();
    var motivo   = (data.motivo || '').trim();
    var ayuda    = (data.ayuda || '').trim();
    var pin      = (data.pinCliente || '').trim();
    var rec      = (data.recomendado || '').trim();
    var src      = (data.source || 'web');
    var time     = new Date();

    // Obtener la hoja de cálculo
    var sheet = SpreadsheetApp.openById(id).getSheetByName(name);

    // Crear encabezados si es la primera fila
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Fecha/Hora', 'Nombre', 'Email', 'Telefono', 'Motivo', 'Ayuda', 'PIN Cliente', 'Recomendado por', 'Origen']);
    }

    // Añadir fila con los datos
    sheet.appendRow([time, nombre, email, telefono, motivo, ayuda, pin, rec, src]);

    // Enviar correo electrónico
    enviarEmailContacto({
      nombre: nombre,
      email: email,
      telefono: telefono,
      motivo: motivo,
      ayuda: ayuda,
      pinCliente: pin,
      recomendado: rec,
      source: src,
      timestamp: time
    });

    return json({ ok: true, message: 'Datos guardados y email enviado' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Función para enviar email de notificación
function enviarEmailContacto(datos) {
  try {
    const emailDestino = "maykasunshineteam@gmail.com";
    const asunto = "Nuevo contacto - SUNSHINE TEAM LifePlus";

    // Formatear la fecha
    const fecha = datos.timestamp ? new Date(datos.timestamp).toLocaleString('es-ES') : new Date().toLocaleString('es-ES');

    // Crear cuerpo del email en formato HTML
    const cuerpoHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #667eea; margin: 0;">🌞 SUNSHINE TEAM</h2>
              <p style="color: #666; margin: 10px 0;">Nuevo contacto de LifePlus</p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">📋 Información del Contacto</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Fecha:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${fecha}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Nombre:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${datos.nombre || 'No proporcionado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${datos.email || 'No proporcionado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Teléfono:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${datos.telefono || 'No proporcionado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Motivo:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${datos.motivo || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Tiene cliente:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${datos.tieneCliente || 'No'}</td>
                </tr>
                ${datos.pinCliente ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">PIN Cliente:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${datos.pinCliente}</td>
                </tr>` : ''}
                ${datos.recomendado ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Recomendado por:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${datos.recomendado}</td>
                </tr>` : ''}
              </table>
            </div>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #2d5a2d; margin-top: 0;">❓ ¿Cómo podemos ayudar?</h3>
              <p style="margin: 0; white-space: pre-wrap;">${datos.ayuda || datos.pregunta || 'No especificado'}</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                Enviado desde: lifepluspdf.peterestela.com<br>
                IP: ${datos.ip || 'web'}<br>
                🌞 SUNSHINE TEAM - LifePlus
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Versión texto plano para clientes de email que no soportan HTML
    const cuerpoTexto = `
NUEVO CONTACTO - SUNSHINE TEAM LifePlus

============================================
Información del Contacto
============================================
Fecha: ${fecha}
Nombre: ${datos.nombre || 'No proporcionado'}
Email: ${datos.email || 'No proporcionado'}
Teléfono: ${datos.telefono || 'No proporcionado'}
Motivo: ${datos.motivo || 'No especificado'}
Tiene cliente: ${datos.tieneCliente || 'No'}
${datos.pinCliente ? `PIN Cliente: ${datos.pinCliente}` : ''}
${datos.recomendado ? `Recomendado por: ${datos.recomendado}` : ''}

============================================
¿Cómo podemos ayudar?
============================================
${datos.ayuda || datos.pregunta || 'No especificado'}

============================================
Enviado desde: lifepluspdf.peterestela.com
IP: ${datos.ip || 'web'}
🌞 SUNSHINE TEAM - LifePlus
============================================
    `;

    // Enviar email
    MailApp.sendEmail({
      to: emailDestino,
      subject: asunto,
      htmlBody: cuerpoHtml,
      body: cuerpoTexto
    });

    Logger.log('Email enviado correctamente a ' + emailDestino);

  } catch (error) {
    Logger.log('Error al enviar email: ' + error.message);
  }
}

// Función para configurar los permisos (ejecutar una vez)
function setupPermissions() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  // Esta función se usa para autorizar el script
  return "Permisos configurados";
}

// Función para crear el webhook (ejecutar después de desplegar)
function getWebhookUrl() {
  const url = ScriptApp.getService().getUrl();
  return url;
}

// Función para probar el webhook
function testWebhook() {
  const testData = {
    timestamp: new Date().toISOString(),
    nombre: "Test Nombre",
    email: "test@email.com",
    telefono: "123456789",
    motivo: "Información",
    pregunta: "Pregunta de prueba",
    tieneCliente: "No",
    pinCliente: "",
    recomendado: "",
    ayuda: "Ayuda de prueba",
    ip: "127.0.0.1",
    user_agent: "Test Agent"
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(testData)
  };

  const response = UrlFetchApp.fetch(ScriptApp.getService().getUrl(), options);
  return JSON.parse(response.getContentText());
}