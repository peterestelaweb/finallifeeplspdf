const { chromium } = require('playwright');

(async () => {
    console.log('🖥️ Analizando diseño desktop y márgenes...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Analizar vista desktop
        console.log('📊 Analizando márgenes y contenido en desktop...');
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');

        // Analizar contenedor principal
        const container = await page.locator('.container').first();
        const containerVisible = await container.isVisible();

        if (containerVisible) {
            const containerBox = await container.boundingBox();
            const viewportSize = page.viewportSize();

            console.log(`📦 Contenedor principal:`);
            console.log(`   Visible: ${containerVisible}`);
            console.log(`   Tamaño: ${containerBox.width}x${containerBox.height}px`);
            console.log(`   Posición: ${containerBox.x}x${containerBox.y}px`);
            console.log(`   Viewport: ${viewportSize.width}x${viewportSize.height}px`);

            // Calcular márgenes
            const leftMargin = containerBox.x;
            const rightMargin = viewportSize.width - containerBox.x - containerBox.width;
            const usedWidth = containerBox.width;
            const availableWidth = viewportSize.width;
            const widthPercentage = (usedWidth / availableWidth * 100).toFixed(1);

            console.log(`📐 Márgenes laterales:`);
            console.log(`   Izquierdo: ${leftMargin}px`);
            console.log(`   Derecho: ${rightMargin}px`);
            console.log(`   Total márgenes: ${leftMargin + rightMargin}px`);
            console.log(`   Ancho utilizado: ${widthPercentage}%`);

            if (widthPercentage < 90) {
                console.log(`⚠️  El contenido usa solo ${widthPercentage}% del ancho disponible`);
                console.log(`💡 Se podría expandir para usar más espacio`);
            }
        }

        // Analizar botón WhatsApp
        const whatsappButton = await page.locator('.whatsapp-float').first();
        const buttonVisible = await whatsappButton.isVisible();

        if (buttonVisible) {
            const buttonBox = await whatsappButton.boundingBox();
            console.log(`\n📱 Botón WhatsApp:`);
            console.log(`   Visible: ${buttonVisible}`);
            console.log(`   Tamaño: ${buttonBox.width}x${buttonBox.height}px`);
            console.log(`   Posición: ${buttonBox.x}x${buttonBox.y}px`);

            // Verificar si está flotando correctamente
            const distanceFromRight = viewportSize.width - buttonBox.x - buttonBox.width;
            const distanceFromBottom = viewportSize.height - buttonBox.y - buttonBox.height;

            console.log(`   Distancia desde derecha: ${distanceFromRight}px`);
            console.log(`   Distancia desde abajo: ${distanceFromBottom}px`);

            if (distanceFromRight > 50) {
                console.log(`⚠️  El botón está muy lejos del borde derecho`);
            }
        }

        // Analizar secciones específicas
        console.log(`\n📋 Analizando secciones:`);

        const sections = [
            { name: 'Header', selector: '.header' },
            { name: 'Search', selector: '.search-section' },
            { name: 'Stats', selector: '.stats-section' },
            { name: 'Video', selector: '.video-section' },
            { name: 'Results', selector: '.results-section' },
            { name: 'Contact', selector: '.contact-section' }
        ];

        for (const section of sections) {
            const element = await page.locator(section.selector).first();
            if (await element.isVisible()) {
                const box = await element.boundingBox();
                const sectionWidthPercentage = (box.width / viewportSize.width * 100).toFixed(1);
                console.log(`   ${section.name}: ${sectionWidthPercentage}% ancho`);
            }
        }

        // Screenshot completo
        await page.screenshot({ path: 'desktop-layout-analysis.png', fullPage: true });

        // Screenshot detalle de márgenes
        const containerBox = await container.boundingBox();
        await page.screenshot({
            path: 'desktop-margins-detail.png',
            clip: {
                x: 0,
                y: containerBox.y - 50,
                width: viewportSize.width,
                height: containerBox.height + 100
            }
        });

        console.log(`\n✅ Análisis completado`);
        console.log(`📸 Screenshots guardados para referencia`);

    } catch (error) {
        console.error('❌ Error durante el análisis:', error);
    } finally {
        await browser.close();
    }
})();