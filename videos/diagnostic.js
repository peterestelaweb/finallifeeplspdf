const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
    console.log(`ERROR STACK: ${error.stack}`);
  });

  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });

  try {
    console.log('=== INICIANDO ANÁLISIS DE LA WEB ===');
    console.log('URL: https://lifepluspdf.peterestela.com/');

    // Navegar a la página
    await page.goto('https://lifepluspdf.peterestela.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('\n=== 1. VERIFICANDO CARGA DE PÁGINA ===');
    const title = await page.title();
    console.log('Título de la página:', title);

    // Verificar si la página cargó correctamente
    const bodyContent = await page.textContent('body');
    console.log('Contenido body encontrado:', bodyContent ? 'SÍ' : 'NO');

    console.log('\n=== 2. BUSCANDO VIDEOS ===');
    // Buscar todos los elementos de video
    const videos = await page.$$('video');
    console.log(`Número de elementos <video> encontrados: ${videos.length}`);

    if (videos.length > 0) {
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const videoSrc = await video.getAttribute('src');
        const videoId = await video.getAttribute('id');
        const videoWidth = await video.getAttribute('width');
        const videoHeight = await video.getAttribute('height');

        console.log(`\nVideo ${i + 1}:`);
        console.log(`  ID: ${videoId || 'No tiene ID'}`);
        console.log(`  Src: ${videoSrc || 'No tiene src'}`);
        console.log(`  Width: ${videoWidth || 'No especificado'}`);
        console.log(`  Height: ${videoHeight || 'No especificado'}`);

        // Verificar si el video está listo para reproducir
        const readyState = await video.evaluate(v => v.readyState);
        console.log(`  ReadyState: ${readyState} (0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA)`);

        // Verificar dimensiones del contenedor
        const boundingBox = await video.boundingBox();
        if (boundingBox) {
          console.log(`  Dimensiones en pantalla: ${boundingBox.width}x${boundingBox.height}`);
          console.log(`  Posición: x=${boundingBox.x}, y=${boundingBox.y}`);
        }
      }
    } else {
      console.log('No se encontraron elementos <video>');

      // Buscar elementos iframe que podrían contener videos
      const iframes = await page.$$('iframe');
      console.log(`Número de iframes encontrados: ${iframes.length}`);

      for (let i = 0; i < iframes.length; i++) {
        const iframe = iframes[i];
        const iframeSrc = await iframe.getAttribute('src');
        console.log(`Iframe ${i + 1}: ${iframeSrc}`);
      }
    }

    console.log('\n=== 3. ANALIZANDO LAYOUT Y POSICIONAMIENTO ===');
    // Buscar contenedores de videos
    const videoContainers = await page.$$('[class*="video"], [id*="video"], .container, .video-container');
    console.log(`Contenedores de video encontrados: ${videoContainers.length}`);

    for (let i = 0; i < videoContainers.length; i++) {
      const container = videoContainers[i];
      const className = await container.getAttribute('class');
      const id = await container.getAttribute('id');
      const styles = await container.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          position: computed.position,
          flexDirection: computed.flexDirection,
          justifyContent: computed.justifyContent,
          alignItems: computed.alignItems,
          width: computed.width,
          height: computed.height,
          margin: computed.margin,
          padding: computed.padding,
          float: computed.float
        };
      });

      console.log(`\nContenedor ${i + 1}:`);
      console.log(`  Clase: ${className}`);
      console.log(`  ID: ${id}`);
      console.log(`  Estilos:`, styles);

      const boundingBox = await container.boundingBox();
      if (boundingBox) {
        console.log(`  Dimensiones: ${boundingBox.width}x${boundingBox.height}`);
        console.log(`  Posición: x=${boundingBox.x}, y=${boundingBox.y}`);
      }
    }

    console.log('\n=== 4. VERIFICANDO CARGA DE ARCHIVOS ===');
    // Monitorear solicitudes de red
    const resources = await page.evaluate(() => {
      const resources = [];
      performance.getEntriesByType('resource').forEach(entry => {
        if (entry.initiatorType === 'video' || entry.name.includes('.mp4') || entry.name.includes('.webm')) {
          resources.push({
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize
          });
        }
      });
      return resources;
    });

    console.log('Recursos de video cargados:', resources);

    console.log('\n=== 5. ANALIZANDO RESPONSIVE DESIGN ===');
    // Probar diferentes tamaños de pantalla
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      console.log(`\n--- Probando viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ---`);

      // Esperar a que se ajuste el layout
      await page.waitForTimeout(1000);

      // Verificar el layout de videos en este viewport
      const videosInViewport = await page.$$('video');
      for (let i = 0; i < videosInViewport.length; i++) {
        const video = videosInViewport[i];
        const boundingBox = await video.boundingBox();
        if (boundingBox) {
          console.log(`  Video ${i + 1}: ${boundingBox.width}x${boundingBox.height} en (${boundingBox.x}, ${boundingBox.y})`);
        }
      }
    }

    console.log('\n=== 6. VERIFICANDO ERRORES DE CONSOLE ===');
    // Los errores ya se están capturando en los event listeners arriba

    console.log('\n=== 7. ANÁLISIS DE HTML Y CSS ===');
    // Obtener el HTML completo de la página
    const htmlContent = await page.content();

    // Buscar patrones específicos en el HTML
    const hasVideo1 = htmlContent.includes('video1.mp4') || htmlContent.includes('video1');
    const hasVideo2 = htmlContent.includes('video2.mp4') || htmlContent.includes('video2');
    const hasFlexbox = htmlContent.includes('display: flex') || htmlContent.includes('flex-direction');
    const hasGrid = htmlContent.includes('display: grid');

    console.log(`¿Video 1 mencionado en HTML?: ${hasVideo1}`);
    console.log(`¿Video 2 mencionado en HTML?: ${hasVideo2}`);
    console.log(`¿Usa Flexbox?: ${hasFlexbox}`);
    console.log(`¿Usa Grid?: ${hasGrid}`);

    // Buscar estilos inline
    const inlineStyles = await page.$$eval('[style]', elements => {
      return elements.map(el => ({
        tagName: el.tagName,
        style: el.getAttribute('style')
      }));
    });

    console.log(`\nEstilos inline encontrados: ${inlineStyles.length}`);
    inlineStyles.forEach((style, index) => {
      console.log(`  ${index + 1}. <${style.tagName}> style="${style.style}"`);
    });

    console.log('\n=== 8. CAPTURA DE PANTALLA ===');
    await page.screenshot({ path: 'diagnostic-screenshot.png', fullPage: true });
    console.log('Captura de pantalla guardada como: diagnostic-screenshot.png');

    console.log('\n=== ANÁLISIS COMPLETADO ===');

  } catch (error) {
    console.error('ERROR DURANTE EL ANÁLISIS:', error);
    console.error('STACK:', error.stack);
  } finally {
    await browser.close();
  }
})();