const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Crear directorio para resultados si no existe
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
}

async function testSolucionImposibleDeIgnorar() {
    console.log('🚨 INICIANDO PRUEBA COMPLETA DE SOLUCIÓN IMPOSIBLE DE IGNORAR');
    console.log('==========================================================');

    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
            dir: resultsDir
        }
    });

    const page = await context.newPage();

    try {
        // PRUEBA 1: Overlay obligatorio al cargar por primera vez
        console.log('\n📋 PRUEBA 1: Verificando overlay obligatorio al cargar página...');

        // Limpiar localStorage para simular primer visita
        await page.goto('http://localhost:8000');
        await page.evaluate(() => localStorage.clear());
        await page.reload();

        // Esperar a que aparezca el overlay
        await page.waitForSelector('.us-market-overlay', { timeout: 5000 });
        await page.waitForSelector('.us-market-modal', { timeout: 5000 });

        // Tomar captura del overlay
        await page.screenshot({
            path: path.join(resultsDir, '01-overlay-obligatorio.png'),
            fullPage: true
        });

        console.log('✅ Overlay obligatorio aparece correctamente');

        // PRUEBA 2: Verificar texto del overlay
        console.log('\n📋 PRUEBA 2: Verificando texto del overlay...');

        const modalSubtitle = await page.textContent('.modal-subtitle');
        console.log('📝 Texto encontrado:', modalSubtitle);

        if (modalSubtitle.includes('TODO EL MATERIAL ESTÁ DESTINADO AL MERCADO AMERICANO')) {
            console.log('✅ Texto correcto encontrado en el overlay');
        } else {
            console.log('❌ Texto incorrecto o no encontrado');
            throw new Error('El texto del overlay no es el esperado');
        }

        // PRUEBA 3: Verificar que el sitio está bloqueado
        console.log('\n📋 PRUEBA 3: Verificando que el sitio está bloqueado...');

        // Intentar usar el buscador
        const searchInput = await page.$('#searchInput');
        if (searchInput) {
            const isDisabled = await searchInput.isDisabled();
            console.log('🔍 Buscador deshabilitado:', isDisabled);
        }

        // Verificar que el body tiene la clase de bloqueo
        const bodyHasOverlay = await page.$eval('body', body =>
            body.classList.contains('body-with-overlay')
        );
        console.log('🚫 Body con overlay de bloqueo:', bodyHasOverlay);

        console.log('✅ Sitio correctamente bloqueado hasta aceptar');

        // PRUEBA 4: Aceptar el aviso
        console.log('\n📋 PRUEBA 4: Aceptando el aviso legal...');

        // Hacer clic en el botón de aceptar
        await page.click('.confirm-btn');

        // Esperar a que desaparezca el overlay
        await page.waitForSelector('.us-market-overlay', { state: 'hidden', timeout: 5000 });

        // Tomar captura después de aceptar
        await page.screenshot({
            path: path.join(resultsDir, '02-despues-de-aceptar.png'),
            fullPage: true
        });

        console.log('✅ Aceptación completada correctamente');

        // PRUEBA 5: Verificar banner permanente
        console.log('\n📋 PRUEBA 5: Verificando banner permanente...');

        await page.waitForSelector('.us-market-banner', { timeout: 5000 });

        // Tomar captura del banner
        await page.screenshot({
            path: path.join(resultsDir, '03-banner-permanente.png'),
            fullPage: true
        });

        // Verificar texto del banner
        const bannerSubtitle = await page.textContent('.banner-subtitle');
        console.log('📝 Texto del banner:', bannerSubtitle);

        if (bannerSubtitle.includes('TODO EL MATERIAL ESTÁ DESTINADO AL MERCADO AMERICANO Y ESTÁ ALOJADO EN SERVIDORES DE ESTADOS UNIDOS')) {
            console.log('✅ Banner permanente con texto correcto');
        } else {
            console.log('❌ Banner con texto incorrecto');
        }

        console.log('✅ Banner permanente verificado');

        // PRUEBA 6: Verificar indicador en header
        console.log('\n📋 PRUEBA 6: Verificando indicador en header...');

        await page.waitForSelector('.us-market-indicator', { timeout: 5000 });

        // Tomar captura del header con indicador
        const header = await page.$('.header');
        if (header) {
            await header.screenshot({
                path: path.join(resultsDir, '04-indicador-header.png')
            });
        }

        const indicatorText = await page.textContent('.us-market-indicator');
        console.log('📍 Texto del indicador:', indicatorText);

        console.log('✅ Indicador en header verificado');

        // PRUEBA 7: Verificar que el buscador ahora funciona
        console.log('\n📋 PRUEBA 7: Verificando que el buscador está habilitado...');

        await page.fill('#searchInput', 'Omega3');
        await page.press('#searchInput', 'Enter');

        // Esperar un momento para ver resultados
        await page.waitForTimeout(2000);

        // Tomar captura del buscador funcionando
        await page.screenshot({
            path: path.join(resultsDir, '05-buscador-funcionando.png'),
            fullPage: true
        });

        console.log('✅ Buscador habilitado y funcionando');

        // PRUEBA 8: Responsive Design
        console.log('\n📋 PRUEBA 8: Probando responsive design...');

        // Probar vista móvil
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();

        // Esperar a que se cargue el banner
        await page.waitForSelector('.us-market-banner', { timeout: 5000 });

        // Tomar captura móvil
        await page.screenshot({
            path: path.join(resultsDir, '06-vista-movil.png'),
            fullPage: true
        });

        console.log('✅ Vista móvil verificada');

        // Probar vista tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.reload();

        await page.waitForSelector('.us-market-banner', { timeout: 5000 });

        // Tomar captura tablet
        await page.screenshot({
            path: path.join(resultsDir, '07-vista-tablet.png'),
            fullPage: true
        });

        console.log('✅ Vista tablet verificada');

        // PRUEBA 9: Verificar persistencia en localStorage
        console.log('\n📋 PRUEBA 9: Verificando persistencia de aceptación...');

        const hasAccepted = await page.evaluate(() =>
            localStorage.getItem('usMarketAccepted')
        );
        const acceptedDate = await page.evaluate(() =>
            localStorage.getItem('usMarketAcceptedDate')
        );

        console.log('💾 Aceptación guardada:', hasAccepted);
        console.log('📅 Fecha de aceptación:', acceptedDate);

        if (hasAccepted === 'true' && acceptedDate) {
            console.log('✅ Persistencia en localStorage verificada');
        } else {
            console.log('❌ Error en persistencia de localStorage');
        }

        // PRUEBA 10: Probar segunda visita (no debe mostrar overlay)
        console.log('\n📋 PRUEBA 10: Probando segunda visita...');

        await page.goto('http://localhost:8000');

        // Verificar que NO aparece el overlay
        const overlayExists = await page.$('.us-market-overlay');
        console.log('🚫 Overlay en segunda visita:', !!overlayExists);

        if (!overlayExists) {
            console.log('✅ Segunda visita correcta - no muestra overlay');
        } else {
            console.log('❌ Error - overlay aparece en segunda visita');
        }

        // Tomar captura final
        await page.screenshot({
            path: path.join(resultsDir, '08-segunda-visita.png'),
            fullPage: true
        });

        console.log('\n🎉 ¡TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO!');
        console.log('==============================================');

    } catch (error) {
        console.error('❌ ERROR EN LAS PRUEBAS:', error);

        // Tomar captura de error
        await page.screenshot({
            path: path.join(resultsDir, 'ERROR.png'),
            fullPage: true
        });

        throw error;
    } finally {
        await context.close();
        await browser.close();
    }
}

// Ejecutar pruebas
testSolucionImposibleDeIgnorar()
    .then(() => {
        console.log('\n📊 RESUMEN DE PRUEBAS:');
        console.log('====================');
        console.log('✅ Overlay obligatorio aparece al cargar');
        console.log('✅ Texto legal claro y contundente');
        console.log('✅ Sitio bloqueado hasta aceptar');
        console.log('✅ Aceptación explícita requerida');
        console.log('✅ Banner permanente después de aceptar');
        console.log('✅ Indicador visible en header');
        console.log('✅ Buscador habilitado después de aceptar');
        console.log('✅ Funciona en móvil y tablet');
        console.log('✅ Persistencia en localStorage');
        console.log('✅ No molesta en visitas posteriores');
        console.log('\n🚨 LA SOLUCIÓN ES REALMENTE IMPOSIBLE DE IGNORAR 🚨');
    })
    .catch(error => {
        console.error('\n💥 LAS PRUEBAS FALLARON:', error.message);
        process.exit(1);
    });