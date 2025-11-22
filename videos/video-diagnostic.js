const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar todos los eventos de consola
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  // Capturar errores de página
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
    console.log(`ERROR STACK: ${error.stack}`);
  });

  // Capturar solicitudes fallidas
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });

  // Capturar respuestas de red
  page.on('response', response => {
    const url = response.url();
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
      console.log(`VIDEO RESPONSE: ${url} - Status: ${response.status()}`);
      response.text().then(text => {
        console.log(`Response headers: ${JSON.stringify(response.headers(), null, 2)}`);
      }).catch(() => {});
    }
  });

  try {
    console.log('=== INICIANDO ANÁLISIS ESPECÍFICO DE VIDEOS ===');
    console.log('URL: https://lifepluspdf.peterestela.com/');

    // Navegar a la página
    await page.goto('https://lifepluspdf.peterestela.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Esperar a que los videos intenten cargar
    await page.waitForTimeout(5000);

    console.log('\n=== 1. BUSCANDO ELEMENTOS DE VIDEO ===');
    const videos = await page.$$('video');
    console.log(`Total de elementos <video> encontrados: ${videos.length}`);

    if (videos.length === 0) {
      console.log('No se encontraron elementos <video>. Buscando otros elementos...');

      // Buscar iframes
      const iframes = await page.$$('iframe');
      console.log(`Iframes encontrados: ${iframes.length}`);

      // Buscar elementos que podrían contener videos
      const videoContainers = await page.$$('[class*="video"], [id*="video"], .video-container, .video-wrapper');
      console.log(`Contenedores de video encontrados: ${videoContainers.length}`);

      return;
    }

    // Analizar cada video encontrado
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.log(`\n=== ANÁLISIS DE VIDEO ${i + 1} ===`);

      // Obtener atributos básicos
      const videoSrc = await video.getAttribute('src');
      const videoId = await video.getAttribute('id');
      const videoClass = await video.getAttribute('class');
      const poster = await video.getAttribute('poster');
      const controls = await video.getAttribute('controls');
      const autoplay = await video.getAttribute('autoplay');
      const muted = await video.getAttribute('muted');
      const loop = await video.getAttribute('loop');

      console.log(`ID: ${videoId || 'No tiene ID'}`);
      console.log(`Clase: ${videoClass || 'No tiene clase'}`);
      console.log(`Src: ${videoSrc || 'No tiene src'}`);
      console.log(`Poster: ${poster || 'No tiene poster'}`);
      console.log(`Controls: ${controls ? 'Sí' : 'No'}`);
      console.log(`Autoplay: ${autoplay ? 'Sí' : 'No'}`);
      console.log(`Muted: ${muted ? 'Sí' : 'No'}`);
      console.log(`Loop: ${loop ? 'Sí' : 'No'}`);

      // Estado del video
      const videoAnalysis = await video.evaluate(v => {
        const result = {
          readyState: v.readyState,
          readyStateText: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][v.readyState],
          networkState: v.networkState,
          networkStateText: ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'][v.networkState],
          error: v.error ? v.error.message : 'No hay error',
          errorCode: v.error ? v.error.code : 'No hay código de error',
          currentSrc: v.currentSrc,
          buffered: v.buffered.length,
          played: v.played.length,
          paused: v.paused,
          ended: v.ended,
          seeking: v.seeking,
          duration: v.duration,
          currentTime: v.currentTime,
          videoWidth: v.videoWidth,
          videoHeight: v.videoHeight,
          volume: v.volume,
          muted: v.muted
        };

        // Intentar obtener más información del error
        if (v.error) {
          result.errorDetails = {
            MEDIA_ERR_ABORTED: v.error.MEDIA_ERR_ABORTED,
            MEDIA_ERR_NETWORK: v.error.MEDIA_ERR_NETWORK,
            MEDIA_ERR_DECODE: v.error.MEDIA_ERR_DECODE,
            MEDIA_ERR_SRC_NOT_SUPPORTED: v.error.MEDIA_ERR_SRC_NOT_SUPPORTED
          };
        }

        return result;
      });

      console.log('Estado detallado del video:');
      console.log(`  ReadyState: ${videoAnalysis.readyState} (${videoAnalysis.readyStateText})`);
      console.log(`  NetworkState: ${videoAnalysis.networkState} (${videoAnalysis.networkStateText})`);
      console.log(`  Error: ${videoAnalysis.error}`);
      console.log(`  Error Code: ${videoAnalysis.errorCode}`);
      console.log(`  CurrentSrc: ${videoAnalysis.currentSrc}`);
      console.log(`  Buffered: ${videoAnalysis.buffered} rangos`);
      console.log(`  Played: ${videoAnalysis.played} rangos`);
      console.log(`  Paused: ${videoAnalysis.paused}`);
      console.log(`  Ended: ${videoAnalysis.ended}`);
      console.log(`  Seeking: ${videoAnalysis.seeking}`);
      console.log(`  Duration: ${videoAnalysis.duration}`);
      console.log(`  CurrentTime: ${videoAnalysis.currentTime}`);
      console.log(`  Video Dimensions: ${videoAnalysis.videoWidth}x${videoAnalysis.videoHeight}`);
      console.log(`  Volume: ${videoAnalysis.volume}`);
      console.log(`  Muted: ${videoAnalysis.muted}`);

      if (videoAnalysis.errorDetails) {
        console.log('Detalles del error:', videoAnalysis.errorDetails);
      }

      // Verificar si el video es visible
      const boundingBox = await video.boundingBox();
      if (boundingBox) {
        console.log(`  Visible en pantalla: ${boundingBox.width}x${boundingBox.height} en (${boundingBox.x}, ${boundingBox.y})`);
      } else {
        console.log('  No visible en pantalla (display: none o fuera del viewport)');
      }

      // Verificar estilos CSS
      const styles = await video.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          position: computed.position,
          zIndex: computed.zIndex,
          width: computed.width,
          height: computed.height,
          objectFit: computed.objectFit,
          backgroundColor: computed.backgroundColor,
          margin: computed.margin,
          padding: computed.padding,
          border: computed.border
        };
      });

      console.log('Estilos CSS:', styles);

      // Intentar reproducir el video
      console.log('\nIntentando reproducir el video...');
      try {
        await video.evaluate(v => {
          return v.play().then(() => {
            return 'Reproducción iniciada correctamente';
          }).catch(error => {
            return `Error al reproducir: ${error.message}`;
          });
        });

        await page.waitForTimeout(3000);

        const afterPlay = await video.evaluate(v => ({
          paused: v.paused,
          currentTime: v.currentTime,
          duration: v.duration,
          ended: v.ended,
          readyState: v.readyState,
          networkState: v.networkState
        }));

        console.log('Estado después de intentar reproducir:');
        console.log(`  Paused: ${afterPlay.paused}`);
        console.log(`  CurrentTime: ${afterPlay.currentTime}`);
        console.log(`  Duration: ${afterPlay.duration}`);
        console.log(`  Ended: ${afterPlay.ended}`);
        console.log(`  ReadyState: ${afterPlay.readyState}`);
        console.log(`  NetworkState: ${afterPlay.networkState}`);

      } catch (playError) {
        console.log(`Error al intentar reproducir: ${playError.message}`);
      }

      // Verificar si el archivo de video existe accediendo directamente
      if (videoSrc) {
        console.log(`\nVerificando acceso directo al archivo: ${videoSrc}`);
        try {
          const response = await page.request.get(videoSrc);
          console.log(`  Status: ${response.status()}`);
          console.log(`  Headers: ${JSON.stringify(response.headers(), null, 2)}`);

          if (response.status() === 200) {
            const contentLength = response.headers()['content-length'];
            const contentType = response.headers()['content-type'];
            console.log(`  Content-Length: ${contentLength}`);
            console.log(`  Content-Type: ${contentType}`);

            // Si es un video pequeño, intentar descargarlo para análisis
            if (contentLength && parseInt(contentLength) < 10000000) { // Menos de 10MB
              console.log('  El video es pequeño, intentando analizar contenido...');
              try {
                const buffer = await response.body();
                console.log(`  Tamaño del buffer: ${buffer.length} bytes`);

                // Verificar si es un archivo MP4 válido
                if (buffer.length > 8) {
                  const signature = buffer.subarray(4, 8).toString('ascii');
                  console.log(`  Firma del archivo: ${signature}`);
                  console.log(`  ¿Es MP4 válido?: ${signature === 'ftyp'}`);
                }
              } catch (bufferError) {
                console.log(`  Error al analizar buffer: ${bufferError.message}`);
              }
            }
          }
        } catch (fetchError) {
          console.log(`  Error al acceder al archivo: ${fetchError.message}`);
        }
      }
    }

    console.log('\n=== 2. ANÁLISIS COMPARATIVO ===');
    // Comparar configuraciones de ambos videos
    const comparison = await page.evaluate(() => {
      const videos = document.querySelectorAll('video');
      const results = [];

      videos.forEach((video, index) => {
        const computed = window.getComputedStyle(video);
        results.push({
          index: index + 1,
          src: video.src,
          currentSrc: video.currentSrc,
          readyState: video.readyState,
          networkState: video.networkState,
          error: video.error ? video.error.message : null,
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          width: computed.width,
          height: computed.height,
          position: computed.position,
          zIndex: computed.zIndex
        });
      });

      return results;
    });

    console.log('Comparación de videos:');
    comparison.forEach(vid => {
      console.log(`\nVideo ${vid.index}:`);
      console.log(`  Src: ${vid.src}`);
      console.log(`  CurrentSrc: ${vid.currentSrc}`);
      console.log(`  ReadyState: ${vid.readyState}`);
      console.log(`  NetworkState: ${vid.networkState}`);
      console.log(`  Error: ${vid.error}`);
      console.log(`  Display: ${vid.display}`);
      console.log(`  Visibility: ${vid.visibility}`);
      console.log(`  Opacity: ${vid.opacity}`);
      console.log(`  Dimensions: ${vid.width} x ${vid.height}`);
      console.log(`  Position: ${vid.position}`);
      console.log(`  Z-index: ${vid.zIndex}`);
    });

    console.log('\n=== 3. VERIFICACIÓN DE RED ===');
    // Verificar qué recursos de video se cargaron
    const resources = await page.evaluate(() => {
      const resources = [];
      performance.getEntriesByType('resource').forEach(entry => {
        if (entry.name.includes('.mp4') || entry.name.includes('.webm') || entry.name.includes('.ogg')) {
          resources.push({
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            startTime: entry.startTime,
            responseEnd: entry.responseEnd,
            responseStatus: entry.responseStatus
          });
        }
      });
      return resources;
    });

    console.log('Recursos de video cargados:');
    resources.forEach(resource => {
      console.log(`  ${resource.name}`);
      console.log(`    Status: ${resource.responseStatus}`);
      console.log(`    Size: ${resource.transferSize} bytes`);
      console.log(`    Duration: ${resource.duration}ms`);
      console.log(`    Load time: ${resource.responseEnd - resource.startTime}ms`);
    });

    console.log('\n=== 4. CAPTURAS DE PANTALLA ===');
    await page.screenshot({ path: 'video-diagnostic-full.png', fullPage: true });
    console.log('Captura de pantalla completa guardada como: video-diagnostic-full.png');

    // Captura de pantalla del área de videos
    const videoArea = await page.$('[class*="video"], [id*="video"], .container, .video-container');
    if (videoArea) {
      const boundingBox = await videoArea.boundingBox();
      if (boundingBox) {
        await page.screenshot({
          path: 'video-diagnostic-area.png',
          clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
          }
        });
        console.log('Captura de pantalla del área de videos guardada como: video-diagnostic-area.png');
      }
    }

    console.log('\n=== 5. DIAGNÓSTICO FINAL ===');
    console.log('Resumen del análisis:');

    const workingVideos = comparison.filter(v => v.readyState >= 3 && !v.error);
    const brokenVideos = comparison.filter(v => v.readyState < 3 || v.error);

    console.log(`Videos funcionando: ${workingVideos.length}`);
    console.log(`Videos con problemas: ${brokenVideos.length}`);

    if (brokenVideos.length > 0) {
      console.log('\nProblemas detectados:');
      brokenVideos.forEach(video => {
        console.log(`\nVideo ${video.index}:`);
        if (video.error) {
          console.log(`  Error: ${video.error}`);
        }
        console.log(`  ReadyState: ${video.readyState} (debería ser >= 3)`);
        console.log(`  NetworkState: ${video.networkState}`);
        console.log(`  CurrentSrc: ${video.currentSrc}`);

        if (video.display === 'none') {
          console.log(`  PROBLEMA: El video está oculto (display: none)`);
        }
        if (video.visibility === 'hidden') {
          console.log(`  PROBLEMA: El video está oculto (visibility: hidden)`);
        }
        if (video.opacity === '0') {
          console.log(`  PROBLEMA: El video es transparente (opacity: 0)`);
        }
        if (video.width === '0px' || video.height === '0px') {
          console.log(`  PROBLEMA: El video tiene dimensiones cero`);
        }
      });
    }

  } catch (error) {
    console.error('ERROR DURANTE EL ANÁLISIS:', error);
    console.error('STACK:', error.stack);
  } finally {
    await browser.close();
  }
})();