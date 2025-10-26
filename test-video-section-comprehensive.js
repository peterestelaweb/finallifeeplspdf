const { chromium, devices } = require('playwright');
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

async function testMultipleViewports() {
    const browser = await chromium.launch();
    const results = [];

    const viewports = [
        { name: 'Desktop', width: 1920, height: 1080, device: null },
        { name: 'Tablet', width: 768, height: 1024, device: null },
        { name: 'Mobile', width: 375, height: 812, device: devices['iPhone 12'] }
    ];

    try {
        for (const viewport of viewports) {
            console.log(`🔍 Analizando en ${viewport.name} (${viewport.width}x${viewport.height})...`);

            const page = await browser.newPage();

            if (viewport.device) {
                await page.emulateMedia(viewport.device);
            }

            await page.setViewportSize({ width: viewport.width, height: viewport.height });

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

            await page.waitForTimeout(1000);

            // Capturar screenshot
            await page.screenshot({
                path: `video-section-${viewport.name.toLowerCase()}.png`,
                fullPage: false,
                clip: await page.evaluate(() => {
                    const section = document.querySelector('.video-section');
                    const rect = section.getBoundingClientRect();
                    return {
                        x: Math.max(0, rect.left),
                        y: Math.max(0, rect.top),
                        width: Math.min(rect.width, viewport.width),
                        height: Math.min(rect.height, viewport.height)
                    };
                })
            });

            // Analizar contraste
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

            const titleContrast = calculateContrast(parseRgb(analysis.title.color), bgColor);
            const descContrast = calculateContrast(parseRgb(analysis.description.color), bgColor);
            const featuresContrast = analysis.features.length > 0 ?
                calculateContrast(parseRgb(analysis.features[0].color), bgColor) : 0;

            const result = {
                viewport: viewport.name,
                resolution: `${viewport.width}x${viewport.height}`,
                analysis: analysis,
                contrast: {
                    title: titleContrast,
                    description: descContrast,
                    features: featuresContrast
                },
                issues: []
            };

            // Identificar problemas
            if (titleContrast < 4.5) {
                result.issues.push(`Título: contraste ${titleContrast}:1 (mínimo 4.5:1)`);
            }
            if (descContrast < 4.5) {
                result.issues.push(`Descripción: contraste ${descContrast}:1 (mínimo 4.5:1)`);
            }
            if (featuresContrast < 4.5) {
                result.issues.push(`Features: contraste ${featuresContrast}:1 (mínimo 4.5:1)`);
            }

            results.push(result);

            await page.close();
        }

        // Guardar resultados
        fs.writeFileSync('video-section-multi-device.json', JSON.stringify(results, null, 2));

        // Mostrar resumen
        console.log('\n📋 ANÁLISIS MULTI-DISPOSITIVO:');
        console.log('='.repeat(60));

        results.forEach(result => {
            console.log(`\n📱 ${result.viewport} (${result.resolution}):`);
            console.log(`   - Título: ${result.contrast.title}:1 ${result.contrast.title >= 4.5 ? '✅' : '❌'}`);
            console.log(`   - Descripción: ${result.contrast.description}:1 ${result.contrast.description >= 4.5 ? '✅' : '❌'}`);
            console.log(`   - Features: ${result.contrast.features}:1 ${result.contrast.features >= 4.5 ? '✅' : '❌'}`);

            if (result.issues.length > 0) {
                console.log(`   ⚠️  Problemas: ${result.issues.join(', ')}`);
            } else {
                console.log(`   ✅ Sin problemas de contraste`);
            }
        });

        return results;

    } catch (error) {
        console.error('❌ Error en análisis multi-dispositivo:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Test de accesibilidad con diferentes condiciones
async function testAccessibilityConditions() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('\n🔍 Analizando condiciones de accesibilidad...');

    try {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(`file://${path.join(__dirname, 'index.html')}`, {
            waitUntil: 'networkidle'
        });

        await page.waitForSelector('.video-section', { timeout: 10000 });

        // Simular diferentes condiciones de visión
        const conditions = [
            { name: 'Normal', filter: 'none' },
            { name: 'Protanopia', filter: 'url(#protanopia)' },
            { name: 'Deuteranopia', filter: 'url(#deuteranopia)' },
            { name: 'Tritanopia', filter: 'url(#tritanopia)' }
        ];

        for (const condition of conditions) {
            await page.evaluate((filter) => {
                // Aplicar filtros de simulación de daltonismo
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.style.position = 'absolute';
                svg.style.width = '0';
                svg.style.height = '0';

                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

                // Filtros para diferentes tipos de daltonismo
                const filters = [
                    { id: 'protanopia', values: '0.567, 0.433, 0,     0, 0 0.558, 0.442, 0,     0, 0 0,     0.242, 0.758, 0, 0 0, 0, 0, 1, 0' },
                    { id: 'deuteranopia', values: '0.625, 0.375, 0,   0, 0 0.7,   0.3,   0,   0, 0 0,     0.3,   0.7,   0, 0 0, 0, 0, 1, 0' },
                    { id: 'tritanopia', values: '0.95, 0.05,  0,     0, 0 0,    0.433, 0.567, 0, 0 0,     0.475, 0.525, 0, 0 0, 0, 0, 1, 0' }
                ];

                filters.forEach(f => {
                    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                    filter.setAttribute('id', f.id);

                    const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
                    feColorMatrix.setAttribute('type', 'matrix');
                    feColorMatrix.setAttribute('values', f.values);

                    filter.appendChild(feColorMatrix);
                    defs.appendChild(filter);
                });

                svg.appendChild(defs);
                document.body.appendChild(svg);

                // Aplicar filtro a la sección de video
                const videoSection = document.querySelector('.video-section');
                if (videoSection) {
                    videoSection.style.filter = filter;
                }
            }, condition.filter);

            await page.waitForTimeout(500);

            // Capturar screenshot
            await page.screenshot({
                path: `video-section-${condition.name.toLowerCase()}.png`,
                fullPage: false,
                clip: await page.evaluate(() => {
                    const section = document.querySelector('.video-section');
                    const rect = section.getBoundingClientRect();
                    return {
                        x: Math.max(0, rect.left),
                        y: Math.max(0, rect.top),
                        width: rect.width,
                        height: rect.height
                    };
                })
            });

            // Quitar filtro para la siguiente iteración
            if (condition.filter !== 'none') {
                await page.evaluate(() => {
                    const videoSection = document.querySelector('.video-section');
                    if (videoSection) {
                        videoSection.style.filter = 'none';
                    }
                });
            }
        }

        console.log('✅ Análisis de accesibilidad completado');
        console.log('📊 Screenshots guardados:');
        conditions.forEach(c => {
            console.log(`   - video-section-${c.name.toLowerCase()}.png`);
        });

    } catch (error) {
        console.error('❌ Error en análisis de accesibilidad:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Función principal
async function comprehensiveAnalysis() {
    console.log('🚀 Iniciando análisis integral del módulo "Descubre LifePlus"...');

    try {
        // Ejecutar todos los tests
        await testMultipleViewports();
        await testAccessibilityConditions();

        console.log('\n✅ Análisis integral completado');
        console.log('\n📁 Archivos generados:');
        console.log('   - video-section-desktop.png');
        console.log('   - video-section-tablet.png');
        console.log('   - video-section-mobile.png');
        console.log('   - video-section-normal.png');
        console.log('   - video-section-protanopia.png');
        console.log('   - video-section-deuteranopia.png');
        console.log('   - video-section-tritanopia.png');
        console.log('   - video-section-multi-device.json');

    } catch (error) {
        console.error('❌ Error en análisis integral:', error);
        throw error;
    }
}

// Ejecutar si es el módulo principal
if (require.main === module) {
    comprehensiveAnalysis().catch(console.error);
}

module.exports = { comprehensiveAnalysis, testMultipleViewports, testAccessibilityConditions };