const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function pruebaManual() {
    console.log('🚨 INICIANDO PRUEBA MANUAL DE SOLUCIÓN IMPOSIBLE DE IGNORAR');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    try {
        // Limpiar localStorage para simular primer visita
        await page.goto('http://localhost:8000');
        await page.evaluate(() => {
            localStorage.clear();
            console.log('LocalStorage limpiado');
        });

        // Recargar la página
        await page.reload();
        console.log('📄 Página recargada');

        // Esperar a que aparezca el overlay
        console.log('⏳ Esperando overlay obligatorio...');
        await page.waitForSelector('.us-market-overlay', { timeout: 10000 });
        await page.waitForSelector('.us-market-modal', { timeout: 5000 });

        // Tomar captura del overlay
        await page.screenshot({
            path: 'test-results/01-overlay-obligatorio.png',
            fullPage: true
        });
        console.log('📸 Captura del overlay tomada');

        // Verificar texto del overlay
        const modalSubtitle = await page.textContent('.modal-subtitle');
        console.log('📝 Texto del overlay:', modalSubtitle.trim());

        // Verificar que el sitio está bloqueado
        const bodyHasOverlay = await page.$eval('body', body =>
            body.classList.contains('body-with-overlay')
        );
        console.log('🚫 Sitio bloqueado:', bodyHasOverlay);

        // Esperar unos segundos para ver el overlay
        console.log('⏳ Esperando 5 segundos antes de aceptar...');
        await page.waitForTimeout(5000);

        // Aceptar el aviso
        console.log('✅ Aceptando el aviso...');
        await page.click('.confirm-btn');

        // Esperar a que desaparezca el overlay
        await page.waitForSelector('.us-market-overlay', { state: 'hidden', timeout: 5000 });
        console.log('✅ Overlay eliminado');

        // Tomar captura después de aceptar
        await page.screenshot({
            path: 'test-results/02-despues-aceptar.png',
            fullPage: true
        });

        // Verificar banner permanente
        try {
            await page.waitForSelector('.us-market-banner', { timeout: 5000 });
            console.log('📢 Banner permanente encontrado');

            const bannerText = await page.textContent('.banner-subtitle');
            console.log('📝 Texto del banner:', bannerText.trim());

            // Tomar captura del banner
            await page.screenshot({
                path: 'test-results/03-banner-permanente.png',
                fullPage: true
            });
        } catch (error) {
            console.log('⚠️ Banner permanente no encontrado:', error.message);
        }

        // Verificar indicador en header
        try {
            await page.waitForSelector('.us-market-indicator', { timeout: 5000 });
            console.log('📍 Indicador en header encontrado');

            const indicatorText = await page.textContent('.us-market-indicator');
            console.log('📍 Texto del indicador:', indicatorText.trim());
        } catch (error) {
            console.log('⚠️ Indicador no encontrado:', error.message);
        }

        // Probar el buscador
        console.log('🔍 Probando el buscador...');
        await page.fill('#searchInput', 'test');
        await page.waitForTimeout(1000);

        // Tomar captura final
        await page.screenshot({
            path: 'test-results/04-sistema-funcionando.png',
            fullPage: true
        });

        console.log('🎉 ¡PRUEBA MANUAL COMPLETADA!');

    } catch (error) {
        console.error('❌ ERROR:', error);

        // Tomar captura de error
        await page.screenshot({
            path: 'test-results/ERROR-manual.png',
            fullPage: true
        });
    } finally {
        await browser.close();
    }
}

// Crear directorio de resultados
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
}

pruebaManual();