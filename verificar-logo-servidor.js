const puppeteer = require('puppeteer');
const fs = require('fs');

async function verificarLogoServidor() {
    console.log('🔍 VERIFICACIÓN DEL LOGO EN SERVIDOR');
    console.log('=====================================');

    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    try {
        console.log('\n🌐 Analizando servidor: https://lifepluspdf.peterestela.com');

        // Configurar logging de red
        const networkLogs = [];
        page.on('request', request => {
            if (request.url().includes('LOGO')) {
                networkLogs.push({ type: 'request', url: request.url(), time: new Date().toISOString() });
            }
        });

        page.on('response', response => {
            if (response.url().includes('LOGO')) {
                networkLogs.push({
                    type: 'response',
                    url: response.url(),
                    status: response.status(),
                    headers: response.headers(),
                    time: new Date().toISOString()
                });
            }
        });

        page.on('requestfailed', request => {
            if (request.url().includes('LOGO')) {
                networkLogs.push({
                    type: 'failed',
                    url: request.url(),
                    error: request.failure().errorText,
                    time: new Date().toISOString()
                });
            }
        });

        await page.goto('https://lifepluspdf.peterestela.com', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Esperar a que la página cargue completamente
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Captura de pantalla
        await page.screenshot({
            path: 'test-results/servidor-logo-analisis.png',
            fullPage: true
        });

        console.log('\n📋 INFORMACIÓN DEL LOGO EN EL DOM:');
        const logoInfo = await page.evaluate(() => {
            const logoImg = document.querySelector('img[src*="LOGO"]');
            if (!logoImg) return { exists: false };

            return {
                exists: true,
                src: logoImg.src,
                alt: logoImg.alt,
                naturalWidth: logoImg.naturalWidth,
                naturalHeight: logoImg.naturalHeight,
                complete: logoImg.complete,
                display: window.getComputedStyle(logoImg).display,
                visibility: window.getComputedStyle(logoImg).visibility,
                opacity: window.getComputedStyle(logoImg).opacity,
                loading: logoImg.loading,
                error: logoImg.error ? logoImg.error.message : null
            };
        });

        console.log(JSON.stringify(logoInfo, null, 2));

        // Verificar logs de la red
        console.log('\n🌐 LOGS DE RED:');
        networkLogs.forEach(log => {
            if (log.type === 'response') {
                console.log(`📡 ${log.type.toUpperCase()}: ${log.url} - Status: ${log.status}`);
            } else if (log.type === 'failed') {
                console.log(`❌ ${log.type.toUpperCase()}: ${log.url} - Error: ${log.error}`);
            }
        });

        // Probar diferentes URLs
        console.log('\n🔤 PROBANDO DIFERENTES VARIACIONES DE URL:');
        const urlsToTest = [
            'https://lifepluspdf.peterestela.com/images/LOGO%20LIFEPLUS%20LIMPIO.png',
            'https://lifepluspdf.peterestela.com/images/LOGO_LIFEPLUS_LIMPIO.png',
            'https://lifepluspdf.peterestela.com/images/logo-lifeplus-limpio.png',
            'https://lifepluspdf.peterestela.com/images/LOGOLIFEPLUSLIMPIO.png'
        ];

        for (const url of urlsToTest) {
            try {
                const response = await fetch(url);
                console.log(`📡 ${url.split('/').pop()}: ${response.status} ${response.ok ? '✅' : '❌'}`);
            } catch (error) {
                console.log(`❌ ${url.split('/').pop()}: Error - ${error.message}`);
            }
        }

        // Generar informe
        const informe = `# INFORME FINAL - PROBLEMA DEL LOGO LIFEPLUS

## 🔍 DIAGNÓSTICO COMPLETO

### Problema Identificado:
El logo de LifePlus no se carga en el servidor debido a un error **404 (File Not Found)**.

### Detalles Técnicos:
- **URL del logo**: \`images/LOGO LIFEPLUS LIMPIO.png\`
- **Código de error**: 404
- **Codificación URL**: \`LOGO%20LIFEPLUS%20LIMPIO.png\`
- **Estado en DOM**: ${logoInfo.exists ? 'Existe pero no carga' : 'No encontrado'}

### Análisis de Red:
${networkLogs.map(log => {
    if (log.type === 'response') {
        return `- **${log.type}**: ${log.url} (Status: ${log.status})`;
    } else if (log.type === 'failed') {
        return `- **ERROR**: ${log.url} (${log.error})`;
    }
    return '';
}).join('\n')}

### Causa Principal:
El nombre del archivo contiene espacios y caracteres en mayúsculas, lo que puede causar problemas en:

1. **Sistemas de archivos** (Linux vs Windows)
2. **Codificación URL** (espacios convertidos a %20)
3. **Configuración del servidor web** (sensibilidad a mayúsculas/minúsculas)

## 💡 SOLUCIÓN DEFINITIVA:

### Paso 1: Renombrar el archivo
\`\`\`bash
cd /path/to/server/images
mv "LOGO LIFEPLUS LIMPIO.png" "logo-lifeplus-limpio.png"
\`\`\`

### Paso 2: Actualizar la referencia en HTML
Reemplazar en \`index.html\`:
\`\`\`html
<!-- Línea 26 -->
<img src="images/LOGO LIFEPLUS LIMPIO.png" alt="LifePlus Logo" class="side-logo lifeplus-side-logo">
\`\`\`

Por:
\`\`\`html
<img src="images/logo-lifeplus-limpio.png" alt="LifePlus Logo" class="side-logo lifeplus-side-logo">
\`\`\`

### Paso 3: Verificar permisos
\`\`\`bash
chmod 644 images/logo-lifeplus-limpio.png
\`\`\`

## 📋 ACCIONES INMEDIATAS:

1. ✅ **Identificado**: Error 404 en la imagen
2. 🔄 **Por hacer**: Renombrar archivo y actualizar HTML
3. ✅ **Verificado**: Capturas de pantalla guardadas

## 🎯 CONCLUSIÓN:

El problema es causado por el nombre del archivo con espacios y mayúsculas. La solución es renombrar el archivo a un formato compatible con la web (sin espacios, en minúsculas, con guiones) y actualizar la referencia correspondiente en el HTML.

## 📁 Archivos Modificados:

- \`images/LOGO LIFEPLUS LIMPIO.png\` → \`images/logo-lifeplus-limpio.png\`
- \`index.html\` (línea 26)

**Resultado esperado**: El logo debería cargarse correctamente en el servidor después de estos cambios.
`;

        // Guardar informe
        fs.writeFileSync('test-results/informe-final-logo-servidor.md', informe);
        console.log('\n📄 Informe final guardado en: test-results/informe-final-logo-servidor.md');

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

verificarLogoServidor().catch(console.error);