const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function pruebaResponsive() {
    console.log('📱 INICIANDO PRUEBA RESPONSIVE');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();

    try {
        // Probar vista móvil
        console.log('📱 Probando vista móvil...');
        const pageMobile = await context.newPage({
            viewport: { width: 375, height: 667 }
        });

        // Limpiar localStorage y cargar
        await pageMobile.goto('http://localhost:8000');
        await pageMobile.evaluate(() => localStorage.clear());
        await pageMobile.reload();

        // Esperar overlay
        await pageMobile.waitForSelector('.us-market-overlay', { timeout: 10000 });
        console.log('✅ Overlay aparece en móvil');

        // Captura en móvil
        await pageMobile.screenshot({
            path: 'test-results/05-overlay-movil.png',
            fullPage: true
        });

        // Aceptar en móvil
        await pageMobile.click('.confirm-btn');
        await pageMobile.waitForSelector('.us-market-overlay', { state: 'hidden', timeout: 5000 });

        // Captura después de aceptar en móvil
        await pageMobile.screenshot({
            path: 'test-results/06-despues-aceptar-movil.png',
            fullPage: true
        });

        console.log('✅ Funcionamiento correcto en móvil');

        await pageMobile.close();

        // Probar vista tablet
        console.log('📋 Probando vista tablet...');
        const pageTablet = await context.newPage({
            viewport: { width: 768, height: 1024 }
        });

        // Limpiar localStorage y cargar
        await pageTablet.goto('http://localhost:8000');
        await pageTablet.evaluate(() => localStorage.clear());
        await pageTablet.reload();

        // Esperar overlay
        await pageTablet.waitForSelector('.us-market-overlay', { timeout: 10000 });
        console.log('✅ Overlay aparece en tablet');

        // Captura en tablet
        await pageTablet.screenshot({
            path: 'test-results/07-overlay-tablet.png',
            fullPage: true
        });

        // Aceptar en tablet
        await pageTablet.click('.confirm-btn');
        await pageTablet.waitForSelector('.us-market-overlay', { state: 'hidden', timeout: 5000 });

        // Captura después de aceptar en tablet
        await pageTablet.screenshot({
            path: 'test-results/08-despues-aceptar-tablet.png',
            fullPage: true
        });

        console.log('✅ Funcionamiento correcto en tablet');

        await pageTablet.close();

        console.log('🎉 ¡PRUEBA RESPONSIVE COMPLETADA!');

    } catch (error) {
        console.error('❌ ERROR EN PRUEBA RESPONSIVE:', error);
    } finally {
        await browser.close();
    }
}

pruebaResponsive();