# 🎯 SOLUCIÓN COMPLETA GOOGLE SCRIPT - RECUPERAR FUNCIONAMIENTO ORIGINAL

## 📋 El Problema Identificado

✅ **El Google Script original funcionaba perfectamente**
✅ **Tenemos el código original y el ID real de Google Sheets**
✅ **Solo necesita ser re-deployado con una nueva URL**

## 🔧 DATOS ORIGINALES QUE FUNCIONABAN

### Google Sheets ID REAL:
```
1f5rhND6QIS6zfIzzdK2lbSbBXI6q3ozj1cBl0UapKy0
```

### Token de Seguridad:
```
d5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04
```

### Email Destino:
```
maykasunshineteam@gmail.com
```

## 🚀 PASOS PARA RESTAURAR

### 1. Ir a Google Apps Script
1. Abre [script.google.com](https://script.google.com)
2. Inicia sesión con tu cuenta Google

### 2. Crear Nuevo Proyecto
1. Haz clic en **"Nuevo proyecto"**
2. Dale un nombre: "Formulario LifePlus PDF"

### 3. Copiar el Código Original
1. Abre el archivo: `google-script-original-funcionante.gs`
2. Copia todo el código
3. Pega en el editor de Google Apps Script
4. Haz clic en **"Guardar proyecto"** (💾)

### 4. Dar Permisos a la Hoja de Cálculo
1. Abre la hoja de cálculo: https://docs.google.com/spreadsheets/d/1f5rhND6QIS6zfIzzdK2lbSbBXI6q3ozj1cBl0UapKy0
2. Haz clic en **"Compartir"**
3. Añade el email del script: `script-...@gserviceaccount.com`
4. Dale permisos de **"Editor"**

### 5. Desplegar como Web App
1. En Google Apps Script, haz clic en **"Desplegar"**
2. Selecciona **"Nuevo despliegue"**
3. Tipo: **"Aplicación web"**
4. Configuración:
   - Descripción: "Formulario de contacto LifePlus PDF (original)"
   - Ejecutar como: "Yo"
   - Quién tiene acceso: "Cualquiera"
5. Haz clic en **"Desplegar"**
6. **AUTORIZA todos los permisos solicitados**
   - Acceso a hojas de cálculo de Google
   - Envío de emails como tú

### 6. Obtener la Nueva URL
1. Una vez desplegado, copia la URL del Web App
2. Tendrá el formato: `https://script.google.com/macros/s/NUEVO_ID/exec`

### 7. Actualizar el Formulario
1. Abre `index.html` (en la raíz del proyecto)
2. Busca esta línea:
   ```html
   <form action="php/send-contact.php" method="POST">
   ```
3. Reemplázala con:
   ```html
   <form action="https://script.google.com/macros/s/NUEVO_ID/exec" method="POST">
   ```

### 8. Subir los Cambios
1. Sube `index.html` al servidor
2. ¡Listo!

## 📧 Formato del Email que Recibirás

```
📧 Nuevo Mensaje de Contacto
Buscador LifePlus Formulaciones PDF

📋 Datos del Contacto
Nombre: [Nombre del usuario]
Email: [email@ejemplo.com]
Teléfono: [+34 XXX XXX XXX]
Motivo de contacto: [Oportunidad de negocio]
PIN Cliente: [6411840]
Recomendado por: [Nombre del recomendador]

❓ ¿Cómo podemos ayudar?
[Ayuda solicitada por el usuario]

---
Enviado desde: web
Fecha y hora: 25/10/2025, 16:00:00
🌞 SUNSHINE TEAM - LifePlus
```

## ✅ Características Restauradas

- ✅ **Email HTML profesional** al mismo formato de antes
- ✅ **Guardado automático en Google Sheets** (hoja real)
- ✅ **Validación de PIN** (incluye 6411840)
- ✅ **Campo "Recomendado por"** incluido
- ✅ **Sin dependencias del servidor**
- ✅ **Funciona 100% offline** si Google está caído

## 🔍 Para Verificar que Funciona

1. Completa el formulario con datos de prueba
2. Usa PIN: `6411840`
3. Deberías recibir email en `maykasunshineteam@gmail.com`
4. Los datos también aparecerán en la hoja de Google Sheets

## 📁 Archivos Necesarios

1. ✅ **`google-script-original-funcionante.gs`** - Código original
2. ✅ **`index.html`** - Formulario actualizado
3. ✅ **Hoja de Google Sheets existente** - ID: `1f5rhND6QIS6zfIzzdK2lbSbBXI6q3ozj1cBl0UapKy0`

## 🆘 Si tienes Problemas

1. **Permisos de Google Sheets**: Asegúrate que el email del script tiene permisos de editor
2. **Autorización**: Acepta todos los permisos solicitados
3. **Web App**: Asegúrate que está publicada para "Cualquiera"
4. **Logs**: En Google Apps Script, revisa "Ejecuciones" para ver errores

¡Con esto tendrás exactamente la misma funcionalidad que funcionaba antes! 🎉