const { chromium } = require('playwright');

async function testModalManual() {
    console.log('🧪 Prueba manual del modal legal...');

    const browser = await chromium.launch({
        headless: false, // Modo visible para poder ver
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

        // Esperar a que la página cargue
        await page.waitForSelector('.header', { timeout: 10000 });
        console.log('✅ Página cargada correctamente');

        // 2. Hacer scroll hasta el footer
        console.log('📜 Haciendo scroll hasta el footer...');
        await page.evaluate(() => {
            document.querySelector('.footer').scrollIntoView({ behavior: 'smooth' });
        });

        // Esperar a que el footer sea visible
        await page.waitForSelector('.footer', { state: 'visible' });
        console.log('✅ Footer visible');

        // 3. Buscar el enlace
        console.log('🔍 Buscando enlace "Información para mercado estadounidense"...');
        const disclaimerLink = await page.waitForSelector('#disclaimerLink', { state: 'visible' });

        const linkText = await disclaimerLink.textContent();
        console.log(`✅ Enlace encontrado: "${linkText}"`);

        // 4. Tomar screenshot antes de abrir el modal
        await page.screenshot({ path: '/tmp/before-modal.png', fullPage: true });

        // 5. Hacer clic en el enlace
        console.log('🖱️ Haciendo clic en el enlace...');
        await disclaimerLink.click();

        // Esperar a que el modal sea visible
        await page.waitForSelector('#legalModal', { state: 'visible' });
        console.log('✅ Modal abierto');

        // Tomar screenshot del modal abierto
        await page.screenshot({ path: '/tmp/modal-opened.png', fullPage: true });

        // 6. Verificar contenido del modal
        console.log('📋 Verificando contenido...');
        const modalTitle = await page.textContent('.legal-modal-header h3');
        console.log(`📑 Título: "${modalTitle}"`);

        // Verificar contenido específico
        const modalContent = await page.textContent('.legal-modal-body');
        const requiredContent = [
            'Estados Unidos',
            'mercado estadounidense',
            'FDA',
            'responsabilidad'
        ];

        requiredContent.forEach(content => {
            if (modalContent.toLowerCase().includes(content.toLowerCase())) {
                console.log(`✅ Contenido encontrado: "${content}"`);
            } else {
                console.log(`❌ Contenido no encontrado: "${content}"`);
            }
        });

        // 7. Pruebas de cierre
        console.log('\n🔧 Pruebas de cierre del modal:');

        // 7.1 Cerrar con la X
        console.log('\n❌ Probando cerrar con la X...');
        await page.click('.legal-modal-close');
        await page.waitForTimeout(500); // Esperar la animación

        const isHidden = await page.evaluate(() => {
            const modal = document.getElementById('legalModal');
            return modal.style.display === 'none' || modal.style.opacity === '0';
        });

        if (isHidden) {
            console.log('✅ Modal cerrado con la X');
        } else {
            console.log('❌ Modal no cerró con la X');
        }

        // Reabrir modal
        await disclaimerLink.click();
        await page.waitForSelector('#legalModal', { state: 'visible' });

        // 7.2 Cerrar con botón "Entendido"
        console.log('\n👍 Probando cerrar con botón "Entendido"...');
        await page.click('#closeLegalModal');
        await page.waitForTimeout(500);

        const isHidden2 = await page.evaluate(() => {
            const modal = document.getElementById('legalModal');
            return modal.style.display === 'none' || modal.style.opacity === '0';
        });

        if (isHidden2) {
            console.log('✅ Modal cerrado con botón "Entendido"');
        } else {
            console.log('❌ Modal no cerró con botón "Entendido"');
        }

        // Reabrir modal
        await disclaimerLink.click();
        await page.waitForSelector('#legalModal', { state: 'visible' });

        // 7.3 Cerrar con Escape
        console.log('\n⌨️ Probando cerrar con tecla Escape...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        const isHidden3 = await page.evaluate(() => {
            const modal = document.getElementById('legalModal');
            return modal.style.display === 'none' || modal.style.opacity === '0';
        });

        if (isHidden3) {
            console.log('✅ Modal cerrado con tecla Escape');
        } else {
            console.log('❌ Modal no cerró con tecla Escape');
        }

        // Reabrir modal
        await disclaimerLink.click();
        await page.waitForSelector('#legalModal', { state: 'visible' });

        // 7.4 Cerrar haciendo clic fuera (prueba especial)
        console.log('\n🖱️ Probando cerrar haciendo clic fuera...');

        // Obtener coordenadas del modal
        const modalInfo = await page.evaluate(() => {
            const modal = document.getElementById('legalModal');
            const rect = modal.getBoundingClientRect();
            return {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            };
        });

        console.log('Coordenadas del modal:', modalInfo);

        // Hacer clic en una coordenada fuera del contenido del modal pero dentro del overlay
        await page.mouse.click(modalInfo.x + modalInfo.width - 50, modalInfo.y + 50);
        await page.waitForTimeout(500);

        const isHidden4 = await page.evaluate(() => {
            const modal = document.getElementById('legalModal');
            return modal.style.display === 'none' || modal.style.opacity === '0';
        });

        if (isHidden4) {
            console.log('✅ Modal cerrado haciendo clic fuera');
        } else {
            console.log('❌ Modal no cerró haciendo clic fuera');
            console.log('Esto podría indicar un problema con el event listener del modal');
        }

        // 8. Verificar errores de JavaScript
        console.log('\n🔍 Revisando errores de JavaScript...');
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Recargar para capturar errores
        await page.reload({ waitUntil: 'networkidle' });

        if (errors.length === 0) {
            console.log('✅ No se encontraron errores de JavaScript');
        } else {
            console.log('❌ Errores de JavaScript encontrados:');
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        console.log('\n🎉 ¡Prueba manual completada!');
        console.log('Revisa las capturas de pantalla guardadas en /tmp/');
        console.log('- before-modal.png: Página antes de abrir el modal');
        console.log('- modal-opened.png: Modal abierto');

        // Mantener el navegador abierto por 10 segundos para revisión manual
        console.log('\n⏳ El navegador permanecerá abierto por 10 segundos para revisión manual...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
        await page.screenshot({ path: '/tmp/error-modal.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

testModalManual().catch(console.error);