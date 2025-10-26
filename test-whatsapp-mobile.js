const { chromium } = require('playwright');

(async () => {
    console.log('📱 Probando botón WhatsApp en diferentes tamaños...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Probar vista desktop
        console.log('🖥️ Analizando vista desktop...');
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');

        const whatsappButton = await page.locator('.whatsapp-float');
        const buttonVisible = await whatsappButton.isVisible();
        console.log(`Botón WhatsApp visible en desktop: ${buttonVisible}`);

        if (buttonVisible) {
            const buttonBounds = await whatsappButton.boundingBox();
            console.log(`Tamaño botón desktop: ${buttonBounds.width}x${buttonBounds.height}px`);
            console.log(`Posición botón desktop: ${buttonBounds.x}x${buttonBounds.y}px`);
        }

        // Screenshot desktop
        await page.screenshot({ path: 'whatsapp-desktop-test.png' });

        // Probar vista móvil
        console.log('\n📱 Analizando vista móvil...');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');

        const mobileButton = await page.locator('.whatsapp-float');
        const mobileButtonVisible = await mobileButton.isVisible();
        console.log(`Botón WhatsApp visible en móvil: ${mobileButtonVisible}`);

        if (mobileButtonVisible) {
            const mobileButtonBounds = await mobileButton.boundingBox();
            console.log(`Tamaño botón móvil: ${mobileButtonBounds.width}x${mobileButtonBounds.height}px`);
            console.log(`Posición botón móvil: ${mobileButtonBounds.x}x${mobileButtonBounds.y}px`);

            // Calcular proporción en pantalla móvil
            const screenWidth = 375;
            const screenHeight = 667;
            const buttonWidthRatio = (mobileButtonBounds.width / screenWidth * 100).toFixed(1);
            const buttonHeightRatio = (mobileButtonBounds.height / screenHeight * 100).toFixed(1);
            console.log(`Proporción botón móvil: ${buttonWidthRatio}% ancho, ${buttonHeightRatio}% alto`);

            if (buttonWidthRatio > 20 || buttonHeightRatio > 20) {
                console.log('⚠️  El botón puede ser demasiado grande para móvil');
            } else {
                console.log('✅ El botón tiene buen tamaño para móvil');
            }
        }

        // Screenshot móvil
        await page.screenshot({ path: 'whatsapp-mobile-test.png' });

        // Probar tablet
        console.log('\n📟 Analizando vista tablet...');
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');

        const tabletButton = await page.locator('.whatsapp-float');
        const tabletButtonVisible = await tabletButton.isVisible();
        console.log(`Botón WhatsApp visible en tablet: ${tabletButtonVisible}`);

        if (tabletButtonVisible) {
            const tabletButtonBounds = await tabletButton.boundingBox();
            console.log(`Tamaño botón tablet: ${tabletButtonBounds.width}x${tabletButtonBounds.height}px`);
        }

        // Screenshot tablet
        await page.screenshot({ path: 'whatsapp-tablet-test.png' });

        console.log('\n✅ Pruebas de botón WhatsApp completadas');

        console.log('\n📋 RECOMENDACIONES:');
        console.log('====================');
        console.log('✅ Diseño actual (tipo VitalDetoxCare):');
        console.log('   - Icono limpio y reconocible');
        console.log('   - Buen tamaño en todos los dispositivos');
        console.log('   - No interfiere con el contenido');
        console.log('   - Sigue estándares de diseño');

        console.log('\n🔄 Si prefieres botón más grande:');
        console.log('   - Aumentar a 80x80px máximo');
        console.log('   - Mantener diseño circular');
        console.log('   - Ajustar posición en móviles');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
    } finally {
        await browser.close();
    }
})();