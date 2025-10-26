const { chromium } = require('playwright');

async function testLegalModal() {
    console.log('🧪 Iniciando prueba del modal legal...');

    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });

    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 }
    });

    const page = await context.newPage();

    try {
        // 1. Acceder a la página
        console.log('📍 Accediendo a http://localhost:8000...');
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });

        // Esperar a que la página cargue completamente
        await page.waitForSelector('.container', { timeout: 10000 });

        // 2. Verificar que la página cargó correctamente
        const title = await page.title();
        console.log(`✅ Página cargada: ${title}`);

        // 3. Hacer scroll hasta el footer
        console.log('📜 Haciendo scroll hasta el footer...');
        await page.evaluate(() => {
            document.querySelector('.footer').scrollIntoView({ behavior: 'smooth' });
        });

        // Esperar a que el footer sea visible
        await page.waitForSelector('.footer', { state: 'visible' });

        // 4. Buscar el enlace en el footer
        console.log('🔍 Buscando enlace "Información para mercado estadounidense"...');
        const disclaimerLink = await page.waitForSelector('#disclaimerLink', { state: 'visible' });

        const linkText = await disclaimerLink.textContent();
        console.log(`✅ Enlace encontrado: "${linkText}"`);

        // Tomar screenshot antes de hacer clic
        await page.screenshot({ path: '/tmp/modal-before-click.png', fullPage: true });

        // 5. Hacer clic en el enlace para abrir el modal
        console.log('🖱️ Haciendo clic en el enlace...');
        await disclaimerLink.click();

        // Esperar a que el modal sea visible
        await page.waitForSelector('#legalModal', { state: 'visible' });
        console.log('✅ Modal abierto correctamente');

        // Tomar screenshot del modal abierto
        await page.screenshot({ path: '/tmp/modal-opened.png', fullPage: true });

        // 6. Verificar el contenido del modal
        console.log('📋 Verificando contenido del modal...');

        const modalTitle = await page.textContent('.legal-modal-header h3');
        console.log(`📑 Título del modal: "${modalTitle}"`);

        // Verificar contenido específico
        const contentChecks = [
            { selector: '.legal-modal-body', text: 'Estados Unidos' },
            { selector: '.legal-modal-body', text: 'mercado estadounidense' },
            { selector: '.legal-modal-body', text: 'FDA' },
            { selector: '.legal-modal-body', text: 'responsabilidad' },
            { selector: '.legal-modal-body', text: 'contacto' }
        ];

        for (const check of contentChecks) {
            const element = await page.locator(check.selector);
            const isVisible = await element.isVisible();
            const hasText = await element.textContent().then(text => text.toLowerCase().includes(check.text.toLowerCase()));

            if (isVisible && hasText) {
                console.log(`✅ Contenido encontrado: "${check.text}"`);
            } else {
                console.log(`❌ Contenido no encontrado: "${check.text}"`);
            }
        }

        // 7. Probar diferentes formas de cerrar el modal

        // 7.1 Cerrar con la X
        console.log('❌ Probando cerrar con la X...');
        await page.click('.legal-modal-close');
        await page.waitForFunction(() => {
            const modal = document.getElementById('legalModal');
            return modal.style.display === 'none' || modal.style.opacity === '0';
        }, { timeout: 5000 });
        console.log('✅ Modal cerrado con la X');

        // Reabrir modal
        await disclaimerLink.click();
        await page.waitForSelector('#legalModal', { state: 'visible' });

        // 7.2 Cerrar con botón "Entendido"
        console.log('👍 Probando cerrar con botón "Entendido"...');
        await page.click('#closeLegalModal');
        await page.waitForFunction(() => {
            const modal = document.getElementById('legalModal');
            return modal.style.display === 'none' || modal.style.opacity === '0';
        }, { timeout: 5000 });
        console.log('✅ Modal cerrado con botón "Entendido"');

        // Reabrir modal
        await disclaimerLink.click();
        await page.waitForSelector('#legalModal', { state: 'visible' });

        // 7.3 Cerrar haciendo clic fuera
        console.log('🖱️ Probando cerrar haciendo clic fuera...');
        const modalBounds = await page.locator('#legalModal').boundingBox();
        await page.mouse.click(modalBounds.x - 10, modalBounds.y - 10);
        await page.waitForFunction(() => {
            const modal = document.getElementById('legalModal');
            return modal.style.display === 'none' || modal.style.opacity === '0';
        }, { timeout: 5000 });
        console.log('✅ Modal cerrado haciendo clic fuera');

        // Reabrir modal
        await disclaimerLink.click();
        await page.waitForSelector('#legalModal', { state: 'visible' });

        // 7.4 Cerrar con tecla Escape
        console.log('⌨️ Probando cerrar con tecla Escape...');
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => {
            const modal = document.getElementById('legalModal');
            return modal.style.display === 'none' || modal.style.opacity === '0';
        }, { timeout: 5000 });
        console.log('✅ Modal cerrado con tecla Escape');

        // 8. Verificar errores de JavaScript
        console.log('🔍 Revisando errores de JavaScript...');
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Recargar página para capturar errores
        await page.reload({ waitUntil: 'networkidle' });

        if (errors.length === 0) {
            console.log('✅ No se encontraron errores de JavaScript');
        } else {
            console.log('❌ Errores de JavaScript encontrados:');
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        // 9. Verificar respuesta móvil
        console.log('📱 Probando vista móvil...');
        await context.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });

        // Hacer scroll y hacer clic en móvil
        await page.evaluate(() => {
            document.querySelector('.footer').scrollIntoView({ behavior: 'smooth' });
        });

        await page.waitForSelector('#disclaimerLink', { state: 'visible' });
        await page.click('#disclaimerLink');
        await page.waitForSelector('#legalModal', { state: 'visible' });

        await page.screenshot({ path: '/tmp/modal-mobile.png', fullPage: true });
        console.log('✅ Modal funciona correctamente en móvil');

        console.log('🎉 ¡Prueba completada con éxito!');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);

        // Tomar screenshot del error
        await page.screenshot({ path: '/tmp/modal-error.png', fullPage: true });

    } finally {
        await browser.close();
    }
}

// Ejecutar la prueba
testLegalModal().catch(console.error);