# PDF Search - Versión Estática para Hosting Compartido

Esta versión está diseñada para funcionar en hosting compartido (cPanel) sin necesidad de Node.js ni PostgreSQL.

## 📁 Estructura de Archivos

```
pdfs.peterestela.com/
├── index.html                    # Página principal de búsqueda
├── css/
│   └── styles.css               # Estilos CSS
├── js/
│   ├── search.js                # Lógica de búsqueda y fuzzy search
│   ├── pdf-indexer.js           # Indexación automática
│   └── fuzzy-search.js          # Algoritmos de búsqueda aproximada
├── php/
│   ├── scan-pdfs.php            # Escanea carpeta de PDFs
│   ├── generate-index.php       # Genera índice JSON
│   └── auto-index.php           # Indexación automática vía cron
├── data/
│   └── pdf-index.json           # Índice de PDFs (generado automáticamente)
├── pdfs/                        # Carpeta donde se suben los PDFs
└── uploads/                     # Carpeta temporal para subidas
```

## 🚀 Cómo Subir al Hosting

### 1. Crear Subdominio en cPanel
1. Entrar a cPanel
2. Ir a "Subdominios"
3. Crear: `pdfs.peterestela.com`
4. Apuntar a la carpeta `public_html/pdfs`

### 2. Subir Archivos via FileZilla
1. Conectar a `ftp.peterestela.com`
2. Navegar a `public_html/pdfs/`
3. Subir todas las carpetas y archivos de esta versión

### 3. Configurar Permisos
- Carpeta `pdfs/`: 755 (lectura/escritura para servidor)
- Carpeta `data/`: 755 (para generar índice)
- Archivo `data/pdf-index.json`: 644

## 🔧 Cómo Funciona

### Búsqueda Local (JavaScript)
- Búsqueda en tiempo real sin servidor
- Fuzzy search para aproximaciones
- No necesita conexión a base de datos

### Indexación Automática (PHP)
- Script PHP que escanea carpeta `pdfs/`
- Genera archivo JSON con metadata
- Se puede ejecutar vía cron job

### Proceso de Subida de PDFs
1. Subir PDFs a carpeta `pdfs/` via FileZilla
2. Ejecutar script de indexación (automático o manual)
3. ¡Listo! El PDF aparece en el buscador

## 📋 Uso Diario

### Para añadir nuevos PDFs:
1. Abrir FileZilla
2. Conectar a `ftp.peterestela.com`
3. Navegar a `public_html/pdfs/pdfs/`
4. Arrastrar nuevos PDFs
5. (Opcional) Ejecutar script de indexación

### Para mantener actualizado:
- Configurar cron job para indexación automática
- O ejecutar manualmente cuando se añadan PDFs

## 🎯 Características

✅ **Búsqueda Instantánea** - Sin recargas de página
✅ **Fuzzy Search** - Encuentra aunque esté mal escrito
✅ **Indexación Automática** - Detecta nuevos PDFs
✅ **Sin Base de Datos** - Usa archivos JSON
✅ **Responsive** - Funciona en móviles
✅ **Fácil Mantenimiento** - Solo subir PDFs

## 🛠️ Configuración Adicional

### Cron Job para Indexación Automática
En cPanel > Cron Jobs:
```
0 */6 * * * /usr/bin/php /home/usuario/public_html/pdfs/php/auto-index.php
```
(Se ejecuta cada 6 horas)

### Personalización
- Editar `js/search.js` para ajustar algoritmos
- Modificar `css/styles.css` para cambiar diseño
- Añadir más campos en `php/generate-index.php`