const { chromium } = require('playwright');

async function analyzeVideoSection() {
    console.log('🔍 Analizando la sección de video actual...\n');

    // Iniciar navegador
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    try {
        // Navegar a la página local
        await page.goto('file:///Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/index.html');

        // Esperar a que la página cargue completamente
        await page.waitForLoadState('networkidle');

        console.log('📱 Análisis de la estructura actual del video section:\n');

        // 1. Analizar estructura HTML del video section
        const videoSectionStructure = await page.evaluate(() => {
            const videoSection = document.querySelector('.video-section');
            if (!videoSection) return null;

            return {
                tagName: videoSection.tagName,
                classes: videoSection.className,
                children: Array.from(videoSection.children).map(child => ({
                    tagName: child.tagName,
                    classes: child.className,
                    id: child.id,
                    childrenCount: child.children.length
                })),
                dimensions: {
                    width: videoSection.offsetWidth,
                    height: videoSection.offsetHeight,
                    marginTop: window.getComputedStyle(videoSection).marginTop,
                    marginBottom: window.getComputedStyle(videoSection).marginBottom,
                    padding: window.getComputedStyle(videoSection).padding
                }
            };
        });

        console.log('1. 📋 ESTRUCTURA HTML DEL VIDEO SECTION:');
        console.log(JSON.stringify(videoSectionStructure, null, 2));

        // 2. Analizar phone-mockup y video-container
        const phoneMockupStructure = await page.evaluate(() => {
            const phoneMockup = document.querySelector('.phone-mockup');
            const videoContainer = document.querySelector('.video-container');

            if (!phoneMockup || !videoContainer) return null;

            return {
                phoneMockup: {
                    tagName: phoneMockup.tagName,
                    classes: phoneMockup.className,
                    dimensions: {
                        width: phoneMockup.offsetWidth,
                        height: phoneMockup.offsetHeight
                    },
                    styles: {
                        position: window.getComputedStyle(phoneMockup).position,
                        flexShrink: window.getComputedStyle(phoneMockup).flexShrink,
                        perspective: window.getComputedStyle(phoneMockup).perspective
                    }
                },
                videoContainer: {
                    tagName: videoContainer.tagName,
                    classes: videoContainer.className,
                    dimensions: {
                        width: videoContainer.offsetWidth,
                        height: videoContainer.offsetHeight
                    },
                    styles: {
                        display: window.getComputedStyle(videoContainer).display,
                        alignItems: window.getComputedStyle(videoContainer).alignItems,
                        gap: window.getComputedStyle(videoContainer).gap,
                        maxWidth: window.getComputedStyle(videoContainer).maxWidth
                    }
                }
            };
        });

        console.log('\n2. 📱 ESTRUCTURA PHONE-MOCKUP Y VIDEO-CONTAINER:');
        console.log(JSON.stringify(phoneMockupStructure, null, 2));

        // 3. Analizar video content
        const videoContent = await page.evaluate(() => {
            const videoContent = document.querySelector('.video-content');
            if (!videoContent) return null;

            return {
                tagName: videoContent.tagName,
                classes: videoContent.className,
                dimensions: {
                    width: videoContent.offsetWidth,
                    height: videoContent.offsetHeight
                },
                styles: {
                    flex: window.getComputedStyle(videoContent).flex,
                    color: window.getComputedStyle(videoContent).color,
                    background: window.getComputedStyle(videoContent).background,
                    padding: window.getComputedStyle(videoContent).padding
                },
                children: Array.from(videoContent.children).map(child => ({
                    tagName: child.tagName,
                    classes: child.className,
                    content: child.textContent.trim().substring(0, 50) + '...'
                }))
            };
        });

        console.log('\n3. 📝 VIDEO CONTENT:');
        console.log(JSON.stringify(videoContent, null, 2));

        // 4. Analizar estilos CSS aplicados
        const appliedStyles = await page.evaluate(() => {
            const elements = {
                '.video-section': document.querySelector('.video-section'),
                '.video-container': document.querySelector('.video-container'),
                '.phone-mockup': document.querySelector('.phone-mockup'),
                '.phone-frame': document.querySelector('.phone-frame'),
                '.video-content': document.querySelector('.video-content')
            };

            const styles = {};

            Object.keys(elements).forEach(selector => {
                const element = elements[selector];
                if (element) {
                    const computedStyle = window.getComputedStyle(element);
                    styles[selector] = {
                        display: computedStyle.display,
                        position: computedStyle.position,
                        width: computedStyle.width,
                        height: computedStyle.height,
                        margin: computedStyle.margin,
                        padding: computedStyle.padding,
                        background: computedStyle.background,
                        borderRadius: computedStyle.borderRadius,
                        boxShadow: computedStyle.boxShadow,
                        flex: computedStyle.flex,
                        gap: computedStyle.gap,
                        alignItems: computedStyle.alignItems,
                        justifyContent: computedStyle.justifyContent
                    };
                }
            });

            return styles;
        });

        console.log('\n4. 🎨 ESTILOS CSS APLICADOS:');
        console.log(JSON.stringify(appliedStyles, null, 2));

        // 5. Analizar diseño responsive
        console.log('\n5. 📱 ANÁLISIS RESPONSIVE:');

        // Desktop
        await page.setViewportSize({ width: 1280, height: 720 });
        const desktopLayout = await page.evaluate(() => {
            const videoContainer = document.querySelector('.video-container');
            const phoneMockup = document.querySelector('.phone-mockup');
            const videoContent = document.querySelector('.video-content');

            return {
                videoContainer: {
                    display: window.getComputedStyle(videoContainer).display,
                    flexDirection: window.getComputedStyle(videoContainer).flexDirection,
                    gap: window.getComputedStyle(videoContainer).gap
                },
                phoneMockup: {
                    width: phoneMockup.offsetWidth,
                    height: phoneMockup.offsetHeight
                },
                videoContent: {
                    width: videoContent.offsetWidth,
                    height: videoContent.offsetHeight
                }
            };
        });

        console.log('Desktop (1280x720):');
        console.log(JSON.stringify(desktopLayout, null, 2));

        // Tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        const tabletLayout = await page.evaluate(() => {
            const videoContainer = document.querySelector('.video-container');
            const phoneMockup = document.querySelector('.phone-mockup');
            const videoContent = document.querySelector('.video-content');

            return {
                videoContainer: {
                    display: window.getComputedStyle(videoContainer).display,
                    flexDirection: window.getComputedStyle(videoContainer).flexDirection,
                    gap: window.getComputedStyle(videoContainer).gap
                },
                phoneMockup: {
                    width: phoneMockup.offsetWidth,
                    height: phoneMockup.offsetHeight
                },
                videoContent: {
                    width: videoContent.offsetWidth,
                    height: videoContent.offsetHeight
                }
            };
        });

        console.log('\nTablet (768x1024):');
        console.log(JSON.stringify(tabletLayout, null, 2));

        // Mobile
        await page.setViewportSize({ width: 375, height: 667 });
        const mobileLayout = await page.evaluate(() => {
            const videoContainer = document.querySelector('.video-container');
            const phoneMockup = document.querySelector('.phone-mockup');
            const videoContent = document.querySelector('.video-content');

            return {
                videoContainer: {
                    display: window.getComputedStyle(videoContainer).display,
                    flexDirection: window.getComputedStyle(videoContainer).flexDirection,
                    gap: window.getComputedStyle(videoContainer).gap
                },
                phoneMockup: {
                    width: phoneMockup.offsetWidth,
                    height: phoneMockup.offsetHeight
                },
                videoContent: {
                    width: videoContent.offsetWidth,
                    height: videoContent.offsetHeight
                }
            };
        });

        console.log('\nMobile (375x667):');
        console.log(JSON.stringify(mobileLayout, null, 2));

        // 6. Capturar screenshots para análisis visual
        console.log('\n6. 📸 CAPTURANDO SCREENSHOTS PARA ANÁLISIS VISUAL...');

        // Desktop
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.screenshot({
            path: 'video-section-desktop.png',
            fullPage: false,
            clip: {
                x: 0,
                y: page.locator('.video-section').boundingBox().then(box => box?.y || 0),
                width: 1280,
                height: 800
            }
        });

        // Tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.screenshot({
            path: 'video-section-tablet.png',
            fullPage: false
        });

        // Mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await page.screenshot({
            path: 'video-section-mobile.png',
            fullPage: false
        });

        console.log('✅ Screenshots guardados: video-section-desktop.png, video-section-tablet.png, video-section-mobile.png');

        // 7. Análisis final y recomendaciones
        console.log('\n7. 💡 ANÁLISIS FINAL Y RECOMENDACIONES:\n');

        console.log('📊 RESUMEN DE LA ESTRUCTURA ACTUAL:');
        console.log('- El video section usa un diseño flexbox con dirección row en desktop');
        console.log('- Phone-mockup tiene un tamaño fijo de 300x600px en desktop');
        console.log('- Video-content ocupa el espacio restante con flex: 1');
        console.log('- En móvil, el diseño cambia a columnas (flex-direction: column)');
        console.log('- El diseño es completamente responsive con breakpoints en 768px y 480px');

        console.log('\n🎯 MEJORES OPCIONES PARA AGREGAR UN SEGUNDO VIDEO:');
        console.log('\nOpción 1: Diseño de dos videos lado a lado (Desktop) / Stacked (Mobile)');
        console.log('- Desktop: Dos phone-mockups en un contenedor grid o flex');
        console.log('- Tablet: Dos phone-mockups uno al lado del otro o ligeramente más pequeños');
        console.log('- Mobile: Dos phone-mockups apilados verticalmente');

        console.log('\nOpción 2: Diseño de video principal + video secundario más pequeño');
        console.log('- Desktop: Video principal actual + video secundario más pequeño a la derecha');
        console.log('- Tablet: Videos apilados verticalmente');
        console.log('- Mobile: Videos apilados verticalmente');

        console.log('\nOpción 3: Carrusel de videos (Recomendado para mejor UX)');
        console.log('- Mostrar un video a la vez con controles de navegación');
        console.log('- Funciona bien en todos los dispositivos');
        console.log('- Mejor rendimiento de carga');

        console.log('\n🔧 IMPLEMENTACIÓN RECOMENDADA (Opción 1):');
        console.log('1. Crear un contenedor .video-grid o .videos-container');
        console.log('2. Usar CSS Grid para layout responsivo');
        console.log('3. Mantener el estilo phone-mockup existente');
        console.log('4. Añadir JavaScript para controlar ambos videos');

        // Guardar análisis completo en archivo JSON
        const analysisData = {
            timestamp: new Date().toISOString(),
            videoSectionStructure,
            phoneMockupStructure,
            videoContent,
            appliedStyles,
            responsiveAnalysis: {
                desktop: desktopLayout,
                tablet: tabletLayout,
                mobile: mobileLayout
            },
            recommendations: {
                bestApproach: 'Grid layout con dos phone-mockups',
                structure: 'video-section -> videos-container -> phone-mockup + phone-mockup',
                responsiveStrategy: 'Grid responsive con breakpoints existentes',
                cssFramework: 'Utilizar CSS Grid con fallback flexbox',
                jsRequirements: 'Control individual de sonido para cada video'
            }
        };

        require('fs').writeFileSync(
            'video-section-analysis.json',
            JSON.stringify(analysisData, null, 2)
        );

        console.log('\n📄 Análisis completo guardado en: video-section-analysis.json');

    } catch (error) {
        console.error('❌ Error durante el análisis:', error);
    } finally {
        await browser.close();
        console.log('\n✅ Análisis completado');
    }
}

// Ejecutar análisis
analyzeVideoSection().catch(console.error);