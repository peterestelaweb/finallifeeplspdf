const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar eventos de consola
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  // Capturar respuestas de video
  page.on('response', response => {
    const url = response.url();
    if (url.includes('.mp4')) {
      console.log(`VIDEO RESPONSE: ${url} - Status: ${response.status()}`);
    }
  });

  try {
    console.log('=== PROBANDO SOLUCIÓN PARA VIDEO 2 ===');

    await page.goto('https://lifepluspdf.peterestela.com/', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    console.log('\n=== 1. ESTADO ANTES DE LA CORRECCIÓN ===');

    const video2 = await page.$('#benefitsVideo');
    if (video2) {
      const currentState = await video2.evaluate(v => ({
        currentSrc: v.currentSrc,
        readyState: v.readyState,
        networkState: v.networkState,
        error: v.error ? v.error.message : null,
        duration: v.duration,
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight
      }));

      console.log('Estado actual del video 2:');
      console.log(`CurrentSrc: ${currentState.currentSrc}`);
      console.log(`ReadyState: ${currentState.readyState} (debería ser >= 3 para funcionar)`);
      console.log(`NetworkState: ${currentState.networkState}`);
      console.log(`Error: ${currentState.error}`);
      console.log(`Dimensions: ${currentState.videoWidth}x${currentState.videoHeight}`);
    }

    console.log('\n=== 2. APLICANDO CORRECCIÓN ===');

    // Solución: Cambiar el src del video al nombre correcto del archivo
    const correctionResult = await page.evaluate(() => {
      const video2 = document.getElementById('benefitsVideo');
      if (video2) {
        const oldSrc = video2.src;
        const newSrc = 'https://lifepluspdf.peterestela.com/videos/solis-greenly.mp4';

        console.log('Corrigiendo fuente del video:');
        console.log('Antes:', oldSrc);
        console.log('Después:', newSrc);

        // Eliminar el source existente si lo hay
        const existingSource = video2.querySelector('source');
        if (existingSource) {
          existingSource.remove();
        }

        // Establecer el nuevo src directamente en el elemento video
        video2.src = newSrc;
        video2.load(); // Forzar recarga del video

        return {
          success: true,
          oldSrc: oldSrc,
          newSrc: newSrc,
          videoId: video2.id
        };
      }
      return { success: false, message: 'Video no encontrado' };
    });

    console.log('Resultado de la corrección:', correctionResult);

    if (correctionResult.success) {
      console.log('\n=== 3. ESPERANDO A QUE EL VIDEO CARGUE ===');
      await page.waitForTimeout(5000);

      console.log('\n=== 4. VERIFICANDO ESTADO DESPUÉS DE LA CORRECCIÓN ===');

      const video2After = await page.$('#benefitsVideo');
      if (video2After) {
        const stateAfter = await video2After.evaluate(v => ({
          currentSrc: v.currentSrc,
          readyState: v.readyState,
          readyStateText: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][v.readyState],
          networkState: v.networkState,
          networkStateText: ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'][v.networkState],
          error: v.error ? v.error.message : null,
          errorCode: v.error ? v.error.code : null,
          duration: v.duration,
          currentTime: v.currentTime,
          buffered: v.buffered.length,
          played: v.played.length,
          paused: v.paused,
          videoWidth: v.videoWidth,
          videoHeight: v.videoHeight,
          volume: v.volume,
          muted: v.muted
        }));

        console.log('Estado después de la corrección:');
        console.log(`CurrentSrc: ${stateAfter.currentSrc}`);
        console.log(`ReadyState: ${stateAfter.readyState} (${stateAfter.readyStateText})`);
        console.log(`NetworkState: ${stateAfter.networkState} (${stateAfter.networkStateText})`);
        console.log(`Error: ${stateAfter.error}`);
        console.log(`Duration: ${stateAfter.duration}s`);
        console.log(`Dimensions: ${stateAfter.videoWidth}x${stateAfter.videoHeight}`);
        console.log(`Buffered: ${stateAfter.buffered} rangos`);
        console.log(`Played: ${stateAfter.played} rangos`);
        console.log(`Paused: ${stateAfter.paused}`);

        // Verificar si el video es visible
        const boundingBox = await video2After.boundingBox();
        if (boundingBox) {
          console.log(`Visible en pantalla: ${boundingBox.width}x${boundingBox.height} en (${boundingBox.x}, ${boundingBox.y})`);
        }

        console.log('\n=== 5. INTENTANDO REPRODUCIR EL VIDEO ===');

        try {
          const playResult = await video2After.evaluate(v => {
            return v.play().then(() => {
              return 'Reproducción iniciada correctamente';
            }).catch(error => {
              return `Error al reproducir: ${error.message}`;
            });
          });

          console.log('Resultado de reproducción:', playResult);

          // Esperar y verificar estado después de reproducir
          await page.waitForTimeout(3000);

          const playingState = await video2After.evaluate(v => ({
            paused: v.paused,
            currentTime: v.currentTime,
            duration: v.duration,
            ended: v.ended,
            readyState: v.readyState
          }));

          console.log('Estado durante reproducción:');
          console.log(`Paused: ${playingState.paused}`);
          console.log(`CurrentTime: ${playingState.currentTime}s / ${playingState.duration}s`);
          console.log(`Ended: ${playingState.ended}`);
          console.log(`ReadyState: ${playingState.readyState}`);

          if (!playingState.paused && playingState.currentTime > 0) {
            console.log('✅ ¡EL VIDEO SE ESTÁ REPRODUCIENDO CORRECTAMENTE!');
          } else {
            console.log('❌ El video no se está reproduciendo');
          }

        } catch (playError) {
          console.log('Error al intentar reproducir:', playError.message);
        }
      }
    }

    console.log('\n=== 6. CAPTURAS DE PANTALLA ===');
    await page.screenshot({ path: 'solution-before.png', fullPage: false });

    if (correctionResult.success) {
      await page.screenshot({ path: 'solution-after.png', fullPage: false });
      console.log('Capturas de pantalla guardadas');
    }

    console.log('\n=== 7. RESUMEN DE LA SOLUCIÓN ===');
    console.log('PROBLEMA:');
    console.log('  - El HTML buscaba "2 SOLIS GREENLY.mp4"');
    console.log('  - El archivo real se llama "solis-greenly.mp4"');
    console.log('  - Los espacios en el nombre causaron el error 404');

    console.log('\nSOLUCIÓN:');
    console.log('  - Cambiar el src del video a "solis-greenly.mp4"');
    console.log('  - Usar guiones en lugar de espacios');
    console.log('  - Esto corrige el problema de incompatibilidad con URLs');

    console.log('\nRECOMENDACIONES:');
    console.log('  1. Actualizar el código HTML permanentemente');
    console.log('  2. Renombrar el archivo si se prefiere mantener el nombre original');
    console.log('  3. Evitar espacios en nombres de archivos para web');
    console.log('  4. Usar URL encoding (%20) si se mantienen espacios');

  } catch (error) {
    console.error('Error durante la prueba:', error);
  } finally {
    await browser.close();
  }
})();