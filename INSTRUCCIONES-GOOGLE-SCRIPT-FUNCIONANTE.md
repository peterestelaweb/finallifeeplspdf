# 📧 Instrucciones para restaurar Google Script que FUNCIONABA

El problema no es el código, es que el Google Script anterior fue eliminado o deshabilitado. Tenemos que crear uno nuevo con el código original que funcionaba.

## 🔧 PASOS PARA RESTAURAR:

### 1. Crear nuevo Google Apps Script
1. Ve a [script.google.com](https://script.google.com)
2. Haz clic en **"Nuevo proyecto"**
3. Dale un nombre: "Formulario LifePlus PDF"

### 2. Copiar el código original
1. Borra todo el código que aparece por defecto
2. Copia y pega el contenido de: `google-script-para-deploy.js`
3. Haz clic en **"Guardar proyecto"** (💾)

### 3. Crear Google Sheets (opcional pero recomendado)
1. En el menú, ve a **Extensiones** → **Apps Script**
2. Ejecuta la función `createSpreadsheet`
3. Se creará una hoja de cálculo nueva
4. Copia el ID de la hoja (de la URL): `https://docs.google.com/spreadsheets/d/ID_AQUI/edit`
5. Reemplaza `TU_SPREADSHEET_ID_AQUI` en el código con ese ID

### 4. Desplegar como Web App
1. Haz clic en **"Desplegar"** → **"Nuevo despliegue"**
2. Selecciona **"Aplicación web"**
3. Configuración:
   - **Descripción**: "Formulario de contacto LifePlus PDF"
   - **Ejecutar como**: "Yo"
   - **Quién tiene acceso**: "Cualquiera"
4. Haz clic en **"Desplegar"**
5. **AUTORIZA los permisos solicitados** (es normal)
6. Copia la URL del Web App: `https://script.google.com/macros/s/ID_DEL_SCRIPT/exec`

### 5. Actualizar el formulario
1. Abre `index.html`
2. Busca esta línea:
   ```html
   <form action="php/send-contact.php" method="POST">
   ```
3. Reemplázala con:
   ```html
   <form action="https://script.google.com/macros/s/TU_ID_DEL_SCRIPT/exec" method="POST">
   ```

### 6. Test de funcionamiento
1. Sube `index.html` al servidor
2. Completa el formulario con datos de prueba
3. Usa PIN: `6411840`
4. **Debería llegar email exactamente como antes**

## 📋 El formato del email será:
```
🌞 SUNSHINE TEAM
Nuevo contacto de LifePlus

📋 Información del Contacto

Fecha:	25/10/2025, 16:00:00
Nombre:	[Nombre del usuario]
Email:	[email@ejemplo.com]
Teléfono:	+34 XXX XXX XXX
Motivo:	[Oportunidad de negocio]
Tiene cliente:	Sí/No
PIN Cliente:	[Si aplica]
Recomendado por:	[Si aplica]
❓ ¿Cómo podemos ayudar?

[Mensaje del usuario]

---
Enviado desde: lifepluspdf.peterestela.com
IP: web
🌞 SUNSHINE TEAM - LifePlus
```

## ✅ Características restauradas:
- ✅ **Mismo formato** que funcionaba antes
- ✅ **Email directo** a `maykasunshineteam@gmail.com`
- ✅ **Validación PIN** (incluye 6411840)
- ✅ **Guardado en Google Sheets**
- ✅ **Sin dependencias del servidor**

## 🔍 Test interno:
Puedes testear el script ejecutando la función `testPost()` desde el editor de Google Apps Script.

## 📞 Si tienes problemas:
1. Asegúrate de autorizar todos los permisos solicitados
2. Verifica que el Web App está publicado para "Cualquiera"
3. El código del script debe ser el de `google-script-para-deploy.js`

¡Esto restaurará exactamente la funcionalidad que tenías antes!