#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function analyzeLogoIssue() {
    console.log('🔍 ANALISIS COMPLETO DEL PROBLEMA DEL LOGO LIFEPLUS');
    console.log('==================================================');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    // Configurar logging de red
    page.on('request', request => {
        if (request.url().includes('LOGO')) {
            console.log('📡 REQUEST URL:', request.url());
        }
    });

    page.on('response', async response => {
        if (response.url().includes('LOGO')) {
            console.log('📡 RESPONSE URL:', response.url());
            console.log('📡 STATUS:', response.status());
            console.log('📡 HEADERS:', response.headers());
        }
    });

    page.on('requestfailed', request => {
        if (request.url().includes('LOGO')) {
            console.log('❌ REQUEST FAILED:', request.url());
            console.log('❌ ERROR:', request.failure().errorText);
        }
    });

    try {
        console.log('\n🌐 Analizando servidor: https://lifepluspdf.peterestela.com');
        await page.goto('https://lifepluspdf.peterestela.com', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Esperar a que la página cargue completamente
        await page.waitForTimeout(3000);

        // Captura de pantalla del estado actual
        await page.screenshot({
            path: 'test-results/analysis-servidor-logo.png',
            fullPage: true
        });

        console.log('\n🔍 VERIFICACIÓN DE RUTAS DE IMÁGENES:');

        // Verificar si la imagen existe en el DOM
        const logoInfo = await page.evaluate(() => {
            const logoImg = document.querySelector('img[src*="LOGO"]');
            return {
                exists: !!logoImg,
                src: logoImg ? logoImg.src : null,
                alt: logoImg ? logoImg.alt : null,
                naturalWidth: logoImg ? logoImg.naturalWidth : 0,
                naturalHeight: logoImg ? logoImg.naturalHeight : 0,
                complete: logoImg ? logoImg.complete : false,
                display: logoImg ? window.getComputedStyle(logoImg).display : 'none',
                visibility: logoImg ? window.getComputedStyle(logoImg).visibility : 'hidden',
                opacity: logoImg ? window.getComputedStyle(logoImg).opacity : '0'
            };
        });

        console.log('📋 INFORMACIÓN DEL LOGO:');
        console.log(JSON.stringify(logoInfo, null, 2));

        // Verificar errores de consola
        console.log('\n🐛 ERRORES DE CONSOLA:');
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('404') || text.includes('Failed to load') || text.includes('LOGO')) {
                console.log(`📝 ${msg.type()}: ${text}`);
            }
        });

        // Verificar permisos del archivo local
        console.log('\n📁 VERIFICACIÓN DE ARCHIVO LOCAL:');
        const localPath = '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/images/LOGO LIFEPLUS LIMPIO.png';

        try {
            const stats = fs.statSync(localPath);
            console.log('✅ Archivo local existe');
            console.log(`📊 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`🔒 Permisos: ${stats.mode.toString(8)}`);

            // Verificar si el archivo es legible
            fs.accessSync(localPath, fs.constants.R_OK);
            console.log('✅ Archivo es legible');
        } catch (error) {
            console.log('❌ Error con archivo local:', error.message);
        }

        // Probar diferentes combinaciones de mayúsculas/minúsculas
        console.log('\n🔤 VERIFICACIÓN DE SENSIBILIDAD A MAYÚSCULAS/MINÚSCULAS:');
        const variations = [
            'images/LOGO LIFEPLUS LIMPIO.png',
            'images/logo lifeplus limpio.png',
            'images/Logo LifePlus Limpio.png',
            'images/logo-lifeplus-limpio.png',
            'images/LOGO_LIFEPLUS_LIMPIO.png'
        ];

        for (const variation of variations) {
            try {
                const fullUrl = `https://lifepluspdf.peterestela.com/${variation}`;
                const response = await page.goto(fullUrl, { waitUntil: 'networkidle0' });
                console.log(`📡 ${variation}: ${response.status()}`);
            } catch (error) {
                console.log(`❌ ${variation}: ${error.message}`);
            }
        }

        // Análisis de red detallado
        console.log('\n🌐 ANÁLISIS DE RED:');
        const networkRequests = await page.evaluate(() => {
            return performance.getEntriesByType('resource')
                .filter(entry => entry.name.includes('LOGO'))
                .map(entry => ({
                    name: entry.name,
                    type: entry.initiatorType,
                    duration: entry.duration,
                    size: entry.transferSize,
                    status: 'success'
                }));
        });

        console.log('📡 Peticiones de red:', JSON.stringify(networkRequests, null, 2));

        // Probar carga directa de la imagen
        console.log('\n🖼️ PRUEBA DE CARGA DIRECTA:');
        const imageUrl = 'https://lifepluspdf.peterestela.com/images/LOGO LIFEPLUS LIMPIO.png';
        try {
            const imageResponse = await fetch(imageUrl);
            console.log(`📡 Estado: ${imageResponse.status}`);
            console.log(`📡 Content-Type: ${imageResponse.headers.get('content-type')}`);
            console.log(`📡 Content-Length: ${imageResponse.headers.get('content-length')}`);

            if (imageResponse.ok) {
                console.log('✅ Imagen cargada correctamente');
            } else {
                console.log('❌ Error al cargar imagen');
            }
        } catch (error) {
            console.log('❌ Error en petición:', error.message);
        }

        // Generar informe
        const informe = `
# INFORME DE ANÁLISIS - PROBLEMA DEL LOGO LIFEPLUS

## 🔍 DIAGNÓSTICO PRELIMINAR

### Información del Logo en el DOM:
- **Existe en DOM**: ${logoInfo.exists}
- **URL**: ${logoInfo.src}
- **Estado de carga**: ${logoInfo.complete ? 'Completado' : 'Incompleto'}
- **Dimensiones naturales**: ${logoInfo.naturalWidth}x${logoInfo.naturalHeight}
- **Estilos CSS**:
  - Display: ${logoInfo.display}
  - Visibility: ${logoInfo.visibility}
  - Opacity: ${logoInfo.opacity}

### Posibles Causas Identificadas:

1. **Problema de mayúsculas/minúsculas**: El nombre del archivo contiene espacios y mayúsculas
2. **Problema de codificación URL**: Los espacios en el nombre pueden causar problemas
3. **Problema de permisos en servidor**: El archivo puede no tener los permisos correctos
4. **Problema de ruta**: La ruta puede ser diferente en el servidor

## 💡 SOLUCIONES RECOMENDADAS:

### Opción 1: Renombrar el archivo (Recomendado)
Cambiar el nombre del archivo a uno sin espacios y en minúsculas:
\`\`\`
mv "images/LOGO LIFEPLUS LIMPIO.png" "images/logo-lifeplus-limpio.png"
\`\`\`

Y actualizar la referencia en index.html:
\`\`\`
<img src="images/logo-lifeplus-limpio.png" alt="LifePlus Logo" class="side-logo lifeplus-side-logo">
\`\`\`

### Opción 2: Codificar la URL
Usar codificación URL para los espacios:
\`\`\`
<img src="images/LOGO%20LIFEPLUS%20LIMPIO.png" alt="LifePlus Logo" class="side-logo lifeplus-side-logo">
\`\`\`

### Opción 3: Verificar permisos
Asegurarse de que el archivo tenga los permisos correctos en el servidor:
\`\`\`
chmod 644 images/LOGO\\ LIFEPLUS\\ LIMPIO.png
\`\`\`

## 📋 ACCIONES A REALIZAR:

1. **Inmediato**: Probar la Opción 1 (renombrar archivo)
2. **Verificación**: Probar la carga en el servidor después del cambio
3. **Alternativa**: Si la opción 1 no funciona, probar la Opción 2

## 🎯 CONCLUSIÓN:

El problema más probable es el nombre del archivo con espacios y mayúsculas, lo que causa problemas de compatibilidad entre sistemas operativos (local vs servidor).
`;

        // Guardar informe
        fs.writeFileSync('test-results/informe-logo-problema.md', informe);
        console.log('\n📄 Informe guardado en: test-results/informe-logo-problema.md');

    } catch (error) {
        console.log('❌ Error durante el análisis:', error.message);
    } finally {
        await browser.close();
    }
}

// Crear directorio de resultados si no existe
if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
}

analyzeLogoIssue().catch(console.error);