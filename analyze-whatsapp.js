const { chromium } = require('playwright');

(async () => {
    console.log('📱 Analizando botón de WhatsApp en VitalDetoxCare...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Analizar página principal
        console.log('🔍 Buscando botones de WhatsApp...');
        await page.goto('https://vitaldetoxcare.com');
        await page.waitForLoadState('networkidle');

        // Buscar todos los elementos de WhatsApp
        const whatsappSelectors = [
            'a[href*="wa.me"]',
            'a[href*="whatsapp"]',
            'a[href*="api.whatsapp"]',
            '.whatsapp',
            '.whatsapp-float',
            '[class*="whatsapp"]',
            'i[class*="whatsapp"]',
            'svg*[class*="whatsapp"]'
        ];

        let whatsappButtons = [];

        for (const selector of whatsappSelectors) {
            try {
                const elements = await page.locator(selector).all();
                for (const element of elements) {
                    const isVisible = await element.isVisible();
                    if (isVisible) {
                        const text = await element.textContent();
                        const href = await element.getAttribute('href');
                        const className = await element.getAttribute('class');

                        // Obtener posición y tamaño
                        const boundingBox = await element.boundingBox();
                        const parent = await element.evaluateHandle(el => el.parentElement);
                        const parentClass = await parent.evaluate(el => el?.className || '');

                        whatsappButtons.push({
                            selector,
                            text: text?.trim(),
                            href,
                            className,
                            parentClass,
                            boundingBox,
                            isVisible
                        });
                    }
                }
            } catch (e) {
                // Selector no encontrado, continuar
            }
        }

        console.log(`📱 Encontrados ${whatsappButtons.length} elementos de WhatsApp:`);

        // Analizar cada botón encontrado
        for (let i = 0; i < whatsappButtons.length; i++) {
            const button = whatsappButtons[i];
            console.log(`\n🔘 Botón ${i + 1}:`);
            console.log(`   Texto: "${button.text}"`);
            console.log(`   Enlace: ${button.href}`);
            console.log(`   Clase: ${button.className}`);
            console.log(`   Padre: ${button.parentClass}`);
            console.log(`   Visible: ${button.isVisible}`);
            if (button.boundingBox) {
                console.log(`   Posición: ${button.boundingBox.x}x${button.boundingBox.y}`);
                console.log(`   Tamaño: ${button.boundingBox.width}x${button.boundingBox.height}`);
            }

            // Buscar específicamente "CHATEA CON NOSOTROS"
            if (button.text && button.text.toUpperCase().includes('CHATEA')) {
                console.log('   ✅ ¡ENCONTRADO! Botón con texto "CHATEA CON NOSOTROS"');
            }
        }

        // Buscar específicamente texto "CHATEA CON NOSOTROS" en toda la página
        console.log('\n🔍 Buscando texto "CHATEA CON NOSOTROS" en toda la página...');
        const pageText = await page.evaluate(() => document.body.innerText);
        if (pageText.toUpperCase().includes('CHATEA CON NOSOTROS')) {
            console.log('✅ Texto "CHATEA CON NOSOTROS" encontrado en la página');

            // Encontrar el elemento exacto que contiene este texto
            const chatElements = await page.locator('text=CHATEA CON NOSOTROS').all();
            console.log(`🔘 Encontrados ${chatElements.length} elementos con "CHATEA CON NOSOTROS"`);

            for (let i = 0; i < chatElements.length; i++) {
                const element = chatElements[i];
                const tagName = await element.evaluate(el => el.tagName);
                const parent = await element.evaluateHandle(el => el.parentElement);
                const parentTag = await parent.evaluate(el => el?.tagName || '');
                const parentClass = await parent.evaluate(el => el?.className || '');

                console.log(`   Elemento ${i + 1}: <${tagName}> dentro de <${parentTag}> class="${parentClass}"`);
            }
        } else {
            console.log('❌ Texto "CHATEA CON NOSOTROS" no encontrado');
        }

        // Hacer screenshot del botón de WhatsApp flotante si existe
        const whatsappFloat = await page.locator('.whatsapp-float, [class*="whatsapp"]').first();
        if (await whatsappFloat.isVisible()) {
            const box = await whatsappFloat.boundingBox();
            if (box) {
                await page.screenshot({
                    path: 'whatsapp-button-detail.png',
                    clip: {
                        x: Math.max(0, box.x - 50),
                        y: Math.max(0, box.y - 50),
                        width: box.width + 100,
                        height: box.height + 100
                    }
                });
                console.log('📸 Screenshot del botón WhatsApp guardado');
            }
        }

        // Screenshot completo para referencia
        await page.screenshot({ path: 'whatsapp-full-page.png', fullPage: true });

        console.log('\n✅ Análisis de WhatsApp completado');

    } catch (error) {
        console.error('❌ Error durante el análisis:', error);
    } finally {
        await browser.close();
    }
})();