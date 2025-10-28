# 📧 Instrucciones para configurar Google Apps Script - Formulario LifePlus

## 🎯 Resumen
Configurar el Google Apps Script para que el formulario de contacto envíe mensajes automáticamente a `maykasunshineteam@gmail.com` y guarde los datos en una hoja de cálculo.

---

## 🔧 Pasos de configuración:

### 1. Crear Google Sheets para guardar datos
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo: "Contactos LifePlus PDF"
3. Copia el ID de la hoja (de la URL):
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_AQUI/edit
   ```
4. Reemplaza `SPREADSHEET_ID` en `google-apps-script-updated.js:10`

### 2. Crear Google Apps Script
1. Ve a [Google Apps Script](https://script.google.com)
2. Crea un nuevo proyecto: "Formulario LifePlus"
3. Copia y pega el contenido de `google-apps-script-updated.js`
4. **Importante**: Actualiza la línea 10 con tu SPREADSHEET_ID real

### 3. Configurar permisos
1. En Google Apps Script, ve a **Editor de manifestos** (`appsscript.json`)
2. Asegúrate de que incluye los siguientes permisos:
   ```json
   {
     "oauthScopes": [
       "https://www.googleapis.com/auth/spreadsheets.currentonly",
       "https://www.googleapis.com/auth/script.sendmail"
     ]
   }
   ```

### 4. Configurar el script como Web App
1. En Google Apps Script, haz clic en **Desplegar** → **Nuevo despliegue**
2. Selecciona tipo: **Aplicación web**
3. Configuración:
   - Descripción: "Formulario de contacto LifePlus PDF"
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquiera**
4. Haz clic en **Desplegar**
5. **Autoriza los permisos solicitados** (Google Sheets y Gmail)

### 5. Obtener URL del Web App
1. Una vez desplegado, copia la URL del Web App
2. Tendrá este formato:
   ```
   https://script.google.com/macros/s/SCRIPT_ID/exec
   ```
3. Actualiza `index.html:1332` con esta URL

### 6. Actualizar el formulario
1. En `index.html`, reemplaza `YOUR_SCRIPT_ID_HERE` con tu SCRIPT_ID real
2. El formulario ya está configurado con el token de seguridad

---

## 🧪 Test de funcionamiento

### Test básico
```javascript
// En Google Apps Script, ejecuta esta función para test:
function testPost() {
  const testData = {
    token: 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04',
    name: 'Test User',
    email: 'test@example.com',
    phone: '600000000',
    motivo: 'informacion',
    ayuda: 'Test de ayuda',
    pinCliente: '6411840',
    recomendado: 'Test Recommendation',
    source: 'test.local'
  };

  const e = { parameter: testData };
  return doPost(e);
}
```

### Test del formulario
1. Sube `index.html` al servidor
2. Completa el formulario con datos de prueba
3. Usa PIN: `6411840`
4. Verifica que llegue email a `maykasunshineteam@gmail.com`
5. Verifica que se guarden datos en Google Sheets

---

## 📋 Checklist final

- [ ] Crear Google Sheets y obtener ID
- [ ] Crear Google Apps Script con código actualizado
- [ ] Configurar permisos en manifest.json
- [ ] Desplegar como Web App
- [ ] Obtener URL del Web App
- [ ] Actualizar SCRIPT_ID en index.html:1332
- [ ] Probar formulario con PIN: 6411840
- [ ] Verificar email recibido
- [ ] Verificar datos en Google Sheets

---

## 🔍 Troubleshooting

### "Token inválido"
- Asegúrate que el token en el formulario coincide con el del script
- Token: `d5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04`

### "Error de permisos"
- Verifica que autorizaste todos los permisos solicitados
- Ejecuta `testPost()` para verificar configuración

### "Email no enviado"
- Verifica que la cuenta de Gmail tenga permisos para enviar emails
- Revisa la carpeta de spam

### "Datos no guardados"
- Verifica el SPREADSHEET_ID es correcto
- Asegúrate que la hoja de cálculo está compartida con tu email