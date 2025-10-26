const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navegando a la página para análisis detallado...');
    await page.goto('https://lifepluspdf.peterestela.com/');
    await page.waitForLoadState('networkidle');

    // Análisis detallado de la estructura
    const detailedAnalysis = await page.evaluate(() => {
      // Función para obtener información completa de elementos
      const getDetailedInfo = (element) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);

        return {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
          textContent: element.textContent?.trim().substring(0, 200),
          position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right
          },
          styles: {
            display: computedStyle.display,
            position: computedStyle.position,
            margin: computedStyle.margin,
            padding: computedStyle.padding,
            backgroundColor: computedStyle.backgroundColor,
            border: computedStyle.border
          },
          children: element.children.length,
          innerHTML: element.innerHTML.substring(0, 1000)
        };
      };

      // Encontrar elementos por texto contenido
      const findByText = (text) => {
        const elements = [];
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let node;
        while (node = walker.nextNode()) {
          if (node.textContent.includes(text) && node.textContent.trim() !== '') {
            const parent = node.parentElement;
            if (parent) {
              elements.push(getDetailedInfo(parent));
            }
          }
        }
        return elements;
      };

      // Encontrar el bloque de estadísticas
      const findStatsBlock = () => {
        // Buscar por clase stats-section
        let statsBlock = document.querySelector('.stats-section');
        if (!statsBlock) {
          // Buscar por contenido
          const docsElements = findByText('Documentos');
          if (docsElements.length > 0) {
            // Encontrar el contenedor padre que tiene múltiples estadísticas
            for (let el of docsElements) {
              let parent = el.parentElement;
              while (parent && parent !== document.body) {
                if (parent.textContent.includes('Tamaño Total') ||
                    parent.textContent.includes('ULTIMA ACTUALIZACION')) {
                  return getDetailedInfo(parent);
                }
                parent = parent.parentElement;
              }
            }
          }
        }
        return statsBlock ? getDetailedInfo(statsBlock) : null;
      };

      // Encontrar el bloque de búsqueda
      const findSearchBlock = () => {
        return getDetailedInfo(document.querySelector('.search-section')) ||
               getDetailedInfo(document.querySelector('.search-container'));
      };

      // Obtener estructura completa del body
      const bodyChildren = Array.from(document.body.children).map(child => ({
        tagName: child.tagName,
        className: child.className,
        id: child.id,
        children: child.children.length,
        innerHTML: child.innerHTML.substring(0, 500)
      }));

      return {
        statsBlock: findStatsBlock(),
        searchBlock: findSearchBlock(),
        bodyStructure: bodyChildren,
        documentElements: findByText('Documentos'),
        totalSizeElements: findByText('Tamaño Total'),
        lastUpdateElements: findByText('ULTIMA ACTUALIZACION'),
        searchInput: getDetailedInfo(document.querySelector('input[type="text"]')),
        fullBodyHTML: document.body.innerHTML.substring(0, 3000)
      };
    });

    console.log('\n=== ANÁLISIS DETALLADO DE LA PÁGINA ===');
    console.log(JSON.stringify(detailedAnalysis, null, 2));

    // Tomar captura de pantalla enfocada en las áreas clave
    await page.screenshot({
      path: 'detailed_screenshot.png',
      fullPage: true
    });

    console.log('\n=== POSICIONES ACTUALES ===');
    if (detailedAnalysis.statsBlock && detailedAnalysis.searchBlock) {
      console.log(`Bloque de estadísticas está en posición Y: ${detailedAnalysis.statsBlock.position.top}`);
      console.log(`Bloque de búsqueda está en posición Y: ${detailedAnalysis.searchBlock.position.top}`);

      if (detailedAnalysis.statsBlock.position.top > detailedAnalysis.searchBlock.position.top) {
        console.log('✅ El bloque de estadísticas está DEBAJO del bloque de búsqueda (necesita moverse)');
      } else {
        console.log('✅ El bloque de estadísticas está ARRIBA del bloque de búsqueda');
      }
    }

  } catch (error) {
    console.error('Error durante el análisis detallado:', error);
  } finally {
    await browser.close();
  }
})();