# Instrucciones para Integrar Google Sheets con el Formulario de Contacto

## 🎯 Objetivo
Guardar automáticamente los datos del formulario de contacto en una hoja de cálculo de Google Sheets.

## 📋 Opciones Disponibles

### Opción 1: Google Forms (Recomendado - Más Fácil)
**Ventajas:**
- No requiere programación
- Configuración en 5 minutos
- Funciona inmediatamente

**Pasos:**

1. **Crear Google Form**
   - Ve a [Google Forms](https://forms.google.com)
   - Crea un nuevo formulario
   - Añade estos campos:
     - Nombre (respuesta corta)
     - Email (respuesta corta)
     - Teléfono (respuesta corta)
     - Motivo de contacto (lista desplegable)
     - Pregunta (párrafo)
     - Tiene cliente LifePlus (casilla de verificación)
     - PIN del cliente (respuesta corta)
     - Quién te recomendó (respuesta corta)
     - ¿Cómo podemos ayudar? (párrafo)

2. **Obtener Form ID**
   - En el formulario, ve a "Enviar" → icono de link </>
   - Copia la URL que aparece
   - El ID está entre `/d/` y `/formResponse`
   - Ejemplo: `1FAIpQLSfX9n2J3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O`

3. **Obtener Entry IDs**
   - Envía el formulario con datos de prueba
   - Ve a "Respuestas" → "Hoja de cálculo de Google"
   - Crea una nueva hoja de cálculo
   - En la hoja de cálculo, los entry IDs están en los encabezados
   - Formato: `entry.1234567890`

4. **Configurar el Script**
   - Edita el archivo: `php/send-contact-google-sheets.php`
   - Reemplaza:
     ```php
     'form_id' => 'TU_FORM_ID_AQUI',
     'entry_fields' => [
         'nombre' => 'entry.1234567890',    // Reemplazar con IDs reales
         'email' => 'entry.0987654321',
         // ... etc
     ]
     ```

5. **Actualizar el Formulario**
   - En `index.html`, cambia la URL del formulario:
     ```javascript
     fetch('php/send-contact-google-sheets.php', { ... })
     ```

### Opción 2: Google Sheets API (Avanzado)
**Ventajas:**
- Control total sobre los datos
- Formateo personalizado
- Automatización avanzada

**Requiere:**
- Cuenta de Google Cloud
- Configuración de API credentials
- Conocimientos técnicos

## 🚀 Implementación Rápida (Opción 1)

### Paso 1: Crear el Google Form
```
Título: Contactos SUNSHINE TEAM
Campos:
- Nombre (obligatorio)
- Email (obligatorio)
- Teléfono
- Motivo de contacto (obligatorio) → Información, Compra, Oportunidad, Soporte, Otro
- Pregunta (obligatorio)
- Tiene cliente LifePlus → Sí/No
- PIN del cliente
- Quién te recomendó
- ¿Cómo podemos ayudar? (obligatorio)
```

### Paso 2: Probar la Integración
1. Sube los archivos al servidor
2. Completa el formulario
3. Verifica que los datos aparecen en Google Forms → Respuestas

### Paso 3: Ver Hoja de Cálculo
- Ve a "Respuestas" → "Hoja de cálculo de Google"
- Los datos se guardarán automáticamente con formato:
  ```
  Fecha | Nombre | Email | Teléfono | Motivo | Pregunta | Tiene Cliente | PIN | Recomendado | Ayuda
  ```

## 🔧 Archivos Creados

- `php/send-contact-google-sheets.php` - Script para Google Forms
- `php/send-contact-google-api.php` - Script para Google Sheets API
- `data/contactos-google.log` - Respaldo local
- `data/contactos.csv` - Archivo CSV para importación manual

## ✅ Beneficios

- **Automatización**: Los contactos se guardan automáticamente
- **Organización**: Todos los datos en un solo lugar
- **Accesibilidad**: Accede desde cualquier dispositivo
- **Respaldos**: Múltiples métodos de almacenamiento
- **Exportación**: Fácil exportación a otros formatos

## 📞 Soporte

Si necesitas ayuda con la configuración:
1. Revisa las instrucciones paso a paso
2. Prueba con datos de prueba
3. Verifica los IDs del formulario
4. Contacta si tienes problemas técnicos

---

**¡Listo! Con esta configuración, todos los contactos se guardarán automáticamente en Google Sheets.**