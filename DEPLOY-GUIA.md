# 🚀 Guía de Despliegue - PDF Search en PeterEstela.com

## 📋 Resumen del Sistema

He creado una versión **completamente estática** de tu buscador de PDFs que funciona:

✅ **Sin Node.js** - Solo necesita hosting compartido estándar
✅ **Sin PostgreSQL** - Usa archivos JSON para almacenamiento
✅ **Sin dependencias complejas** - Solo HTML + CSS + JavaScript + PHP
✅ **Indexación automática** - Detecta nuevos PDFs al añadirlos
✅ **Fuzzy search** - Encuentra documentos aunque estén mal escritos

---

## 🎯 PASO 1: Crear Subdominio en cPanel

1. Entra en tu **cPanel** de `peterestela.com`
2. Busca la sección **"Subdominios"**
3. Crea un nuevo subdominio:
   - **Subdominio:** `pdfs`
   - **Dominio:** `peterestela.com`
   - **Directorio raíz:** `/public_html/pdfs`

---

## 📁 PASO 2: Subir Archivos via FileZilla

### Conexión FTP:
- **Servidor:** `ftp.peterestela.com`
- **Usuario:** Tu usuario de cPanel
- **Contraseña:** Tu contraseña de cPanel
- **Puerto:** 21

### Estructura a subir:
```
/public_html/pdfs/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── fuzzy-search.js
│   └── search.js
├── php/
│   ├── generate-index.php
│   ├── auto-index.php
│   └── scan-pdfs.php
├── data/
│   └── .htaccess
├── pdfs/ (vacía - aquí subirás tus PDFs)
└── uploads/ (vacía)
```

**📌 NOTA:** Sube TODOS los archivos y carpetas de la carpeta `VERSION-ESTATICA`

---

## 🔐 PASO 3: Configurar Permisos

Después de subir los archivos, ve a tu **cPanel > Administrador de archivos**:

1. **Carpeta `pdfs/`** → Permisos: `755`
2. **Carpeta `data/`** → Permisos: `755`
3. **Archivo `data/pdf-index.json`** → Permisos: `644`

---

## 📄 PASO 4: Subir tus PDFs Actuales

### Via FileZilla:
1. Conecta a tu FTP
2. Navega a `/public_html/pdfs/pdfs/`
3. Sube **TODOS** tus archivos PDF a esta carpeta

### Via cPanel:
1. cPanel > Administrador de archivos
2. Navega a `/public_html/pdfs/pdfs/`
3. Usa "Subir" para añadir tus PDFs

---

## ⚙️ PASO 5: Generar Índice Inicial

1. Abre tu navegador y visita:
   ```
   https://pdfs.peterestela.com/php/generate-index.php
   ```

2. Deberías ver un mensaje como:
   ```json
   {
     "success": true,
     "message": "Índice generado exitosamente",
     "total_pdfs": 32,
     "new_files": 32,
     "updated_files": 0
   }
   ```

3. **¡LISTO!** Tu buscador ya funciona en:
   ```
   https://pdfs.peterestela.com
   ```

---

## 🔄 PASO 6: Configurar Indexación Automática (Opcional)

### Para actualización automática cada 6 horas:

1. En cPanel, busca **"Cron Jobs"**
2. Añade un nuevo cron job:
   ```
   Minuto: 0
   Hora: */6
   Día: *
   Mes: *
   Día de semana: *
   Comando: /usr/bin/php /home/USUARIO/public_html/pdfs/php/auto-index.php
   ```

   **Reemplaza `USUARIO` con tu usuario de cPanel**

### Para actualización manual:
1. Sube nuevos PDFs a la carpeta `pdfs/`
2. Visita: `https://pdfs.peterestela.com/php/generate-index.php`
3. ¡Listo! Los nuevos PDFs aparecen en el buscador

---

## 📊 Panel de Control

Accede al panel de administración:
```
https://pdfs.peterestela.com/php/scan-pdfs.php
```

Desde aquí puedes:
- Ver estadísticas de tu biblioteca
- Escanear manualmente nuevos PDFs
- Ver logs del sistema
- Limpiar registros

---

## 🎮 Uso Diario

### Para añadir nuevos PDFs:
1. Abre FileZilla
2. Conecta a `ftp.peterestela.com`
3. Ve a `/public_html/pdfs/pdfs/`
4. Arrastra los nuevos PDFs
5. (Opcional) Visita `https://pdfs.peterestela.com/php/generate-index.php`

### Para buscar documentos:
1. Visita `https://pdfs.peterestela.com`
2. Escribe en el buscador
3. ¡Encuentra lo que necesites!

---

## 🔍 Características Disponibles

✅ **Búsqueda instantánea** - Sin recargas de página
✅ **Fuzzy search** - Encuentra "PROANTENOLS" aunque busques "PROANTHENOLS"
✅ **Categorías automáticas** - Vitaminas, Omega, Suplementos, etc.
✅ **Ordenamiento** - Por relevancia, nombre, fecha, tamaño
✅ **Descarga directa** - Click para descargar PDFs
✅ **Vista previa** - Abrir en nueva pestaña
✅ **Responsive** - Funciona en móviles y tablets
✅ **Estadísticas** - Número de documentos, tamaño total, etc.

---

## 🛠️ Solución de Problemas

### Si no ves los PDFs:
1. Verifica que subiste los PDFs a la carpeta correcta: `/pdfs/`
2. Ejecuta el generador de índice: `/php/generate-index.php`
3. Revisa los permisos de las carpetas

### Si la búsqueda no funciona:
1. Verifica que el archivo `data/pdf-index.json` existe
2. Revisa la consola del navegador por errores
3. Prueba recargar la página

### Si los scripts PHP no funcionan:
1. Verifica que tu hosting soporta PHP 7.4+
2. Revisa los permisos de los archivos PHP
3. Contacta a soporte de tu hosting

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía paso a paso
2. Verifica los logs en `/php/scan-pdfs.php`
3. Prueba los pasos manualmente

¡Tu sistema de búsqueda de PDFs estará funcionando en `https://pdfs.peterestela.com`! 🎉