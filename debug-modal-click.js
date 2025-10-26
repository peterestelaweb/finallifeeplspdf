const { chromium } = require('playwright');

async function debugModalClick() {
    console.log('🐛 Debug del clic fuera del modal...');

    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });

    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 }
    });

    const page = await context.newPage();

    try {
        // Acceder a la página
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });

        // Hacer scroll y abrir modal
        await page.evaluate(() => {
            document.querySelector('.footer').scrollIntoView({ behavior: 'smooth' });
        });

        await page.waitForSelector('#disclaimerLink', { state: 'visible' });
        await page.click('#disclaimerLink');
        await page.waitForSelector('#legalModal', { state: 'visible' });

        // Esperar un momento
        await page.waitForTimeout(1000);

        // Tomar screenshot antes del clic
        await page.screenshot({ path: '/tmp/before-click-outside.png' });

        // Debug: obtener información del modal
        const modalInfo = await page.evaluate(() => {
            const modal = document.getElementById('legalModal');
            const rect = modal.getBoundingClientRect();
            return {
                display: modal.style.display,
                opacity: modal.style.opacity,
                bounds: {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                }
            };
        });

        console.log('Modal info:', modalInfo);

        // Intentar hacer clic en diferentes posiciones fuera del modal
        const clickPositions = [
            { x: modalInfo.bounds.x - 50, y: modalInfo.bounds.y - 50 },
            { x: modalInfo.bounds.x + modalInfo.bounds.width + 50, y: modalInfo.bounds.y },
            { x: modalInfo.bounds.x, y: modalInfo.bounds.y - 50 }
        ];

        for (let i = 0; i < clickPositions.length; i++) {
            const pos = clickPositions[i];
            console.log(`Intentando clic en posición ${i + 1}: (${pos.x}, ${pos.y})`);

            await page.mouse.click(pos.x, pos.y);
            await page.waitForTimeout(500);

            const state = await page.evaluate(() => {
                const modal = document.getElementById('legalModal');
                return {
                    display: modal.style.display,
                    opacity: modal.style.opacity
                };
            });

            console.log(`Estado después del clic ${i + 1}:`, state);

            if (state.display === 'none' || state.opacity === '0') {
                console.log(`✅ Modal cerrado con clic en posición ${i + 1}`);
                await page.screenshot({ path: `/tmp/modal-closed-position-${i + 1}.png` });
                break;
            } else {
                console.log(`❌ Modal no cerró con clic en posición ${i + 1}`);

                // Reabrir modal para siguiente intento
                if (i < clickPositions.length - 1) {
                    await page.click('#disclaimerLink');
                    await page.waitForSelector('#legalModal', { state: 'visible' });
                    await page.waitForTimeout(1000);
                }
            }
        }

        // Probar también con evento de clic directamente
        console.log('Intentando cerrar con evento de clic en el modal...');
        await page.evaluate(() => {
            const modal = document.getElementById('legalModal');
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            modal.dispatchEvent(event);
        });

        await page.waitForTimeout(500);

        const finalState = await page.evaluate(() => {
            const modal = document.getElementById('legalModal');
            return {
                display: modal.style.display,
                opacity: modal.style.opacity
            };
        });

        console.log('Estado final después de evento:', finalState);

    } catch (error) {
        console.error('Error durante debug:', error);
        await page.screenshot({ path: '/tmp/debug-error.png' });
    } finally {
        await browser.close();
    }
}

debugModalClick().catch(console.error);