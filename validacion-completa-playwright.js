const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

async function validarMejorasImplementadas() {
    console.log('🚀 Iniciando validación completa de mejoras implementadas...');

    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
            dir: './test-results/'
        }
    });

    const page = await context.newPage();

    // Directorio para resultados
    const resultsDir = './resultados-validacion';
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }

    const report = {
        timestamp: new Date().toISOString(),
        pruebas: {},
        screenshots: [],
        mediciones: [],
        conclusiones: []
    };

    try {
        // 1. Abrir página principal
        console.log('📱 Abriendo página principal...');
        await page.goto('file://' + path.join(process.cwd(), 'index.html'));
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // 2. Captura de pantalla general
        console.log('📸 Capturando pantalla general...');
        await page.screenshot({
            path: `${resultsDir}/pantalla-completa-mejorada.png`,
            fullPage: true,
            animations: 'disabled'
        });
        report.screenshots.push('pantalla-completa-mejorada.png');

        // 3. Verificar módulo Descubre LifePlus
        console.log('🔍 Verificando módulo Descubre LifePlus...');
        const lifePlusModule = await page.locator('.video-content').first();
        await lifePlusModule.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        // Captura específica del módulo
        await page.screenshot({
            path: `${resultsDir}/modulo-lifeplus-antes.png`,
            clip: await lifePlusModule.boundingBox()
        });

        // 4. Análisis de contraste del módulo
        console.log('🎨 Analizando contraste de colores...');
        const contrastAnalysis = await page.evaluate(() => {
            const getContrastRatio = (rgb1, rgb2) => {
                const getLuminance = (r, g, b) => {
                    const [rs, gs, bs] = [r, g, b].map(c => {
                        c = c / 255;
                        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                    });
                    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
                };

                const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
                const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
                const brightest = Math.max(lum1, lum2);
                const darkest = Math.min(lum1, lum2);
                return (brightest + 0.05) / (darkest + 0.05);
            };

            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };

            const getElementStyle = (element, property) => {
                const computed = window.getComputedStyle(element);
                return computed[property];
            };

            const videoSection = document.querySelector('.video-content');
            if (!videoSection) return { error: 'No se encontró el módulo video-content' };

            const title = videoSection.querySelector('h2');
            const description = videoSection.querySelector('p');

            const bgColor = getElementStyle(videoSection, 'background-color');
            const titleColor = title ? getElementStyle(title, 'color') : '#ffffff';
            const textColor = description ? getElementStyle(description, 'color') : '#ffffff';

            // Convertir a RGB
            const bgRgb = hexToRgb(bgColor) || { r: 245, g: 245, b: 245 };
            const titleRgb = hexToRgb(titleColor) || { r: 255, g: 255, b: 255 };
            const textRgb = hexToRgb(textColor) || { r: 255, g: 255, b: 255 };

            const titleContrast = getContrastRatio(titleRgb, bgRgb);
            const textContrast = getContrastRatio(textRgb, bgRgb);

            return {
                backgroundColor: bgColor,
                titleColor: titleColor,
                textColor: textColor,
                titleContrast: titleContrast,
                textContrast: textContrast,
                titleWCAG: titleContrast >= 4.5 ? 'AA' : titleContrast >= 3 ? 'AA Large' : 'Fail',
                textWCAG: textContrast >= 4.5 ? 'AA' : textContrast >= 3 ? 'AA Large' : 'Fail',
                isVisible: titleContrast > 2 && textContrast > 2
            };
        });

        report.pruebas.contrasteLifePlus = contrastAnalysis;
        report.mediciones.push({
            tipo: 'Contraste',
            modulo: 'Descubre LifePlus',
            datos: contrastAnalysis
        });

        // 5. Verificar animación 3D del fondo
        console.log('🎬 Verificando animación 3D del fondo...');
        await page.evaluate(() => {
            // Detectar elementos de animación 3D
            const animatedElements = document.querySelectorAll('[class*="3d"], [class*="animation"], [class*="particle"], [class*="background"]');
            return Array.from(animatedElements).map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                styles: window.getComputedStyle(el)
            }));
        });

        // Captura de pantalla para ver animación
        await page.waitForTimeout(3000);
        await page.screenshot({
            path: `${resultsDir}/animacion-3d-fondo.png`,
            fullPage: false
        });
        report.screenshots.push('animacion-3d-fondo.png');

        // 6. Análisis de visibilidad del fondo
        console.log('👁️ Analizando visibilidad general del fondo...');
        const backgroundAnalysis = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;

            const bodyStyle = window.getComputedStyle(body);
            const htmlStyle = window.getComputedStyle(html);

            const backgroundImage = bodyStyle.backgroundImage || htmlStyle.backgroundImage;
            const backgroundColor = bodyStyle.backgroundColor || htmlStyle.backgroundColor;

            // Verificar si el fondo es demasiado blanco
            const isTooWhite = backgroundColor.toLowerCase().includes('rgb(255, 255, 255)') ||
                               backgroundColor.toLowerCase().includes('#ffffff');

            return {
                backgroundImage: backgroundImage,
                backgroundColor: backgroundColor,
                isTooWhite: isTooWhite,
                hasBackgroundImage: backgroundImage && backgroundImage !== 'none',
                opacity: bodyStyle.opacity || '1'
            };
        });

        report.pruebas.visibilidadFondo = backgroundAnalysis;
        report.mediciones.push({
            tipo: 'Visibilidad Fondo',
            datos: backgroundAnalysis
        });

        // 7. Pruebas de rendimiento
        console.log('⚡ Realizando pruebas de rendimiento...');
        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paints = performance.getEntriesByType('paint');

            return {
                loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
                domComplete: navigation ? navigation.domComplete - navigation.fetchStart : 0,
                firstPaint: paints.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paints.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                memoryUsage: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                } : null
            };
        });

        report.pruebas.rendimiento = performanceMetrics;
        report.mediciones.push({
            tipo: 'Rendimiento',
            datos: performanceMetrics
        });

        // 8. Pruebas en diferentes tamaños de pantalla
        console.log('📱 Probando en diferentes tamaños de pantalla...');
        const viewports = [
            { name: 'Desktop', width: 1920, height: 1080 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile', width: 375, height: 667 }
        ];

        for (const viewport of viewports) {
            console.log(`🔍 Probando en ${viewport.name} (${viewport.width}x${viewport.height})...`);
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(1000);

            await page.screenshot({
                path: `${resultsDir}/pantalla-${viewport.name.toLowerCase()}.png`,
                fullPage: true
            });
            report.screenshots.push(`pantalla-${viewport.name.toLowerCase()}.png`);

            // Verificar legibilidad en este viewport
            const legibilidad = await page.evaluate(() => {
                const videoSection = document.querySelector('.video-content');
                if (!videoSection) return { visible: false, readable: false };

                const rect = videoSection.getBoundingClientRect();
                const isVisible = rect.width > 0 && rect.height > 0 &&
                                rect.top < window.innerHeight && rect.bottom > 0;

                return {
                    visible: isVisible,
                    position: rect,
                    inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight
                };
            });

            report.mediciones.push({
                tipo: 'Responsivo',
                viewport: viewport.name,
                datos: legibilidad
            });
        }

        // 9. Captura final después de mejoras
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.screenshot({
            path: `${resultsDir}/captura-final-mejoras.png`,
            fullPage: true
        });
        report.screenshots.push('captura-final-mejoras.png');

        // 10. Generar conclusiones
        console.log('📊 Generando conclusiones...');

        // Verificar contraste
        const contrastOk = contrastAnalysis.titleContrast >= 4.5 && contrastAnalysis.textContrast >= 4.5;
        report.conclusiones.push({
            tipo: 'Contraste',
            resultado: contrastOk ? '✅ PASSED' : '❌ FAILED',
            descripcion: contrastOk ?
                `El contraste cumple con WCAG AA (Título: ${contrastAnalysis.titleContrast.toFixed(2)}:1, Texto: ${contrastAnalysis.textContrast.toFixed(2)}:1)` :
                `El contraste no cumple con WCAG AA (Título: ${contrastAnalysis.titleContrast.toFixed(2)}:1, Texto: ${contrastAnalysis.textContrast.toFixed(2)}:1)`
        });

        // Verificar fondo
        const fondoOk = !backgroundAnalysis.isTooWhite || backgroundAnalysis.hasBackgroundImage;
        report.conclusiones.push({
            tipo: 'Fondo',
            resultado: fondoOk ? '✅ PASSED' : '❌ FAILED',
            descripcion: fondoOk ?
                'El fondo no es demasiado blanco y tiene buena visibilidad' :
                'El fondo es demasiado blanco y necesita mejoras'
        });

        // Verificar rendimiento
        const rendimientoOk = performanceMetrics.loadTime < 3000;
        report.conclusiones.push({
            tipo: 'Rendimiento',
            resultado: rendimientoOk ? '✅ PASSED' : '❌ FAILED',
            descripcion: rendimientoOk ?
                `El tiempo de carga es óptimo (${performanceMetrics.loadTime}ms)` :
                `El tiempo de carga es lento (${performanceMetrics.loadTime}ms)`
        });

        console.log('✅ Pruebas completadas con éxito!');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
        report.error = error.message;
    } finally {
        await browser.close();
    }

    // Guardar reporte
    const reportPath = `${resultsDir}/reporte-validacion.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generar reporte en markdown
    const markdownReport = generarReporteMarkdown(report, resultsDir);
    fs.writeFileSync(`${resultsDir}/reporte-validacion.md`, markdownReport);

    console.log(`📄 Reporte guardado en: ${reportPath}`);
    console.log(`📊 Reporte Markdown guardado en: ${resultsDir}/reporte-validacion.md`);

    return report;
}

function generarReporteMarkdown(report, resultsDir) {
    let md = `# Informe de Validación - Mejoras Implementadas\n\n`;
    md += `**Fecha:** ${new Date(report.timestamp).toLocaleString('es-ES')}\n\n`;

    md += `## 📸 Capturas de Pantalla\n\n`;
    report.screenshots.forEach(screenshot => {
        md += `- [${screenshot}](./${screenshot})\n`;
    });
    md += `\n`;

    md += `## 🎯 Resultados de Pruebas\n\n`;

    if (report.pruebas.contrasteLifePlus) {
        const c = report.pruebas.contrasteLifePlus;
        md += `### 🔍 Análisis de Contraste - Módulo Descubre LifePlus\n\n`;
        md += `- **Color de fondo:** ${c.backgroundColor}\n`;
        md += `- **Color del título:** ${c.titleColor}\n`;
        md += `- **Color del texto:** ${c.textColor}\n`;
        md += `- **Contraste del título:** ${c.titleContrast.toFixed(2)}:1 (${c.titleWCAG})\n`;
        md += `- **Contraste del texto:** ${c.textContrast.toFixed(2)}:1 (${c.textWCAG})\n`;
        md += `- **Texto legible:** ${c.isVisible ? '✅ Sí' : '❌ No'}\n\n`;
    }

    if (report.pruebas.visibilidadFondo) {
        const f = report.pruebas.visibilidadFondo;
        md += `### 👁️ Análisis de Visibilidad del Fondo\n\n`;
        md += `- **Color de fondo:** ${f.backgroundColor}\n`;
        md += `- **Imagen de fondo:** ${f.hasBackgroundImage ? '✅ Sí' : '❌ No'}\n`;
        md += `- **Fondo demasiado blanco:** ${f.isTooWhite ? '❌ Sí' : '✅ No'}\n`;
        md += `- **Opacidad:** ${f.opacity}\n\n`;
    }

    if (report.pruebas.rendimiento) {
        const r = report.pruebas.rendimiento;
        md += `### ⚡ Métricas de Rendimiento\n\n`;
        md += `- **Tiempo de carga:** ${r.loadTime}ms\n`;
        md += `- **DOM completo:** ${r.domComplete}ms\n`;
        md += `- **First Paint:** ${r.firstPaint}ms\n`;
        md += `- **First Contentful Paint:** ${r.firstContentfulPaint}ms\n\n`;

        if (r.memoryUsage) {
            md += `### 🧠 Uso de Memoria\n\n`;
            md += `- **Heap usado:** ${(r.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
            md += `- **Heap total:** ${(r.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
            md += `- **Límite del heap:** ${(r.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB\n\n`;
        }
    }

    md += `## 📊 Conclusiones\n\n`;
    report.conclusiones.forEach(conclusion => {
        md += `### ${conclusion.tipo}\n`;
        md += `- **Resultado:** ${conclusion.resultado}\n`;
        md += `- **Descripción:** ${conclusion.descripcion}\n\n`;
    });

    md += `## 📱 Pruebas Responsivas\n\n`;
    const responsiveTests = report.mediciones.filter(m => m.tipo === 'Responsivo');
    responsiveTests.forEach(test => {
        md += `### ${test.viewport}\n`;
        md += `- **Visible:** ${test.datos.visible ? '✅ Sí' : '❌ No'}\n`;
        if (test.datos.position) {
            md += `- **Posición:** ${JSON.stringify(test.datos.position)}\n`;
        }
        md += `- **En viewport:** ${test.datos.inViewport ? '✅ Sí' : '❌ No'}\n\n`;
    });

    return md;
}

// Ejecutar la validación
if (require.main === module) {
    validarMejorasImplementadas()
        .then(() => {
            console.log('✅ Validación completada exitosamente');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error en la validación:', error);
            process.exit(1);
        });
}

module.exports = validarMejorasImplementadas;