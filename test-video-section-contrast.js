const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

// Función para calcular contraste de color
function calculateContrast(rgb1, rgb2) {
    const [r1, g1, b1] = rgb1;
    const [r2, g2, b2] = rgb2;

    // Convertir a luminancia relativa
    const lum1 = getLuminance(r1, g1, b1);
    const lum2 = getLuminance(r2, g2, b2);

    // Calcular ratio de contraste
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

// Función para convertir hex a RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

// Función para extraer color de background
async function getBackgroundColor(element) {
    const style = await element.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        const bgColor = computedStyle.backgroundColor;

        // Si es transparente, buscar en elementos padres
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            let parent = el.parentElement;
            while (parent) {
                const parentStyle = window.getComputedStyle(parent);
                const parentBgColor = parentStyle.backgroundColor;
                if (parentBgColor !== 'rgba(0, 0, 0, 0)' && parentBgColor !== 'transparent') {
                    return {
                        backgroundColor: parentBgColor,
                        backgroundGradient: parentStyle.background
                    };
                }
                parent = parent.parentElement;
            }
            // Si no se encuentra, obtener el color del body
            const bodyStyle = window.getComputedStyle(document.body);
            return {
                backgroundColor: bodyStyle.backgroundColor,
                backgroundGradient: bodyStyle.background
            };
        }

        return {
            backgroundColor: bgColor,
            backgroundGradient: computedStyle.background
        };
    });

    return style;
}

