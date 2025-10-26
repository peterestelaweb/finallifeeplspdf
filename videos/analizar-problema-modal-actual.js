const { chromium } = require('playwright');

(async () => {
    console.log('🔍 ANALIZANDO ESTADO ACTUAL DEL MODAL LEGAL');
    console.log('============================================');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Navegar a la página local
    await page.goto('file:///Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi%20unidad/CURSO%20VERA%20BADIAS/PROYECTOS./PROYECTO%20B-MAD%20(%20MULTIPLES%20AGENTES%20)/BMAD-METHOD-main/VERSION-ESTATICA/index.html');

    console.log('📄 Página cargada, analizando modal legal...');

    // Esperar a que la página esté completamente cargada
    await page.waitForLoadState('networkidle');

    // Capturar pantalla inicial
    await page.screenshot({
        path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/test-results/01-pagina-inicial.png',
        fullPage: true
    });

    // 1. Verificar si el modal existe en el DOM
    const modalExists = await page.$('#legalModal');
    console.log(`🔍 Modal legal existe en DOM: ${modalExists ? 'SÍ' : 'NO'}`);

    // 2. Verificar si el enlace del disclaimer existe
    const disclaimerExists = await page.$('#disclaimerLink');
    console.log(`🔍 Enlace disclaimer existe: ${disclaimerExists ? 'SÍ' : 'NO'}`);

    // 3. Revisar la consola para errores
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ Error en consola: ${msg.text()}`);
        } else if (msg.text().includes('modal') || msg.text().includes('legal')) {
            console.log(`📝 Log: ${msg.text()}`);
        }
    });

    // 4. Intentar encontrar el enlace del disclaimer y hacer clic
    try {
        if (disclaimerExists) {
            console.log('🖱️ Intentando hacer clic en el enlace del disclaimer...');

            // Verificar si el enlace es visible
            const isVisible = await page.isVisible('#disclaimerLink');
            console.log(`👁️ Enlace disclaimer visible: ${isVisible}`);

            // Hacer scroll hasta el footer
            await page.evaluate(() => {
                document.querySelector('.footer').scrollIntoView({ behavior: 'smooth' });
            });

            await page.waitForTimeout(2000);

            // Capturar pantalla del footer
            await page.screenshot({
                path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/test-results/02-footer-disclaimer.png'
            });

            // Intentar hacer clic en el enlace
            await page.click('#disclaimerLink');
            console.log('✅ Clic realizado en el enlace del disclaimer');

            // Esperar a que el modal aparezca
            await page.waitForTimeout(1000);

            // Verificar si el modal es visible
            const modalVisible = await page.isVisible('#legalModal');
            console.log(`👁️ Modal visible después del clic: ${modalVisible}`);

            // Capturar pantalla del modal
            await page.screenshot({
                path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/test-results/03-modal-visible.png'
            });

            // Probar cerrar el modal
            if (modalVisible) {
                console.log('🖱️ Intentando cerrar el modal...');
                await page.click('#closeLegalModal');
                await page.waitForTimeout(1000);

                const modalHidden = await page.isHidden('#legalModal');
                console.log(`👁️ Modal ocultado: ${modalHidden}`);

                // Capturar pantalla después de cerrar
                await page.screenshot({
                    path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/test-results/04-modal-cerrado.png'
                });
            }
        }
    } catch (error) {
        console.log(`❌ Error al interactuar con el modal: ${error.message}`);

        // Capturar pantalla del error
        await page.screenshot({
            path: '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/videos/test-results/05-error-modal.png'
        });
    }

    // 5. Analizar el problema de visibilidad
    console.log('\n🔍 ANALIZANDO PROBLEMAS DE VISIBILIDAD');
    console.log('=========================================');

    // Verificar qué tan visible es el disclaimer
    const disclaimerPosition = await page.evaluate(() => {
        const element = document.querySelector('#disclaimerLink');
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            visible: rect.top >= 0 && rect.bottom <= window.innerHeight
        };
    });

    console.log(`📍 Posición del disclaimer:`, disclaimerPosition);

    // 6. Evaluar el tamaño y estilo del modal
    const modalStyles = await page.evaluate(() => {
        const modal = document.querySelector('#legalModal');
        if (!modal) return null;

        const computedStyle = window.getComputedStyle(modal);
        return {
            display: computedStyle.display,
            zIndex: computedStyle.zIndex,
            backgroundColor: computedStyle.backgroundColor,
            opacity: computedStyle.opacity
        };
    });

    console.log(`🎨 Estilos del modal:`, modalStyles);

    // 7. Verificar si hay algún otro elemento de aviso legal
    const legalElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="legal"], [id*="legal"], [href*="legal"]');
        return Array.from(elements).map(el => ({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            text: el.textContent?.substring(0, 100)
        }));
    });

    console.log(`⚖️ Elementos legales encontrados:`, legalElements);

    await page.waitForTimeout(3000);

    console.log('\n📊 ANÁLISIS COMPLETADO');
    console.log('========================');

    await browser.close();

    // 8. Generar informe del problema
    console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');
    console.log('============================');
    console.log('1. El disclaimer actual está en el footer - MUY POCO VISIBLE');
    console.log('2. Los usuarios tienen que scrollear hasta el final para verlo');
    console.log('3. No es obligatorio verlo antes de usar el buscador');
    console.log('4. El texto no es suficientemente contundente');
    console.log('5. No hay ningún aviso visible en la parte superior de la página');

    console.log('\n💡 SOLUCIÓN PROPUESTA:');
    console.log('=====================');
    console.log('1. Banner prominente en la parte superior de la página');
    console.log('2. Texto claro y directo: "TODO EL MATERIAL ESTÁ DESTINADO AL MERCADO AMERICANO"');
    console.log('3. Aviso obligatorio antes de permitir el uso del buscador');
    console.log('4. Colores llamativos que sean imposibles de ignorar');
    console.log('5. Requerir aceptación explícita antes de continuar');

})();