const { chromium } = require('playwright');

(async () => {
    console.log('🔍 Probando búsqueda DAILY...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:8000');
        await page.waitForTimeout(3000);

        console.log('🔍 Buscando: "DAILY"');
        await page.fill('#searchInput', 'DAILY');
        await page.waitForTimeout(1500);

        const results = await page.locator('.pdf-card').all();
        console.log(`📊 Resultados: ${results.length}`);

        if (results.length > 0) {
            console.log('📋 Documentos encontrados:');
            for (let i = 0; i < results.length; i++) {
                const title = await results[i].locator('.pdf-title').textContent();
                const category = await results[i].locator('.meta-item span').first().textContent();
                console.log(`   ${i + 1}. "${title.trim()}" (${category.trim()})`);
            }
        } else {
            console.log('   ❌ No se encontraron resultados');
        }

        // También probar búsqueda en blanco para ver el total
        console.log('\n📊 Total de documentos en el sistema:');
        await page.fill('#searchInput', '');
        await page.waitForTimeout(1000);

        const totalDocs = await page.locator('.pdf-card').all();
        console.log(`📄 Total: ${totalDocs.length}`);

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        await browser.close();
    }
})();