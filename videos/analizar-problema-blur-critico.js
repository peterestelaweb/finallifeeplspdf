const { chromium } = require('playwright');

(async () => {
    console.log('🔍 ANALIZANDO PROBLEMA CRÍTICO DE BLUR EN SITIO LOCAL');
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

        // Acceder al sitio local
        console.log('🌐 Accediendo al sitio local...');
        await page.goto('http://localhost:4000', {
            waitUntil: 'networkidle',
            timeout: 10000
        });

        // Esperar a que cargue completamente
        console.log('⏳ Esperando carga completa...');
        await page.waitForTimeout(3000);

        // Verificar si el overlay está presente
        console.log('🔍 Verificando overlay legal...');
        const overlayExists = await page.$('.us-market-overlay');
        const bodyWithOverlay = await page.$('.body-with-overlay');

        console.log(`✅ Overlay existe: ${!!overlayExists}`);
        console.log(`✅ Body con overlay: ${!!bodyWithOverlay}`);

        // Captura de pantalla inicial
        console.log('📸 Tomando captura de pantalla inicial...');
        await page.screenshot({
            path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/problem-identificado.png',
            fullPage: true
        });

        // Analizar el CSS del overlay
        console.log('🎨 Analizando estilos del overlay...');
        const overlayStyles = await page.evaluate(() => {
            const overlay = document.querySelector('.us-market-overlay');
            const body = document.body;

            return {
                overlay: {
                    display: window.getComputedStyle(overlay).display,
                    zIndex: window.getComputedStyle(overlay).zIndex,
                    backdropFilter: window.getComputedStyle(overlay).backdropFilter,
                    background: window.getComputedStyle(overlay).background,
                    position: window.getComputedStyle(overlay).position
                },
                body: {
                    overflow: window.getComputedStyle(body).overflow,
                    classList: Array.from(body.classList)
                }
            };
        });

        console.log('📊 Estilos detectados:');
        console.log(JSON.stringify(overlayStyles, null, 2));

        // Verificar el contenido del modal
        console.log('📋 Analizando contenido del modal...');
        const modalContent = await page.evaluate(() => {
            const modal = document.querySelector('.us-market-modal');
            if (modal) {
                return {
                    title: modal.querySelector('.modal-title')?.innerText,
                    subtitle: modal.querySelector('.modal-subtitle')?.innerText,
                    button: modal.querySelector('.confirm-btn')?.innerText
                };
            }
            return null;
        });

        console.log('📄 Contenido del modal:', modalContent);

        // Intentar interactuar con el botón de aceptar
        console.log('🖱️ Probando interacción con el botón ACEPTAR...');
        const acceptButton = await page.$('.confirm-btn');

        if (acceptButton) {
            console.log('✅ Botón de aceptar encontrado');

            // Esperar antes de hacer clic
            await page.waitForTimeout(2000);

            // Hacer clic en el botón
            await acceptButton.click();

            // Esperar a que el overlay desaparezca
            await page.waitForTimeout(2000);

            // Verificar si el overlay desapareció
            const overlayAfterClick = await page.$('.us-market-overlay');
            console.log(`🔍 Overlay después de clic: ${!!overlayAfterClick}`);

            // Tomar captura después de aceptar
            await page.screenshot({
                path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/despues-de-aceptar.png',
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

        // Verificar si el overlay reaparece
        const overlayAfterReload = await page.$('.us-market-overlay');
        console.log(`🔍 Overlay después de recargar: ${!!overlayAfterReload}`);

        await page.screenshot({
            path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/despues-de-recargar.png',
            fullPage: true
        });

        console.log('🎯 ANÁLISIS COMPLETADO');

    } catch (error) {
        console.error('❌ ERROR DURANTE EL ANÁLISIS:', error);

        // Tomar captura incluso si hay error
        await page.screenshot({
            path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/error-estado.png',
            fullPage: true
        });
    } finally {
        await browser.close();
    }
})();