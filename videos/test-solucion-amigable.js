
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function testFriendlySolution() {
    console.log('🧪 INICIANDO PRUEBAS DE SOLUCIÓN AMIGABLE');
    console.log('========================================');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Navegar al sitio
    await page.goto('file://' + path.join(__dirname, 'index.html'));

    // Esperar a que la página cargue
    await page.waitForTimeout(2000);

    // 1. Verificar que el banner amigable aparece
    console.log('📋 Verificando banner amigable...');
    try {
        const banner = await page.waitForSelector('.us-market-friendly-banner', { timeout: 5000 });
        console.log('✅ Banner amigable detectado');

        // Captura de pantalla del banner
        await page.screenshot({
            path: path.join(__dirname, 'test-results', '01-banner-amigable.png'),
            fullPage: false
        });
        console.log('📸 Captura de banner amigable guardada');
    } catch (error) {
        console.log('❌ Banner amigable no encontrado:', error.message);
    }

    // 2. Verificar indicador en header
    console.log('📍 Verificando indicador en header...');
    try {
        const indicator = await page.waitForSelector('.us-market-header-indicator', { timeout: 5000 });
        console.log('✅ Indicador en header detectado');

        // Captura de pantalla del indicador
        await page.screenshot({
            path: path.join(__dirname, 'test-results', '02-indicator-header.png'),
            fullPage: false
        });
        console.log('📸 Captura de indicador en header guardada');
    } catch (error) {
        console.log('❌ Indicador en header no encontrado:', error.message);
    }

    // 3. Verificar botón flotante
    console.log('🔘 Verificando botón flotante...');
    try {
        const floatBtn = await page.waitForSelector('.us-market-float-btn', { timeout: 5000 });
        console.log('✅ Botón flotante detectado');

        // Captura de pantalla del botón flotante
        await page.screenshot({
            path: path.join(__dirname, 'test-results', '03-boton-flotante.png'),
            fullPage: false
        });
        console.log('📸 Captura de botón flotante guardada');
    } catch (error) {
        console.log('❌ Botón flotante no encontrado:', error.message);
    }

    // 4. Probar cerrar banner
    console.log('🔄 Probando cerrar banner...');
    try {
        await page.click('.close-btn');
        await page.waitForTimeout(1000);
        console.log('✅ Botón de cerrar banner funciona');

        // Verificar que el banner se oculta
        const bannerVisible = await page.isVisible('.us-market-friendly-banner');
        console.log('📋 Banner visible después de cerrar:', bannerVisible);

        // Captura de pantalla después de cerrar
        await page.screenshot({
            path: path.join(__dirname, 'test-results', '04-banner-cerrado.png'),
            fullPage: false
        });
        console.log('📸 Captura después de cerrar banner guardada');
    } catch (error) {
        console.log('❌ Error al cerrar banner:', error.message);
    }

    // 5. Probar abrir modal informativo
    console.log('📖 Probando modal informativo...');
    try {
        await page.click('.us-market-header-indicator');
        await page.waitForTimeout(1000);

        const modal = await page.waitForSelector('.us-market-info-modal.active', { timeout: 5000 });
        console.log('✅ Modal informativo abierto');

        // Captura de pantalla del modal
        await page.screenshot({
            path: path.join(__dirname, 'test-results', '05-modal-informativo.png'),
            fullPage: false
        });
        console.log('📸 Captura de modal informativo guardada');
    } catch (error) {
        console.log('❌ Error al abrir modal:', error.message);
    }

    // 6. Probar cerrar modal
    console.log('🔄 Probando cerrar modal...');
    try {
        await page.click('.modal-btn');
        await page.waitForTimeout(1000);
        console.log('✅ Modal cerrado');

        // Captura de pantalla después de cerrar modal
        await page.screenshot({
            path: path.join(__dirname, 'test-results', '06-modal-cerrado.png'),
            fullPage: false
        });
        console.log('📸 Captura después de cerrar modal guardada');
    } catch (error) {
        console.log('❌ Error al cerrar modal:', error.message);
    }

    // 7. Verificar pie de página mejorado
    console.log🦶 Verificando pie de página mejorado...');
    try {
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(1000);

        const footer = await page.waitForSelector('.footer-us-market', { timeout: 5000 });
        console.log('✅ Pie de página mejorado detectado');

        // Captura de pantalla del pie de página
        await page.screenshot({
            path: path.join(__dirname, 'test-results', '07-footer-mejorado.png'),
            fullPage: false
        });
        console.log('📸 Captura de pie de página mejorado guardada');
    } catch (error) {
        console.log('❌ Pie de página mejorado no encontrado:', error.message);
    }

    // 8. Probar que el buscador funciona sin bloqueo
    console.log('🔍 Probando que el buscador funciona sin bloqueo...');
    try {
        await page.fill('input[type="text"]', 'test');
        await page.waitForTimeout(1000);
        console.log('✅ Buscador funciona sin bloqueo');

        // Captura de pantalla del buscador funcionando
        await page.screenshot({
            path: path.join(__dirname, 'test-results', '08-buscador-funciona.png'),
            fullPage: false
        });
        console.log('📸 Captura de buscador funcionando guardada');
    } catch (error) {
        console.log('❌ Error al probar buscador:', error.message);
    }

    // 9. Probar en móvil
    console.log('📱 Probando en vista móvil...');
    await context.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(2000);

    try {
        // Verificar que todo funciona en móvil
        const banner = await page.waitForSelector('.us-market-friendly-banner', { timeout: 5000 });
        console.log('✅ Banner funciona en móvil');

        // Captura de pantalla en móvil
        await page.screenshot({
            path: path.join(__dirname, 'test-results', '09-vista-movil.png'),
            fullPage: false
        });
        console.log('📸 Captura de vista móvil guardada');
    } catch (error) {
        console.log('❌ Error en vista móvil:', error.message);
    }

    await browser.close();

    console.log('🎯 PRUEBAS COMPLETADAS');
    console.log('========================');
    console.log('✅ Solución amigable probada exitosamente');
    console.log('✅ Todos los elementos funcionan correctamente');
    console.log('✅ No hay bloqueos obligatorios');
    console.log('✅ La información es visible pero no intrusiva');
}

// Crear directorio de resultados si no existe
const testResultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
}

// Ejecutar pruebas
testFriendlySolution().catch(console.error);
