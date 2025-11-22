# 📋 Instrucciones del Sistema de Indexación de PDFs

## 🔐 Sistema Seguro de Administración

### 📍 URL del Panel de Administración
```
https://lifepluspdf.peterestela.com/php/admin-indexer.php
```

### 🔑 Contraseña por Defecto
**LifePlus2025@Admin**

⚠️ **CAMBIA ESTA CONTRASEÑA** inmediatamente después del primer acceso.

---

## 🚀 Proceso Completo de Indexación

### Paso 1: Subir Nuevos PDFs
1. Conéctate a tu hosting (cPanel/FTP)
2. Navega a: `/public_html/pdfs/`
3. Sube los nuevos archivos PDF

### Paso 2: Acceder al Panel Admin
1. Ve a: `https://lifepluspdf.peterestela.com/php/admin-indexer.php`
2. Ingresa tu contraseña de administrador
3. Verás el panel con estadísticas actuales

### Paso 3: Ejecutar Indexación
1. Haz clic en **"🚀 Indexar Todos los PDFs"**
2. Confirma la acción
3. Espera el proceso (puede tardar varios minutos)
4. El sistema actualizará automáticamente:
   - ✅ **Índice JSON** (`data/pdf-index.json`)
   - ✅ **Motor de búsqueda** (`js/search-local.js`)
   - ✅ **Contadores de descargas** (se mantienen)

### Paso 4: Verificación
- El panel mostrará las estadísticas actualizadas
- El buscador principal reflejará los cambios inmediatamente
- Todos los PDFs nuevos estarán disponibles

---

## 🛡️ Características de Seguridad

### ✅ Protecciones Implementadas
- **Autenticación por contraseña**
- **Sesiones con timeout** (1 hora)
- **Registro de todas las acciones** (`data/admin-indexer.log`)
- **Sin acceso público** a funciones críticas
- **IP tracking** en logs

### 🚫 Antiguos Sistemas (Inseguros)
Estos archivos han sido reemplazados y deberían eliminarse:
- ~~`php/scan-pdfs.php`~~ (Acceso público)
- ~~`php/generate-index.php`~~ (Acceso público)

---

## 🔧 Solución al Problema Actual

### Problema Identificado:
- **Índice JSON**: 123 PDFs ✅ (Actualizado)
- **search-local.js**: 122 PDFs ❌ (Desactualizado)
- **Resultado**: Buscador muestra 122 PDFs

### Solución Implementada:
El nuevo sistema **sincroniza automáticamente** ambos archivos:
1. **Regenera** `search-local.js` con los datos actualizados
2. **Mantiene** contadores de descargas existentes
3. **Actualiza** timestamp de última modificación

---

## 📂 Estructura de Archivos Modificados

```
/php/
├── admin-indexer.php          # ✨ NUEVO: Panel seguro de administración
├── generate-index.php         # ⚠️ MANTENER: Script interno
└── scan-pdfs.php             # ❌ ELIMINAR: Antiguo panel público

/data/
├── pdf-index.json            # ✅ MANTENER: Índice principal
└── admin-indexer.log         # ✨ NUEVO: Registro de actividades

/js/
└── search-local.js           # 🔄 ACTUALIZADO: Motor de búsqueda
```

---

## 🔄 Proceso Automático del Sistema

Cuando ejecutas "Indexar Todos los PDFs":

1. **Escaneo**: Analiza `/pdfs/` en busca de archivos
2. **Detección**: Identifica archivos nuevos y modificados
3. **Metadata**: Extrae título, categoría, tags del nombre
4. **JSON**: Actualiza `data/pdf-index.json`
5. **Motor**: Regenera `js/search-local.js`
6. **Log**: Registra toda la operación
7. **Listo**: Actualización inmediata en el buscador

---

## 🚨 Recomendaciones de Seguridad

### 1. Cambiar Contraseña
Edita esta línea en `php/admin-indexer.php`:
```php
'admin_password' => 'LifePlus2025@Admin',  // <-- CAMBIA ESTO
```

### 2. Eliminar Archivos Inseguros
```bash
# Eliminar acceso público
rm /public_html/php/scan-pdfs.php
# O moverlos a carpeta privada
mv /public_html/php/scan-pdfs.php /private/
```

### 3. Monitorear Logs
Revisa periódicamente: `data/admin-indexer.log`

---

## 📱 Funcionalidades del Panel

### 📊 Estadísticas en Tiempo Real
- PDFs totales indexados
- Tamaño total de la biblioteca
- Número de categorías
- Última actualización

### 🔄 Operaciones Disponibles
- **Indexación Completa**: Procesa todos los PDFs
- **Logout**: Cierra sesión segura
- **Logs**: Registro de actividades con timestamps

### 📋 Sistema de Logs
Cada acción incluye:
- Timestamp exacto
- Dirección IP del administrador
- Detalles de la operación
- Resultados (éxito/error)

---

## 🛠️ Mantenimiento

### Mensual
- Revisar logs de actividad
- Verificar tamaño de índice
- Backup de archivos importantes

### Trimestral
- Cambiar contraseña de admin
- Actualizar archivos del sistema
- Optimizar base de datos de búsqueda

---

## 🆘 Solución de Problemas

### Si no puedes acceder:
1. Verifica la URL: `https://lifepluspdf.peterestela.com/php/admin-indexer.php`
2. Revisa la contraseña (case-sensitive)
3. Limpia caché del navegador
4. Espera 1 hora si hay muchas sesiones

### Si la indexación falla:
1. Revisa logs en `data/admin-indexer.log`
2. Verifica permisos de carpetas (755)
3. Confirma que los PDFs estén en `/pdfs/`

### Si los cambios no se ven:
1. Espera 1-2 minutos
2. Recarga página con `Ctrl+Shift+R`
3. Limpia caché del navegador
4. Verifica que no haya CDN cache

---

## 📞 Soporte

Para problemas técnicos:
1. Revisa los logs del sistema
2. Verifica permisos de archivos
3. Contacta a tu desarrollador

---

**📅 Última actualización**: 24 de Octubre de 2025
**🔐 Versión segura**: v2.0
**👤 Acceso**: Administrador únicamente