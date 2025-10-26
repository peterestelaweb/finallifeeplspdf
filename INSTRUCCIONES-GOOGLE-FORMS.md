# Instrucciones para Configurar Google Forms

El formulario ahora usa Google Forms en lugar de PHP, lo que significa que funcionará en cualquier hosting (incluido Netlify, GitHub Pages, etc.).

## Pasos para configurar:

### 1. Crear el Google Form
1. Ve a [Google Forms](https://forms.google.com)
2. Crea un nuevo formulario con estos campos:
   - Nombre (texto corto)
   - Email (texto corto)
   - Teléfono (texto corto)
   - Motivo de contacto (lista desplegable)
   - ¿Cómo te podemos ayudar? (párrafo)
   - ¿Tienes ya NÚMERO DE CLIENTE en LifePlus? (casilla de verificación)
   - Número PIN del cliente (texto corto)
   - ¿Quién te recomendó? (texto corto)

### 2. Obtener los IDs de los campos
1. Ve a la vista previa del formulario (ícono del ojo)
2. Haz clic derecho en cada campo y selecciona "Inspeccionar"
3. Busca el atributo `name="entry.XXXXXXXX"` para cada campo
4. Actualiza los IDs en el archivo `js/contacto-simple.js`

### 3. Obtener la URL del formulario
1. En tu Google Form, ve a "Enviar"
2. Haz clic en el ícono </>
3. Copia la URL del formulario
4. Actualiza la URL en el archivo `js/contacto-simple.js` (línea 102)

### 4. Configurar notificaciones
1. En tu Google Form, ve a la pestaña "Respuestas"
2. Haz clic en los 3 puntos y selecciona "Obtener enlace para las respuestas"
3. Configura notificaciones por email para recibir los mensajes

## IDs de ejemplo (debes actualizarlos):
```javascript
const camposGoogleForm = {
    'entry.2005620554': datos.nombre,              // Nombre
    'entry.1045781291': datos.email,              // Email
    'entry.1065046570': datos.telefono,           // Teléfono
    'entry.1166974658': datos.motivo,              // Motivo
    'entry.839337160': datos.ayuda,               // Ayuda
    'entry.1167336696': datos.tieneCliente ? 'Sí' : 'No',  // Tiene cliente
    'entry.890885904': datos.pinCliente || '',     // PIN Cliente
    'entry.1704689350': datos.recomendado || ''   // Recomendado por
};
```

## Ventajas de esta solución:
- ✅ Funciona en cualquier hosting estático
- ✅ No requiere PHP ni servidor backend
- ✅ Recibe notificaciones por email automáticamente
- ✅ Puedes ver todas las respuestas en una hoja de cálculo
- ✅ Es gratis y confiable