const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Probando búsqueda de OMEGA con índice actualizado...');

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
        await page.waitForTimeout(2000);

        // Probar diferentes búsquedas de OMEGA
        const busquedas = ['omega3', 'omega', 'omegold', 'epa'];

        for (const termino of busquedas) {
            console.log(`\n🔍 Probando búsqueda: "${termino}"`);

            // Limpiar búsqueda anterior
            await page.click('#clearSearch');
            await page.waitForTimeout(500);

            // Realizar búsqueda
            await page.fill('#searchInput', termino);
            await page.waitForTimeout(2000);

            // Tomar captura
            await page.screenshot({
                path: `test-results/prueba-omega-${termino}-actualizado.png`
            });

            // Verificar resultados
            const resultCount = await page.textContent('#resultCount');
            console.log(`Resultados encontrados: ${resultCount}`);

            // Verificar si hay resultados visibles
            const resultsVisible = await page.isVisible('.results-grid .result-item');
            console.log(`Resultados visibles: ${resultsVisible}`);

            if (resultsVisible) {
                // Obtener títulos de los resultados
                const titles = await page.locator('.result-title').allTextContents();
                console.log(`Títulos encontrados: ${titles.join(', ')}`);
            }
        }

        console.log('\n✅ Pruebas de búsqueda OMEGA completadas');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        await browser.close();
    }
})();