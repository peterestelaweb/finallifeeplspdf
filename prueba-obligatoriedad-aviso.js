const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Probando si el aviso legal es realmente obligatorio...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    try {
        // Navegar a la página
        await page.goto('file:///Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/index.html');

        console.log('✅ Página cargada');

        // Esperar a que se cargue completamente
        await page.waitForLoadState('networkidle');

        // Verificar si el modal aparece automáticamente al cargar
        console.log('\n🔍 Verificando si el modal aparece automáticamente...');

        const modalVisible = await page.isVisible('#legalModal');
        console.log(`Modal visible al cargar: ${modalVisible}`);

        if (modalVisible) {
            console.log('⚠️  El modal SÍ aparece automáticamente - ES OBLIGATORIO');
            await page.screenshot({
                path: 'test-results/modal-obligatorio-abierto.png'
            });
        } else {
            console.log('✅ El modal NO aparece automáticamente - NO ES OBLIGATORIO');
            await page.screenshot({
                path: 'test-results/modal-no-obligatorio.png'
            });
        }

        // Probar si se puede usar el buscador sin aceptar el aviso
        console.log('\n🔎 Probando usar el buscador sin aceptar aviso...');

        // Intentar buscar sin haber abierto el modal
        await page.fill('#searchInput', 'omega3');
        await page.waitForTimeout(2000);

        // Verificar si la búsqueda funciona
        const searchInput = await page.inputValue('#searchInput');
        console.log(`Búsqueda sin aceptar aviso: "${searchInput}"`);

        await page.screenshot({
            path: 'test-results/busqueda-sin-aceptar-aviso.png'
        });

        // Verificar si hay algún tipo de bloqueo o mensaje
        const blockedMessage = await page.locator('text="Debe aceptar el aviso legal"').count();
        console.log(`Mensajes de bloqueo encontrados: ${blockedMessage}`);

        // Probar hacer clic en otros elementos
        console.log('\n🖱️  Probando interacción con otros elementos...');

        // Intentar abrir el modal manualmente
        await page.click('#disclaimerLink');
        await page.waitForTimeout(2000);

        const modalAfterClick = await page.isVisible('#legalModal');
        console.log(`Modal visible después de clic: ${modalAfterClick}`);

        await page.screenshot({
            path: 'test-results/modal-manual-abierto.png'
        });

        // Cerrar el modal
        await page.click('#closeLegalModal');
        await page.waitForTimeout(1000);

        // Intentar usar el buscador después de cerrar el modal
        await page.fill('#searchInput', 'vitamin');
        await page.waitForTimeout(1000);

        const searchAfterModal = await page.inputValue('#searchInput');
        console.log(`Búsqueda después de cerrar modal: "${searchAfterModal}"`);

        await page.screenshot({
            path: 'test-results/busqueda-despues-modal.png'
        });

        console.log('\n📊 RESULTADO FINAL:');

        if (!modalVisible && blockedMessage === 0) {
            console.log('❌ EL AVISO NO ES OBLIGATORIO');
            console.log('✅ Se puede usar el buscador sin aceptar el aviso');
            console.log('✅ No hay bloqueo de funcionalidades');
        } else {
            console.log('✅ EL AVISO ES OBLIGATORIO');
            console.log('⚠️  El modal bloquea el uso hasta aceptación');
        }

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        await browser.close();
    }
})();