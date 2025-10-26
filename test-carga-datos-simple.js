const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Probando carga de datos del índice PDF...');

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
        await page.waitForTimeout(3000);

        // Verificar en la consola cuántos PDFs se cargaron
        const consoleLogs = [];
        page.on('console', msg => {
            const text = msg.text();
            consoleLogs.push(text);
            if (text.includes('PDFs') || text.includes('Cargados')) {
                console.log(`📊 Consola: ${text}`);
            }
        });

        // Verificar el contador total de documentos
        const totalDocs = await page.textContent('#totalDocs');
        console.log(`📈 Total docs en UI: ${totalDocs}`);

        // Verificar si hay algún error en la carga
        await page.waitForTimeout(2000);

        // Buscar manualmente los archivos OMEGA en el índice
        const omegaResults = await page.evaluate(() => {
            return new Promise((resolve) => {
                // Intentar cargar el índice manualmente
                fetch('data/pdf-index.json')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.pdfs) {
                            const omegas = data.pdfs.filter(pdf =>
                                pdf.title.toLowerCase().includes('omega') ||
                                pdf.title.toLowerCase().includes('omegold') ||
                                pdf.title.toLowerCase().includes('epa')
                            );
                            resolve({
                                total: data.pdfs.length,
                                omegas: omegas,
                                omegaTitles: omegas.map(o => o.title)
                            });
                        } else {
                            resolve({ error: 'Datos inválidos' });
                        }
                    })
                    .catch(error => {
                        resolve({ error: error.message });
                    });
            });
        });

        console.log('📋 Resultados de búsqueda manual:');
        console.log(JSON.stringify(omegaResults, null, 2));

        // Tomar captura final
        await page.screenshot({
            path: 'test-results/verificacion-carga-datos.png'
        });

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        await browser.close();
    }
})();