async function analyzeVideoSection() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Configurar viewport para desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('🔍 Analizando módulo "Descubre LifePlus"...');

    try {
        // Navegar a la página
        await page.goto(`file://${path.join(__dirname, 'index.html')}`, {
            waitUntil: 'networkidle'
        });

        // Esperar a que cargue la sección de video
        await page.waitForSelector('.video-section', { timeout: 10000 });

        // Scroll a la sección de video
        await page.evaluate(() => {
            const videoSection = document.querySelector('.video-section');
            if (videoSection) {
                videoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        // Esperar un momento para que se estabilice
        await page.waitForTimeout(2000);

        // Capturar screenshot completo de la sección
        await page.screenshot({
            path: 'video-section-full.png',
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

        // Capturar screenshot específico del área de contenido
        await page.screenshot({
            path: 'video-content-area.png',
            fullPage: false,
            clip: await page.evaluate(() => {
                const content = document.querySelector('.video-content');
                const rect = content.getBoundingClientRect();
                return {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                };
            })
        });

        // Analizar los colores del texto y fondo
        const analysis = await page.evaluate(() => {
            const videoSection = document.querySelector('.video-section');
            const videoContent = document.querySelector('.video-content');
            const videoTitle = document.querySelector('.video-title');
            const videoDescription = document.querySelector('.video-description');
            const featureItems = document.querySelectorAll('.feature-item');

            // Obtener estilos computados
            const getStyle = (element) => {
                if (!element) return null;
                const style = window.getComputedStyle(element);
                return {
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    textShadow: style.textShadow,
                    opacity: style.opacity
                };
            };

            // Función para obtener el color de fondo efectivo
            const getEffectiveBackground = (element) => {
                if (!element) return null;

                let current = element;
                let bgColor = window.getComputedStyle(current).backgroundColor;

                // Si es transparente, buscar en padres
                while (current && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
                    current = current.parentElement;
                    if (current) {
                        bgColor = window.getComputedStyle(current).backgroundColor;
                    } else {
                        break;
                    }
                }

                // Si sigue siendo transparente, usar el body
                if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
                    bgColor = window.getComputedStyle(document.body).backgroundColor;
                }

                return bgColor;
            };

            return {
                section: getStyle(videoSection),
                content: getStyle(videoContent),
                title: getStyle(videoTitle),
                description: getStyle(videoDescription),
                features: Array.from(featureItems).map(getStyle),
                effectiveBackground: getEffectiveBackground(videoContent),
                sectionBackground: getEffectiveBackground(videoSection),
                bodyBackground: window.getComputedStyle(document.body).backgroundColor
            };
        });

        // Analizar contraste
        const contrastAnalysis = {};

        // Función para convertir RGB string a valores numéricos
        const parseRgb = (rgbString) => {
            const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                return [
                    parseInt(match[1]),
                    parseInt(match[2]),
                    parseInt(match[3])
                ];
            }
            return [255, 255, 255]; // Default a blanco
        };

        // Analizar contraste para cada elemento
        const elements = [
            { name: 'Título', element: analysis.title },
            { name: 'Descripción', element: analysis.description },
            { name: 'Features', element: analysis.features[0] }
        ];

        elements.forEach(({ name, element }) => {
            if (element) {
                const textColor = parseRgb(element.color);
                const bgColor = parseRgb(analysis.effectiveBackground);
                const contrast = calculateContrast(textColor, bgColor);

                contrastAnalysis[name] = {
                    textColor: element.color,
                    backgroundColor: analysis.effectiveBackground,
                    contrast: contrast,
                    fontSize: element.fontSize,
                    fontWeight: element.fontWeight,
                    textShadow: element.textShadow,
                    passesWCAG_AA: contrast >= 4.5,
                    passesWCAG_AAA: contrast >= 7,
                    recommendation: getRecommendation(contrast, name)
                };
            }
        });

        // Generar informe
        const report = {
            timestamp: new Date().toISOString(),
            analysis: analysis,
            contrastAnalysis: contrastAnalysis,
            summary: generateSummary(contrastAnalysis)
        };

        // Guardar informe
        fs.writeFileSync('video-section-analysis.json', JSON.stringify(report, null, 2));

        console.log('✅ Análisis completado');
        console.log('📊 Screenshots guardados:');
        console.log('   - video-section-full.png');
        console.log('   - video-content-area.png');
        console.log('📄 Análisis guardado en: video-section-analysis.json');

        // Mostrar resumen en consola
        console.log('\n📋 RESUMEN DE ANÁLISIS:');
        console.log('='.repeat(50));
        Object.entries(contrastAnalysis).forEach(([element, data]) => {
            console.log(`\n${element}:`);
            console.log(`  - Color de texto: ${data.textColor}`);
            console.log(`  - Color de fondo: ${data.backgroundColor}`);
            console.log(`  - Contraste: ${data.contrast}:1`);
            console.log(`  - WCAG AA: ${data.passesWCAG_AA ? '✅' : '❌'}`);
            console.log(`  - WCAG AAA: ${data.passesWCAG_AAA ? '✅' : '❌'}`);
            console.log(`  - Recomendación: ${data.recommendation}`);
        });

        return report;

    } catch (error) {
        console.error('❌ Error en el análisis:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function getRecommendation(contrast, elementName) {
    if (contrast >= 7) {
        return 'Excelente contraste, cumple con WCAG AAA';
    } else if (contrast >= 4.5) {
        return 'Buen contraste, cumple con WCAG AA';
    } else if (contrast >= 3) {
        return 'Contraste bajo, necesita mejoras para cumplir WCAG AA';
    } else {
        return 'Contraste muy pobre, requiere mejoras urgentes';
    }
}

function generateSummary(contrastAnalysis) {
    const issues = [];
    const recommendations = [];

    Object.entries(contrastAnalysis).forEach(([element, data]) => {
        if (!data.passesWCAG_AA) {
            issues.push(`${element} tiene un contraste de ${data.contrast}:1 (necesita 4.5:1 mínimo)`);
        }

        if (data.contrast < 7) {
            recommendations.push(`${element}: mejorar contraste para WCAG AAA`);
        }
    });

    return {
        issuesFound: issues.length > 0,
        issueCount: issues.length,
        issues: issues,
        recommendations: recommendations,
        overallAssessment: issues.length === 0 ?
            '✅ Todos los elementos cumplen con WCAG AA' :
            '❌ Hay problemas de contraste que necesitan ser solucionados'
    };
}

// Ejecutar análisis
if (require.main === module) {
    analyzeVideoSection().catch(console.error);
}

module.exports = { analyzeVideoSection, calculateContrast };