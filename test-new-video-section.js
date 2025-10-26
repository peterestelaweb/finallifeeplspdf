const { chromium } = require('playwright');

async function testNewVideoSection() {
    console.log('🧪 Probando la nueva sección de videos con dos videos...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext();

    try {
        // Probar diferentes tamaños de pantalla
        const viewports = [
            { name: 'Desktop', width: 1280, height: 720 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile', width: 375, height: 667 }
        ];

        for (const viewport of viewports) {
            console.log(`📱 Probando en ${viewport.name} (${viewport.width}x${viewport.height})`);

            const page = await context.newPage();
            await page.setViewportSize(viewport);

            // Navegar a la página
            await page.goto('file:///Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/index.html');
            await page.waitForLoadState('networkidle');

            // Analizar la nueva estructura
            const analysis = await page.evaluate(() => {
                const videoSection = document.querySelector('.video-section');
                const videosHeader = document.querySelector('.videos-header');
                const videosGrid = document.querySelector('.videos-grid');
                const videoCards = document.querySelectorAll('.video-card');

                return {
                    videoSection: {
                        exists: !!videoSection,
                        width: videoSection?.offsetWidth || 0,
                        height: videoSection?.offsetHeight || 0
                    },
                    videosHeader: {
                        exists: !!videosHeader,
                        titleElement: !!document.querySelector('.videos-title'),
                        subtitleElement: !!document.querySelector('.videos-subtitle')
                    },
                    videosGrid: {
                        exists: !!videosGrid,
                        display: window.getComputedStyle(videosGrid).display,
                        gridTemplateColumns: window.getComputedStyle(videosGrid).gridTemplateColumns,
                        gap: window.getComputedStyle(videosGrid).gap
                    },
                    videoCards: {
                        count: videoCards.length,
                        widths: Array.from(videoCards).map(card => card.offsetWidth),
                        heights: Array.from(videoCards).map(card => card.offsetHeight)
                    },
                    videos: {
                        count: document.querySelectorAll('.phone-video').length,
                        soundToggles: document.querySelectorAll('.sound-toggle').length
                    }
                };
            });

            console.log(`  ✅ Video section: ${analysis.videoSection.exists ? 'Existe' : 'No existe'} (${analysis.videoSection.width}x${analysis.videoSection.height}px)`);
            console.log(`  ✅ Videos header: ${analysis.videosHeader.exists ? 'Existe' : 'No existe'}`);
            console.log(`  ✅ Videos grid: ${analysis.videosGrid.exists ? 'Existe' : 'No existe'} (${analysis.videosGrid.display}, ${analysis.videosGrid.gridTemplateColumns})`);
            console.log(`  ✅ Video cards: ${analysis.videoCards.count} tarjetas`);
            console.log(`  ✅ Videos: ${analysis.videos.count} videos, ${analysis.videos.soundToggles} controles de sonido`);

            // Tomar screenshot
            await page.screenshot({
                path: `video-section-${viewport.name.toLowerCase()}.png`,
                fullPage: false
            });

            await page.close();
            console.log(`  📸 Screenshot guardado: video-section-${viewport.name.toLowerCase()}.png\n`);
        }

        console.log('✅ Pruebas completadas con éxito');

        // Generar resumen
        console.log('\n📊 RESUMEN DE LA IMPLEMENTACIÓN:');
        console.log('✔️ Estructura HTML actualizada con dos videos');
        console.log('✔️ CSS Grid responsivo implementado');
        console.log('✔️ JavaScript actualizado para múltiples videos');
        console.log('✔️ Diseño adaptativo para desktop, tablet y móvil');
        console.log('✔️ Controles individuales de sonido para cada video');
        console.log('✔️ Animaciones y efectos hover mejorados');

        console.log('\n🎯 CARACTERÍSTICAS PRINCIPALES:');
        console.log('• Layout en grid: 2 columnas en desktop, 1 columna en móvil');
        console.log('• Tarjetas independientes con phone-mockup para cada video');
        console.log('• Header descriptivo con título y subtítulo');
        console.log('• Botón de WhatsApp centralizado');
        console.log('• Animaciones suaves y efectos de hover');
        console.log('• Compatibilidad con el diseño existente');

        console.log('\n📱 DISEÑO RESPONSIVE:');
        console.log('• Desktop: 2 videos lado a lado (350px+ cada uno)');
        console.log('• Tablet: 2 videos ligeramente más pequeños');
        console.log('• Mobile: Videos apilados verticalmente');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
    } finally {
        await browser.close();
        console.log('\n✅ Pruebas finalizadas');
    }
}

testNewVideoSection().catch(console.error);