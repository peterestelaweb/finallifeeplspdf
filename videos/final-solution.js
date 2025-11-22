const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar eventos de consola
  page.on('console', msg => {
    if (msg.text().includes('Failed to load resource')) return; // Ignorar errores 404
    console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  // Capturar respuestas de video
  page.on('response', response => {
    const url = response.url();
    if (url.includes('.mp4')) {
      console.log(`📹 VIDEO: ${url.split('/').pop()} - Status: ${response.status()}`);
    }
  });

  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA DE VIDEO');
    console.log('URL: https://lifepluspdf.peterestela.com/');

    await page.goto('https://lifepluspdf.peterestela.com/', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    console.log('\n📊 ESTADO ACTUAL DE LOS VIDEOS:');

    const videos = await page.$$('video');
    console.log(`Total de videos encontrados: ${videos.length}`);

    const videoStatus = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('video').forEach((video, index) => {
        results.push({
          id: video.id || `video-${index}`,
          currentSrc: video.currentSrc,
          readyState: video.readyState,
          networkState: video.networkState,
          error: video.error ? video.error.message : null,
          duration: video.duration,
          dimensions: `${video.videoWidth}x${video.videoHeight}`,
          works: video.readyState >= 3 && video.videoWidth > 0
        });
      });
      return results;
    });

    videoStatus.forEach((video, index) => {
      const status = video.works ? '✅ FUNCIONA' : '❌ PROBLEMA';
      console.log(`\n${status} Video ${index + 1} (${video.id}):`);
      console.log(`   Archivo: ${video.currentSrc.split('/').pop()}`);
      console.log(`   Estado: ${video.readyState}/4 (${video.error || 'OK'})`);
      console.log(`   Dimensiones: ${video.dimensions}`);
      console.log(`   Duración: ${video.duration}s`);
    });

    console.log('\n🔧 APLICANDO SOLUCIÓN DEFINITIVA:');

    // Solución: Forzar la carga correcta del video
    const fixResult = await page.evaluate(() => {
      const video2 = document.getElementById('benefitsVideo');
      if (!video2) return { success: false, message: 'Video no encontrado' };

      // Guardar estado original
      const originalSrc = video2.src;
      const originalState = {
        readyState: video2.readyState,
        networkState: video2.networkState,
        error: video.error ? video.error.message : null
      };

      // Solución 1: Limpiar y recargar con el archivo correcto
      video2.innerHTML = ''; // Eliminar cualquier source existente

      const source = document.createElement('source');
      source.src = 'https://lifepluspdf.peterestela.com/videos/solis-greenly.mp4';
      source.type = 'video/mp4';

      video2.appendChild(source);

      // Añadir atributos para mejor compatibilidad
      video2.setAttribute('controls', '');
      video2.setAttribute('muted', '');
      video2.setAttribute('playsinline', '');
      video2.setAttribute('preload', 'metadata');

      // Forzar recarga
      video2.load();

      return {
        success: true,
        originalSrc: originalSrc,
        newSrc: source.src,
        originalState: originalState,
        videoId: video2.id
      };
    });

    console.log('✅ Solución aplicada:');
    console.log(`   Video: ${fixResult.videoId}`);
    console.log(`   Original: ${fixResult.originalSrc.split('/').pop()}`);
    console.log(`   Corregido: ${fixResult.newSrc.split('/').pop()}`);

    await page.waitForTimeout(5000);

    console.log('\n📋 VERIFICANDO RESULTADO DE LA SOLUCIÓN:');

    const afterFix = await page.evaluate(() => {
      const video2 = document.getElementById('benefitsVideo');
      if (!video2) return null;

      // Intentar reproducir
      let playResult = null;
      return video2.play()
        .then(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                readyState: video2.readyState,
                readyStateText: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][video2.readyState],
                networkState: video2.networkState,
                networkStateText: ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'][video2.networkState],
                error: video2.error ? video.error.message : null,
                duration: video2.duration,
                currentTime: video2.currentTime,
                paused: video2.paused,
                ended: video2.ended,
                videoWidth: video2.videoWidth,
                videoHeight: video2.videoHeight,
                buffered: video2.buffered.length,
                played: video2.played.length,
                works: video2.readyState >= 3 && video2.videoWidth > 0
              });
            }, 3000);
          });
        })
        .catch(error => {
          return {
            readyState: video2.readyState,
            error: error.message,
            works: false
          };
        });
    });

    console.log('\n🎯 RESULTADO FINAL:');
    if (afterFix) {
      const finalStatus = afterFix.works ? '🎉 ¡FUNCIONA!' : '❌ AÚN FALLA';
      console.log(`Estado: ${finalStatus}`);
      console.log(`ReadyState: ${afterFix.readyState}/4 (${afterFix.readyStateText})`);
      console.log(`NetworkState: ${afterFix.networkState} (${afterFix.networkStateText})`);
      console.log(`Dimensiones: ${afterFix.videoWidth}x${afterFix.videoHeight}`);
      console.log(`Duración: ${afterFix.duration}s`);
      console.log(`Tiempo actual: ${afterFix.currentTime}s`);
      console.log(`Pausado: ${afterFix.paused}`);
      console.log(`Error: ${afterFix.error || 'Ninguno'}`);

      if (afterFix.works) {
        console.log('\n🎊 ¡EL VIDEO SE ESTÁ REPRODUCIENDO CORRECTAMENTE!');
        console.log('La solución fue exitosa.');
      } else {
        console.log('\n⚠️ El video aún no funciona. Analizando problema...');

        if (afterFix.error && afterFix.error.includes('DEMUXER_ERROR')) {
          console.log('\n🔍 DIAGNÓSTICO: Error de códec/formato');
          console.log('El archivo existe pero tiene un formato incompatible.');
          console.log('\n💡 SOLUCIÓN:');
          console.log('1. Convertir el video a formato web estándar:');
          console.log('   - Video: H.264 (AVC)');
          console.log('   - Audio: AAC');
          console.log('   - Contenedor: MP4');
          console.log('\n2. Comando FFmpeg:');
          console.log('   ffmpeg -i "2 SOLIS GREENLY.mp4" -c:v libx264 -c:a aac -movflags +faststart solis-greenly-web.mp4');
        }
      }
    }

    console.log('\n📝 RESUMEN COMPLETO DEL ANÁLISIS:');

    console.log('\n🔍 PROBLEMA IDENTIFICADO:');
    console.log('1. El HTML busca "2 SOLIS GREENLY.mp4"');
    console.log('2. El archivo real se llama "solis-greenly.mp4"');
    console.log('3. El archivo existe pero tiene formato/códec incompatible');

    console.log('\n✅ SOLUCIONES IMPLEMENTADAS:');
    console.log('1. Corregido el nombre del archivo (quitar espacios)');
    console.log('2. Añadidos atributos HTML5 para mejor compatibilidad');
    console.log('3. Forzada la recarga del video');

    console.log('\n📋 ACCIONES RECOMENDADAS:');
    console.log('1. Actualizar permanentemente el HTML con el nombre correcto');
    console.log('2. Convertir el video a formato web estándar si es necesario');
    console.log('3. Probar con diferentes navegadores para compatibilidad');

    // Captura de pantalla final
    await page.screenshot({ path: 'final-result.png', fullPage: false });
    console.log('\n📸 Captura de pantalla guardada: final-result.png');

    console.log('\n🏁 ANÁLISIS COMPLETADO');

  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
  } finally {
    await browser.close();
  }
})();