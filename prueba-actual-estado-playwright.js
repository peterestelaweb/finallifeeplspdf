const { chromium } = require('playwright');

(async () => {
    console.log('Iniciando prueba de la página BMAD-METHOD con Playwright...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    const page = await context.newPage();

    try {
        // Navegar a la página principal
        await page.goto('file:///Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/index.html');

        console.log('✅ Página cargada correctamente');

        // Esperar a que la página se cargue completamente
        await page.waitForLoadState('networkidle');

        // Tomar captura de pantalla general
        await page.screenshot({
            path: 'test-results/prueba-actual-estado-general.png',
            fullPage: true
        });
        console.log('📸 Captura de pantalla general guardada');

        // Verificar elementos principales
        console.log('\n🔍 Verificando elementos principales...');

        // Verificar header
        const headerVisible = await page.isVisible('.header');
        console.log(`Header visible: ${headerVisible}`);

        // Verificar sección de búsqueda
        const searchVisible = await page.isVisible('.search-section');
        console.log(`Sección de búsqueda visible: ${searchVisible}`);

        // Verificar sección de videos
        const videoVisible = await page.isVisible('.video-section');
        console.log(`Sección de videos visible: ${videoVisible}`);

        // Verificar footer
        const footerVisible = await page.isVisible('.footer');
        console.log(`Footer visible: ${footerVisible}`);

        // Verificar el aviso legal para mercado americano
        console.log('\n⚖️ Verificando advertencia para mercado americano...');

        const legalLinkVisible = await page.isVisible('#disclaimerLink');
        console.log(`Enlace de disclaimer visible: ${legalLinkVisible}`);

        // Tomar captura del footer con el disclaimer
        if (legalLinkVisible) {
            await page.locator('.footer').screenshot({
                path: 'test-results/prueba-footer-disclaimer.png'
            });
            console.log('📸 Captura del footer con disclaimer guardada');
        }

        // Probar el modal legal
        console.log('\n🪟 Probando modal legal...');

        // Clic en el enlace del disclaimer
        await page.click('#disclaimerLink');

        // Esperar a que el modal se muestre
        await page.waitForSelector('#legalModal', { state: 'visible' });

        // Tomar captura del modal
        await page.screenshot({
            path: 'test-results/prueba-modal-legal-abierto.png'
        });
        console.log('📸 Captura del modal legal abierto guardada');

        // Verificar contenido del modal
        const modalTitle = await page.textContent('.legal-modal-header h3');
        console.log(`Título del modal: ${modalTitle}`);

        // Cerrar el modal
        await page.click('#closeLegalModal');
        await page.waitForSelector('#legalModal', { state: 'hidden' });
        console.log('✅ Modal cerrado correctamente');

        // Probar diseño responsive
        console.log('\n📱 Probando diseño responsive...');

        // Tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'test-results/prueba-responsive-tablet.png'
        });
        console.log('📸 Captura tablet guardada');

        // Móvil
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'test-results/prueba-responsive-movil.png'
        });
        console.log('📸 Captura móvil guardada');

        // Volver a desktop
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Probar búsqueda básica
        console.log('\n🔎 Probando funcionalidad de búsqueda...');

        await page.fill('#searchInput', 'omega3');
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: 'test-results/prueba-busqueda-omega3.png'
        });
        console.log('📸 Captura de búsqueda guardada');

        // Limpiar búsqueda
        await page.click('#clearSearch');

        console.log('\n✅ Prueba completada exitosamente');
        console.log('📁 Las capturas se han guardado en la carpeta test-results/');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);

        // Tomar captura de error
        await page.screenshot({
            path: 'test-results/prueba-error.png'
        });
        console.log('📸 Captura de error guardada');
    } finally {
        await browser.close();
    }
})();