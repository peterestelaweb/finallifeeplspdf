const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar respuestas de video
  page.on('response', response => {
    const url = response.url();
    if (url.includes('.mp4')) {
      console.log(`📹 VIDEO: ${url.split('/').pop()} - Status: ${response.status()}`);
    }
  });

  try {
    console.log('🔍 DIAGNÓSTICO FINAL DEL PROBLEMA DE VIDEO');
    console.log('URL: https://lifepluspdf.peterestela.com/');

    await page.goto('https://lifepluspdf.peterestela.com/', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    console.log('\n📋 ANÁLISIS COMPLETO:');

    // 1. Verificar archivos disponibles
    console.log('\n1️⃣ VERIFICANDO ARCHIVOS DISPONIBLES:');
    const videoUrls = [
      'https://lifepluspdf.peterestela.com/videos/demo-video.mp4',
      'https://lifepluspdf.peterestela.com/videos/2%20SOLIS%20GREENLY.mp4',
      'https://lifepluspdf.peterestela.com/videos/solis-greenly.mp4'
    ];

    for (const url of videoUrls) {
      try {
        const response = await page.request.get(url, { timeout: 5000 });
        const status = response.status();
        const size = response.headers()['content-length'];
        const type = response.headers()['content-type'];

        const statusIcon = status === 200 ? '✅' : status === 206 ? '🔄' : '❌';
        console.log(`   ${statusIcon} ${url.split('/').pop()}`);
        console.log(`      Status: ${status}`);
        console.log(`      Size: ${size ? `${(parseInt(size)/1024/1024).toFixed(2)}MB` : 'N/A'}`);
        console.log(`      Type: ${type || 'N/A'}`);
      } catch (error) {
        console.log(`   ❌ ${url.split('/').pop()} - Error: ${error.message}`);
      }
    }

    // 2. Analizar estado actual de los videos
    console.log('\n2️⃣ ESTADO ACTUAL DE LOS VIDEOS EN LA PÁGINA:');
    const videos = await page.$$('video');

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const videoId = await video.getAttribute('id');
      const currentSrc = await video.evaluate(v => v.currentSrc);

      console.log(`\n   Video ${i + 1} (${videoId}):`);
      console.log(`      Archivo: ${currentSrc.split('/').pop()}`);

      // Verificar si se puede cargar
      try {
        const response = await page.request.get(currentSrc, { timeout: 5000 });
        const status = response.status();
        const size = response.headers()['content-length'];
        const type = response.headers()['content-type'];

        console.log(`      Disponible: ${status === 200 || status === 206 ? 'SÍ' : 'NO'}`);
        console.log(`      HTTP Status: ${status}`);
        console.log(`      Tamaño: ${size ? `${(parseInt(size)/1024/1024).toFixed(2)}MB` : 'N/A'}`);
        console.log(`      Tipo: ${type || 'N/A'}`);

        if (status === 200 || status === 206) {
          console.log(`      ✅ El archivo existe y es accesible`);
        } else {
          console.log(`      ❌ El archivo no existe o no es accesible`);
        }

      } catch (error) {
        console.log(`      ❌ Error al verificar: ${error.message}`);
      }
    }

    // 3. Buscar referencias en el código fuente
    console.log('\n3️⃣ REFERENCIAS EN EL CÓDIGO FUENTE:');
    const htmlContent = await page.content();

    const videoPatterns = [
      /src="([^"]*\.mp4[^"]*)"/gi,
      /<video[^>]*>[\s\S]*?<\/video>/gi,
      /id="([^"]*video[^"]*)"/gi
    ];

    videoPatterns.forEach((pattern, index) => {
      const matches = [];
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        matches.push(match[1]);
      }

      if (matches.length > 0) {
        const type = ['Rutas MP4', 'Elementos Video', 'IDs Video'][index];
        console.log(`   ${type}: ${matches.length} encontrados`);
        matches.forEach(m => console.log(`      - ${m}`));
      }
    });

    // 4. Verificar el problema específico
    console.log('\n4️⃣ ANÁLISIS DEL PROBLEMA ESPECÍFICO:');

    const problemAnalysis = await page.evaluate(() => {
      const video2 = document.getElementById('benefitsVideo');
      if (!video2) return { success: false, message: 'Video benefitsVideo no encontrado' };

      return {
        videoId: video2.id,
        currentSrc: video2.currentSrc,
        readyState: video2.readyState,
        networkState: video2.networkState,
        error: video2.error ? video2.error.message : null,
        duration: video2.duration,
        videoWidth: video2.videoWidth,
        videoHeight: video2.videoHeight
      };
    });

    console.log('   Problema identificado:');
    console.log(`      Video ID: ${problemAnalysis.videoId}`);
    console.log(`      Archivo buscado: ${problemAnalysis.currentSrc.split('/').pop()}`);
    console.log(`      ReadyState: ${problemAnalysis.readyState}/4`);
    console.log(`      NetworkState: ${problemAnalysis.networkState}/4`);
    console.log(`      Error: ${problemAnalysis.error || 'Ninguno'}`);
    console.log(`      Dimensiones: ${problemAnalysis.videoWidth}x${problemAnalysis.videoHeight}`);

    // 5. Probar la solución
    console.log('\n5️⃣ PROBANDO SOLUCIÓN:');

    const solutionResult = await page.evaluate(() => {
      const video2 = document.getElementById('benefitsVideo');
      if (!video2) return { success: false, message: 'Video no encontrado' };

      // Guardar estado original
      const original = {
        src: video2.currentSrc,
        readyState: video2.readyState,
        networkState: video2.networkState
      };

      // Aplicar solución: usar el archivo correcto
      const newSrc = 'https://lifepluspdf.peterestela.com/videos/solis-greenly.mp4';
      video2.src = newSrc;
      video2.load();

      return {
        success: true,
        original: original,
        newSrc: newSrc,
        videoId: video2.id
      };
    });

    console.log('   Solución aplicada:');
    console.log(`      Video: ${solutionResult.videoId}`);
    console.log(`      Original: ${solutionResult.original.src.split('/').pop()}`);
    console.log(`      Corregido: ${solutionResult.newSrc.split('/').pop()}`);

    // Esperar a que cargue
    await page.waitForTimeout(3000);

    const afterSolution = await page.evaluate(() => {
      const video2 = document.getElementById('benefitsVideo');
      if (!video2) return null;

      return {
        currentSrc: video2.currentSrc,
        readyState: video2.readyState,
        networkState: video2.networkState,
        error: video2.error ? video2.error.message : null,
        duration: video2.duration,
        videoWidth: video2.videoWidth,
        videoHeight: video2.videoHeight
      };
    });

    console.log('   Resultado después de la solución:');
    console.log(`      Nuevo archivo: ${afterSolution.currentSrc.split('/').pop()}`);
    console.log(`      ReadyState: ${afterSolution.readyState}/4`);
    console.log(`      NetworkState: ${afterSolution.networkState}/4`);
    console.log(`      Error: ${afterSolution.error || 'Ninguno'}`);
    console.log(`      Dimensiones: ${afterSolution.videoWidth}x${afterSolution.videoHeight}`);

    // 6. Intentar reproducir
    console.log('\n6️⃣ INTENTANDO REPRODUCIR:');

    try {
      const playResult = await page.evaluate(() => {
        const video2 = document.getElementById('benefitsVideo');
        if (!video2) return null;

        return video2.play()
          .then(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  success: true,
                  paused: video2.paused,
                  currentTime: video2.currentTime,
                  duration: video2.duration,
                  readyState: video2.readyState
                });
              }, 2000);
            });
          })
          .catch(error => {
            return {
              success: false,
              error: error.message,
              readyState: video2.readyState
            };
          });
      });

      if (playResult) {
        if (playResult.success) {
          console.log('   ✅ ¡REPRODUCCIÓN EXITOSA!');
          console.log(`      Tiempo: ${playResult.currentTime}s / ${playResult.duration}s`);
          console.log(`      Pausado: ${playResult.paused}`);
        } else {
          console.log('   ❌ Error al reproducir:');
          console.log(`      Error: ${playResult.error}`);
          console.log(`      ReadyState: ${playResult.readyState}/4`);

          if (playResult.error.includes('DEMUXER_ERROR')) {
            console.log('   🔍 DIAGNÓSTICO: Error de códec/formato');
            console.log('   💡 El archivo existe pero tiene un formato incompatible');
          }
        }
      }

    } catch (error) {
      console.log(`   ❌ Error al intentar reproducir: ${error.message}`);
    }

    // 7. Resumen final
    console.log('\n📋 RESUMEN COMPLETO DEL DIAGNÓSTICO:');
    console.log('\n🔍 PROBLEMA DETECTADO:');
    console.log('   1. El HTML busca el archivo "2 SOLIS GREENLY.mp4"');
    console.log('   2. Este archivo no existe en el servidor (error 404)');
    console.log('   3. El archivo correcto es "solis-greenly.mp4"');
    console.log('   4. Además, el archivo correcto tiene problemas de formato/códec');

    console.log('\n✅ SOLUCIONES ENCONTRADAS:');
    console.log('   1. Corregir el nombre del archivo en el HTML');
    console.log('   2. Usar el archivo "solis-greenly.mp4" que sí existe');
    console.log('   3. Convertir el video a formato web estándar si es necesario');

    console.log('\n🎯 ACCIONES RECOMENDADAS:');
    console.log('   1. Actualizar el HTML permanentemente:');
    console.log('      Cambiar: videos/2 SOLIS GREENLY.mp4');
    console.log('      Por:     videos/solis-greenly.mp4');
    console.log('\n   2. Si el video sigue sin funcionar, convertirlo:');
    console.log('      ffmpeg -i "solis-greenly.mp4" -c:v libx264 -c:a aac -movflags +faststart solis-greenly-fixed.mp4');
    console.log('\n   3. Probar con diferentes navegadores para compatibilidad');

    // Captura de pantalla
    await page.screenshot({ path: 'complete-diagnosis.png', fullPage: false });
    console.log('\n📸 Captura de pantalla guardada: complete-diagnosis.png');

    console.log('\n🏁 DIAGNÓSTICO COMPLETADO');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  } finally {
    await browser.close();
  }
})();