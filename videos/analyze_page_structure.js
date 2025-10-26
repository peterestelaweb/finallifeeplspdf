const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navegando a la página...');
    await page.goto('https://lifepluspdf.peterestela.com/');

    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');

    console.log('Analizando estructura actual...');

    // Tomar captura de pantalla de la página completa
    await page.screenshot({
      path: 'page_screenshot.png',
      fullPage: true
    });
    console.log('Captura de pantalla guardada como page_screenshot.png');

    // Identificar elementos principales
    const elements = await page.evaluate(() => {
      const getSelectorInfo = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return { exists: false };

        const rect = element.getBoundingClientRect();
        return {
          exists: true,
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          textContent: element.textContent?.trim().substring(0, 100),
          position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          innerHTML: element.innerHTML.substring(0, 500)
        };
      };

      return {
        // Bloque de estadísticas
        statsBlock: getSelectorInfo('.stats-block, .stats-container, .document-stats, [class*="stats"]'),

        // Buscador de fichas
        searchBlock: getSelectorInfo('.search-container, .search-form, .file-search, [class*="search"], form'),

        // Header
        header: getSelectorInfo('header'),

        // Main content
        mainContent: getSelectorInfo('main'),

        // Contenedor principal
        mainContainer: getSelectorInfo('.container, .main-container, #content, .content')
      };
    });

    console.log('\n=== ANÁLISIS DE ESTRUCTURA ===');
    console.log(JSON.stringify(elements, null, 2));

    // Buscar específicamente el bloque de estadísticas
    console.log('\n=== BÚSQUEDA DETALLADA DE ELEMENTOS ===');
    const detailedSearch = await page.evaluate(() => {
      const findAllByText = (text) => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        const nodes = [];
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent.includes(text)) {
            const parent = node.parentElement;
            if (parent) {
              nodes.push({
                text: node.textContent.trim(),
                tagName: parent.tagName,
                className: parent.className,
                id: parent.id,
                path: getNodePath(parent)
              });
            }
          }
        }
        return nodes;
      };

      function getNodePath(element) {
        const path = [];
        while (element && element.nodeType === Node.ELEMENT_NODE) {
          let selector = element.tagName.toLowerCase();
          if (element.id) {
            selector += '#' + element.id;
          } else if (element.className) {
            selector += '.' + element.className.trim().replace(/\s+/g, '.');
          }
          path.unshift(selector);
          element = element.parentElement;
        }
        return path.join(' > ');
      }

      return {
        documentStats: findAllByText('DOCUMENTOS'),
        totalSize: findAllByText('TAMAÑO TOTAL'),
        lastUpdate: findAllByText('ULTIMA ACTUALIZACION'),
        searchElements: findAllByText('Buscar').filter(e => e.tagName === 'INPUT' || e.tagName === 'BUTTON')
      };
    });

    console.log(JSON.stringify(detailedSearch, null, 2));

    // Obtener el HTML completo de los contenedores principales
    console.log('\n=== HTML DE CONTENEDORES PRINCIPALES ===');
    const containersHTML = await page.evaluate(() => {
      const getContainerHTML = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.outerHTML : null;
      };

      return {
        header: getContainerHTML('header'),
        main: getContainerHTML('main'),
        body: document.body.innerHTML.substring(0, 2000)
      };
    });

    console.log(containersHTML);

    console.log('\nAnálisis completado. Revisa los resultados y la captura de pantalla.');

  } catch (error) {
    console.error('Error durante el análisis:', error);
  } finally {
    await browser.close();
  }
})();