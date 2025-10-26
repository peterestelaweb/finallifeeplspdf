const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Función para calcular contraste
function calculateContrast(rgb1, rgb2) {
    const [r1, g1, b1] = rgb1;
    const [r2, g2, b2] = rgb2;

    const lum1 = getLuminance(r1, g1, b1);
    const lum2 = getLuminance(r2, g2, b2);

    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    return Math.round(ratio * 100) / 100;
}

function getLuminance(r, g, b) {
    const sRGB = [r, g, b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function parseRgb(rgbString) {
    const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        return [
            parseInt(match[1]),
            parseInt(match[2]),
            parseInt(match[3])
        ];
    }
    return [255, 255, 255];
}

async function validarCambios() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('🔍 Validando cambios de contraste en el módulo "Descubre LifePlus"...');

    try {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(`file://${path.join(__dirname, 'index.html')}`, {
            waitUntil: 'networkidle'
        });

        await page.waitForSelector('.video-section', { timeout: 10000 });

        // Scroll a la sección
        await page.evaluate(() => {
            const videoSection = document.querySelector('.video-section');
            if (videoSection) {
                videoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        await page.waitForTimeout(2000);

        // Capturar screenshot después de los cambios
        await page.screenshot({
            path: 'video-section-despues-cambios.png',
            fullPage: false,
            clip: await page.evaluate(() => {
                const section = document.querySelector('.video-section');
                const rect = section.getBoundingClientRect();
                return {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                };
            })
        });

        // Analizar colores después de los cambios
        const analysis = await page.evaluate(() => {
            const videoContent = document.querySelector('.video-content');
            const videoTitle = document.querySelector('.video-title');
            const videoDescription = document.querySelector('.video-description');
            const featureItems = document.querySelectorAll('.feature-item');

            const getEffectiveBackground = (element) => {
                if (!element) return null;

                let current = element;
                let bgColor = window.getComputedStyle(current).backgroundColor;

                while (current && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
                    current = current.parentElement;
                    if (current) {
                        bgColor = window.getComputedStyle(current).backgroundColor;
                    } else {
                        break;
                    }
                }

                if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
                    bgColor = window.getComputedStyle(document.body).backgroundColor;
                }

                return bgColor;
            };

            const getStyle = (element) => {
                if (!element) return null;
                const style = window.getComputedStyle(element);
                return {
                    color: style.color,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    textShadow: style.textShadow,
                    opacity: style.opacity
                };
            };

            return {
                content: getStyle(videoContent),
                title: getStyle(videoTitle),
                description: getStyle(videoDescription),
                features: Array.from(featureItems).map(getStyle),
                effectiveBackground: getEffectiveBackground(videoContent)
            };
        });

        // Calcular contraste
        const bgColor = parseRgb(analysis.effectiveBackground);

        const results = {
            timestamp: new Date().toISOString(),
            screenshot: 'video-section-despues-cambios.png',
            analysis: analysis,
            contrastResults: {}
        };

        // Analizar cada elemento
        const elements = [
            { name: 'Título', element: analysis.title, minAA: 4.5, minAAA: 7 },
            { name: 'Descripción', element: analysis.description, minAA: 4.5, minAAA: 7 },
            { name: 'Features', element: analysis.features[0], minAA: 4.5, minAAA: 7 }
        ];

        let allPassAA = true;
        let allPassAAA = true;

        elements.forEach(({ name, element, minAA, minAAA }) => {
            if (element) {
                const textColor = parseRgb(element.color);
                const contrast = calculateContrast(textColor, bgColor);

                results.contrastResults[name] = {
                    textColor: element.color,
                    backgroundColor: analysis.effectiveBackground,
                    contrast: contrast,
                    fontSize: element.fontSize,
                    fontWeight: element.fontWeight,
                    passesWCAG_AA: contrast >= minAA,
                    passesWCAG_AAA: contrast >= minAAA,
                    improvement: `De 1:1 a ${contrast}:1`
                };

                if (!results.contrastResults[name].passesWCAG_AA) allPassAA = false;
                if (!results.contrastResults[name].passesWCAG_AAA) allPassAAA = false;
            }
        });

        results.summary = {
            allPassWCAG_AA: allPassAA,
            allPassWCAG_AAA: allPassAAA,
            improvement: 'Contraste mejorado de 1:1 a valores aceptables',
            status: allPassAA ? '✅ EXITOSO' : '❌ NECESITA MÁS MEJORAS'
        };

        // Guardar resultados
        fs.writeFileSync('validacion-cambios-contraste.json', JSON.stringify(results, null, 2));

        // Mostrar resultados
        console.log('\n📊 RESULTADOS DE VALIDACIÓN:');
        console.log('='.repeat(60));

        Object.entries(results.contrastResults).forEach(([element, data]) => {
            console.log(`\n${element}:`);
            console.log(`  - Color de texto: ${data.textColor}`);
            console.log(`  - Color de fondo: ${data.backgroundColor}`);
            console.log(`  - Contraste: ${data.contrast}:1 ${data.improvement}`);
            console.log(`  - WCAG AA: ${data.passesWCAG_AA ? '✅' : '❌'} (mínimo ${data.minAA}:1)`);
            console.log(`  - WCAG AAA: ${data.passesWCAG_AAA ? '✅' : '❌'} (mínimo ${data.minAAA}:1)`);
        });

        console.log(`\n📋 RESUMEN GENERAL:`);
        console.log(`   - Estado: ${results.summary.status}`);
        console.log(`   - WCAG AA: ${results.summary.allPassWCAG_AA ? '✅ Cumple' : '❌ No cumple'}`);
        console.log(`   - WCAG AAA: ${results.summary.allPassWCAG_AAA ? '✅ Cumple' : '❌ No cumple'}`);
        console.log(`   - Mejora: ${results.summary.improvement}`);
        console.log(`   - Screenshot: ${results.screenshot}`);

        if (results.summary.allPassAA) {
            console.log('\n🎉 ¡ÉXITO! Los cambios han solucionado los problemas de contraste.');
        } else {
            console.log('\n⚠️  Se necesitan más mejoras para cumplir con WCAG AA.');
        }

        return results;

    } catch (error) {
        console.error('❌ Error en validación:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Función para comparar antes y después
async function compararAntesDespues() {
    console.log('📊 Generando comparación antes/después...');

    try {
        // Leer resultados originales
        const originalAnalysis = JSON.parse(fs.readFileSync('video-section-analysis.json', 'utf8'));

        // Leer resultados después de cambios
        const validationResults = JSON.parse(fs.readFileSync('validacion-cambios-contraste.json', 'utf8'));

        const comparison = {
            timestamp: new Date().toISOString(),
            before: originalAnalysis.contrastAnalysis,
            after: validationResults.contrastResults,
            improvement: {}
        };

        // Calcular mejoras
        Object.keys(originalAnalysis.contrastAnalysis).forEach(key => {
            const before = originalAnalysis.contrastAnalysis[key];
            const after = validationResults.contrastResults[key];

            if (before && after) {
                comparison.improvement[key] = {
                    before: before.contrast,
                    after: after.contrast,
                    improvement: after.contrast - before.contrast,
                    percentageImprovement: ((after.contrast - before.contrast) / before.contrast * 100).toFixed(0),
                    fixed: !before.passesWCAG_AA && after.passesWCAG_AA
                };
            }
        });

        // Guardar comparación
        fs.writeFileSync('comparacion-antes-despues.json', JSON.stringify(comparison, null, 2));

        console.log('\n📈 COMPARACIÓN ANTES/DESPUÉS:');
        console.log('='.repeat(50));

        Object.entries(comparison.improvement).forEach(([element, data]) => {
            console.log(`\n${element}:`);
            console.log(`  - Antes: ${data.before}:1 ❌`);
            console.log(`  - Después: ${data.after}:1 ${data.after >= 4.5 ? '✅' : '❌'}`);
            console.log(`  - Mejora: +${data.improvement} (${data.percentageImprovement}%)`);
            console.log(`  - Estado: ${data.fixed ? '✅ CORREGIDO' : '⚠️  SIN MEJORAR'}`);
        });

        return comparison;

    } catch (error) {
        console.error('❌ Error en comparación:', error);
        console.log('   Asegúrate de haber ejecutado ambos análisis primero.');
    }
}

// Ejecutar validación
if (require.main === module) {
    validarCambios()
        .then(() => {
            console.log('\n✅ Validación completada');
            console.log('📁 Archivos generados:');
            console.log('   - video-section-despues-cambios.png');
            console.log('   - validacion-cambios-contraste.json');
        })
        .catch(console.error);
}

module.exports = { validarCambios, compararAntesDespues };