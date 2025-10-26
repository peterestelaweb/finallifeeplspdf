const { chromium } = require('playwright');

(async () => {
    console.log('🧪 PROBANDO SOLUCIÓN MEJORADA - SIN BLUR BLOQUEANTE');
    console.log('====================================================');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Habilitar la consola para ver errores
        page.on('console', msg => {
            console.log(`📝 CONSOLE: ${msg.type()}: ${msg.text()}`);
        });

        page.on('pageerror', error => {
            console.log(`❌ PAGE ERROR: ${error.message}`);
        });

        // Limpiar localStorage para simular primera visita
        await page.goto('http://localhost:4000', {
            waitUntil: 'networkidle',
            timeout: 10000
        });

        await page.evaluate(() => {
            localStorage.clear();
        });

        // Recargar para probar con localStorage limpio
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // Verificar si el banner mejorado está presente
        console.log('🔍 Verificando banner legal mejorado...');
        const bannerExists = await page.$('.legal-notice-banner');
        const bodyWithBanner = await page.$('.body-with-legal-banner');

        console.log(`✅ Banner existe: ${!!bannerExists}`);
        console.log(`✅ Body con banner: ${!!bodyWithBanner}`);

        // Captura de pantalla inicial
        console.log('📸 Tomando captura de pantalla de la solución mejorada...');
        await page.screenshot({
            path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/solucion-mejorada-inicial.png',
            fullPage: true
        });

        // Analizar el CSS del banner mejorado
        console.log('🎨 Analizando estilos del banner mejorado...');
        const bannerStyles = await page.evaluate(() => {
            const banner = document.querySelector('.legal-notice-banner');
            const body = document.body;

            return {
                banner: banner ? {
                    display: window.getComputedStyle(banner).display,
                    position: window.getComputedStyle(banner).position,
                    zIndex: window.getComputedStyle(banner).zIndex,
                    background: window.getComputedStyle(banner).background,
                    transform: window.getComputedStyle(banner).transform,
                    backdropFilter: window.getComputedStyle(banner).backdropFilter
                } : null,
                body: {
                    overflow: window.getComputedStyle(body).overflow,
                    classList: Array.from(body.classList)
                }
            };
        });

        console.log('📊 Estilos del banner mejorado:');
        console.log(JSON.stringify(bannerStyles, null, 2));

        // Verificar que NO hay overlay bloqueante
        const oldOverlay = await page.$('.us-market-overlay');
        console.log(`🚫 Overlay antiguo (debe ser falso): ${!!oldOverlay}`);

        // Probar interacción con el botón de aceptar
        console.log('🖱️ Probando interacción con el botón ACEPTAR...');
        const acceptButton = await page.$('.accept-btn');

        if (acceptButton) {
            console.log('✅ Botón de aceptar encontrado');

            // Esperar antes de hacer clic
            await page.waitForTimeout(2000);

            // Hacer clic en el botón
            await acceptButton.click();

            // Esperar a que el banner desaparezca
            await page.waitForTimeout(2000);

            // Verificar si el banner desapareció
            const bannerAfterClick = await page.$('.legal-notice-banner');
            console.log(`🔍 Banner después de clic: ${!!bannerAfterClick}`);

            // Tomar captura después de aceptar
            await page.screenshot({
                path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/solucion-mejorada-despues-aceptar.png',
                fullPage: true
            });
        } else {
            console.log('❌ No se encontró el botón de aceptar');
        }

        // Verificar localStorage
        console.log('💾 Verificando localStorage...');
        const localStorageData = await page.evaluate(() => {
            return {
                usMarketAccepted: localStorage.getItem('usMarketAccepted'),
                usMarketAcceptedDate: localStorage.getItem('usMarketAcceptedDate')
            };
        });

        console.log('📦 Datos en localStorage:', localStorageData);

        // Probar recargar la página
        console.log('🔄 Probando recarga de página...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Verificar si el banner reaparece
        const bannerAfterReload = await page.$('.legal-notice-banner');
        console.log(`🔍 Banner después de recargar: ${!!bannerAfterReload}`);

        // Verificar indicador permanente
        const indicator = await page.$('.us-market-indicator');
        console.log(`📍 Indicador permanente: ${!!indicator}`);

        await page.screenshot({
            path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/solucion-mejorada-final.png',
            fullPage: true
        });

        console.log('🎉 PRUEBA DE SOLUCIÓN MEJORADA COMPLETADA');

    } catch (error) {
        console.error('❌ ERROR DURANTE LA PRUEBA:', error);

        // Tomar captura incluso si hay error
        await page.screenshot({
            path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/solucion-mejorada-error.png',
            fullPage: true
        });
    } finally {
        await browser.close();
    }
})();