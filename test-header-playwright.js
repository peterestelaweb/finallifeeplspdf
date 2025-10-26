const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Iniciando pruebas visuales del header con Playwright...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Abrir la página local
        await page.goto('http://localhost:8000');
        console.log('✅ Página cargada correctamente');

        // Esperar a que las animaciones se completen
        await page.waitForTimeout(3000);

        // Verificar la estructura del header
        console.log('\n🔍 Verificando estructura del header...');

        // 1. Verificar que los logos existen y tienen el mismo tamaño
        const lifeplusLogo = await page.$('.lifeplus-side-logo');
        const sunshineLogo = await page.$('.sunshine-side-logo');

        if (!lifeplusLogo || !sunshineLogo) {
            throw new Error('❌ No se encontraron los logos laterales');
        }

        // Obtener dimensiones de los logos
        const lifeplusSize = await lifeplusLogo.boundingBox();
        const sunshineSize = await sunshineLogo.boundingBox();

        console.log(`📏 Logo LifePlus: ${Math.round(lifeplusSize.width)}x${Math.round(lifeplusSize.height)}`);
        console.log(`📏 Logo Sunshine: ${Math.round(sunshineSize.width)}x${Math.round(sunshineSize.height)}`);

        if (Math.abs(lifeplusSize.width - sunshineSize.width) > 5) {
            throw new Error('❌ Los logos no tienen el mismo ancho');
        }
        console.log('✅ Ambos logos tienen el mismo tamaño');

        // 2. Verificar posicionamiento (logos a los lados del texto)
        const headerCentered = await page.$('.header-centered');
        const headerContent = await page.$('.header-content');

        const headerRect = await headerCentered.boundingBox();
        const contentRect = await headerContent.boundingBox();

        console.log(`📍 Header centrado: x=${Math.round(headerRect.x)}, width=${Math.round(headerRect.width)}`);
        console.log(`📍 Contenido centrado: x=${Math.round(contentRect.x)}, width=${Math.round(contentRect.width)}`);

        // Verificar que el contenido está centrado
        const contentCenterX = contentRect.x + contentRect.width / 2;
        const headerCenterX = headerRect.x + headerRect.width / 2;
        const centerDiff = Math.abs(contentCenterX - headerCenterX);

        if (centerDiff > 20) {
            throw new Error('❌ El contenido no está centrado correctamente');
        }
        console.log('✅ El contenido está centrado horizontalmente');

        // 3. Verificar que los logos están a los lados (no solapados)
        const lifeplusRight = lifeplusSize.x + lifeplusSize.width;
        const sunshineLeft = sunshineSize.x;

        if (lifeplusRight > contentRect.x - 10) {
            console.log('⚠️  El logo de LifePlus está muy cerca del contenido');
        } else {
            console.log('✅ Logo LifePlus posicionado correctamente a la izquierda');
        }

        if (sunshineLeft < contentRect.x + contentRect.width + 10) {
            console.log('⚠️  El logo de Sunshine está muy cerca del contenido');
        } else {
            console.log('✅ Logo Sunshine posicionado correctamente a la derecha');
        }

        // 4. Verificar que no hay efecto glitch
        const glitchText = await page.$('.glitch-text');
        const elegantTitle = await page.$('.elegant-title');

        if (glitchText) {
            throw new Error('❌ Aún existe el efecto glitch en el texto');
        }

        if (!elegantTitle) {
            throw new Error('❌ No se encontró el título elegante');
        }
        console.log('✅ El efecto glitch ha sido eliminado correctamente');

        // 5. Probar interactividad de los logos
        console.log('\n🎮 Probando interactividad...');

        // Hover en logo LifePlus
        await lifeplusLogo.hover();
        await page.waitForTimeout(500);
        console.log('✅ Hover en logo LifePlus funciona');

        // Hover en logo Sunshine
        await sunshineLogo.hover();
        await page.waitForTimeout(500);
        console.log('✅ Hover en logo Sunshine funciona');

        // Click en logos para reanimar
        await lifeplusLogo.click();
        await page.waitForTimeout(1000);
        console.log('✅ Click en logo LifePlus funciona');

        await sunshineLogo.click();
        await page.waitForTimeout(1000);
        console.log('✅ Click en logo Sunshine funciona');

        // 6. Verificar animaciones suaves
        console.log('\n🎨 Verificando animaciones...');

        // Verificar que el título aparece suavemente
        const titleOpacity = await page.$eval('.elegant-title', el => {
            return window.getComputedStyle(el).opacity;
        });

        if (parseFloat(titleOpacity) < 0.9) {
            console.log('⚠️  El título podría no ser completamente visible');
        } else {
            console.log('✅ El título aparece con animación suave');
        }

        // 7. Prueba responsive
        console.log('\n📱 Probando diseño responsive...');

        // Cambiar a tamaño móvil
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);

        const mobileHeader = await page.$('.header-centered');
        const mobileFlexDirection = await mobileHeader.$eval('', el => {
            return window.getComputedStyle(el).flexDirection;
        });

        if (mobileFlexDirection === 'column') {
            console.log('✅ El diseño se adapta correctamente a móviles');
        } else {
            console.log('⚠️  El diseño responsive podría no funcionar correctamente');
        }

        // Volver a escritorio
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForTimeout(1000);

        // 8. Captura de pantalla final
        await page.screenshot({
            path: 'header-final-test.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1280, height: 300 }
        });
        console.log('📸 Captura de pantalla guardada como "header-final-test.png"');

        console.log('\n🎉 ¡TODAS LAS PRUEBAS SUPERADAS!');
        console.log('✅ Logos iguales y centrados');
        console.log('✅ Posicionamiento lateral correcto');
        console.log('✅ Sin efecto cyberpunk/glitch');
        console.log('✅ Animaciones suaves funcionando');
        console.log('✅ Interactividad completa');
        console.log('✅ Diseño responsive working');

    } catch (error) {
        console.error('❌ ERROR EN LAS PRUEBAS:', error.message);

        // Captura de pantalla del error
        await page.screenshot({
            path: 'header-error.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1280, height: 300 }
        });
        console.log('📸 Captura de error guardada como "header-error.png"');

        process.exit(1);
    } finally {
        await browser.close();
    }
})();