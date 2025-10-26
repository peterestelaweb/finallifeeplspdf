const { chromium } = require('playwright');

(async () => {
    console.log('🚀 Iniciando prueba de la página web...');

    // Lanzar navegador
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Navegar a la página local
        console.log('📱 Abriendo página web...');
        await page.goto('http://localhost:8000');

        // Esperar a que cargue
        await page.waitForLoadState('networkidle');

        // Verificar título
        const title = await page.title();
        console.log(`📄 Título de la página: ${title}`);

        // Verificar logo de Sunshine Team
        console.log('☀️ Buscando logo de Sunshine Team...');
        const logo = await page.locator('.sunshine-logo');
        const logoVisible = await logo.isVisible();
        console.log(`Logo visible: ${logoVisible}`);

        if (logoVisible) {
            const logoSize = await logo.boundingBox();
            console.log(`Tamaño del logo: ${logoSize.width}x${logoSize.height}`);
        }

        // Verificar video
        console.log('📹 Verificando video...');
        const video = await page.locator('#demoVideo');
        const videoVisible = await video.isVisible();
        console.log(`Video visible: ${videoVisible}`);

        // Verificar botón de sonido
        console.log('🔊 Verificando botón de sonido...');
        const soundButton = await page.locator('#soundToggle');
        const soundButtonVisible = await soundButton.isVisible();
        console.log(`Botón de sonido visible: ${soundButtonVisible}`);

        // Tomar screenshot
        console.log('📸 Tomando screenshot...');
        await page.screenshot({ path: 'website-screenshot.png', fullPage: true });

        // Probar modo móvil
        console.log('📱 Probando vista móvil...');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');

        // Screenshot móvil
        await page.screenshot({ path: 'mobile-screenshot.png' });

        console.log('✅ Prueba completada con éxito!');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        await browser.close();
    }
})();