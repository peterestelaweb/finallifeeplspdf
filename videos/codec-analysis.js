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
      if (response.status() === 200 || response.status() === 206) {
        console.log(`  Content-Type: ${response.headers()['content-type'] || 'No especificado'}`);
        console.log(`  Content-Length: ${response.headers()['content-length'] || 'No especificado'}`);
        console.log(`  Accept-Ranges: ${response.headers()['accept-ranges'] || 'No especificado'}`);
        console.log(`  Content-Range: ${response.headers()['content-range'] || 'No especificado'}`);
      }
    }
  });

  try {
    console.log('=== ANÁLISIS PROFUNDO DE CÓDEC Y FORMATO ===');

    await page.goto('https://lifepluspdf.peterestela.com/', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    console.log('\n=== 1. COMPARANDO AMBOS ARCHIVOS DE VIDEO ===');

    // Obtener información detallada de ambos videos
    const videoInfo = await page.evaluate(async () => {
      const videos = document.querySelectorAll('video');
      const results = [];

      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const videoId = video.id;
        const currentSrc = video.currentSrc;

        // Intentar obtener información del archivo a través de fetch
        let fileInfo = null;
        try {
          const response = await fetch(currentSrc, {
            method: 'HEAD',
            mode: 'cors'
          });
          fileInfo = {
            status: response.status,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
            acceptRanges: response.headers.get('accept-ranges'),
            lastModified: response.headers.get('last-modified')
          };
        } catch (error) {
          fileInfo = { error: error.message };
        }

        results.push({
          videoId: videoId,
          currentSrc: currentSrc,
          fileInfo: fileInfo,
          readyState: video.readyState,
          networkState: video.networkState,
          error: video.error ? {
            message: video.error.message,
            code: video.error.code,
            name: video.error.name
          } : null,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          duration: video.duration
        });
      }

      return results;
    });

    console.log('Información detallada de los videos:');
    videoInfo.forEach((info, index) => {
      console.log(`\n--- Video ${index + 1} (${info.videoId}) ---`);
      console.log(`CurrentSrc: ${info.currentSrc}`);
      console.log(`FileInfo:`, info.fileInfo);
      console.log(`ReadyState: ${info.readyState}`);
      console.log(`NetworkState: ${info.networkState}`);
      console.log(`Error:`, info.error);
      console.log(`Dimensions: ${info.videoWidth}x${info.videoHeight}`);
      console.log(`Duration: ${info.duration}`);
    });

    console.log('\n=== 2. ANÁLISIS DE FORMATO DE VIDEO ===');

    // Analizar las diferencias entre los archivos
    const video1 = videoInfo.find(v => v.videoId === 'demoVideo');
    const video2 = videoInfo.find(v => v.videoId === 'benefitsVideo');

    if (video1 && video2) {
      console.log('\nComparación de formatos:');
      console.log('Video 1 (funciona):');
      console.log(`  Tamaño: ${video1.fileInfo.contentLength} bytes`);
      console.log(`  Content-Type: ${video1.fileInfo.contentType}`);
      console.log(`  ReadyState: ${video1.readyState}`);
      console.log(`  Error: ${video1.error ? 'Sí' : 'No'}`);

      console.log('\nVideo 2 (problema):');
      console.log(`  Tamaño: ${video2.fileInfo.contentLength} bytes`);
      console.log(`  Content-Type: ${video2.fileInfo.contentType}`);
      console.log(`  ReadyState: ${video2.readyState}`);
      console.log(`  Error: ${video2.error ? video2.error.message : 'No'}`);

      // Calcular la diferencia de tamaño
      const sizeDiff = Math.abs(parseInt(video1.fileInfo.contentLength) - parseInt(video2.fileInfo.contentLength));
      console.log(`\nDiferencia de tamaño: ${sizeDiff.toLocaleString()} bytes`);

      console.log('\n=== 3. DIAGNÓSTICO DE ERRORES DE CÓDEC ===');

      if (video2.error && video2.error.message.includes('DEMUXER_ERROR')) {
        console.log('ERROR DETECTADO: DEMUXER_ERROR_NO_SUPPORTED_STREAMS');
        console.log('\nEste error indica que:');
        console.log('1. El archivo MP4 tiene un formato de contenedor incompatible');
        console.log('2. El códec de video/audio no es compatible con el navegador');
        console.log('3. El archivo podría estar corrupto');
        console.log('4. El archivo podría usar un perfil de MP4 no estándar');

        console.log('\nPosibles causas:');
        console.log('- Códec de video: H.265/HEVC (no soportado en todos los navegadores)');
        console.log('- Códec de audio: PCM, DTS, u otros formatos no web estándar');
        console.log('- Perfil de MP4: podría ser un perfil especial no compatible');
        console.log('- Contenedor: podría estar dañado o usar una versión no estándar');

        console.log('\nSoluciones sugeridas:');
        console.log('1. Convertir el video a H.264 (AVC) + AAC (estándar web)');
        console.log('2. Usar una herramienta como FFmpeg para reempaquetar');
        console.log('3. Probar con diferentes formatos (WebM, OGG)');
        console.log('4. Verificar la integridad del archivo');
      }
    }

    console.log('\n=== 4. VERIFICANDO SOPORTE DE FORMATOS ===');

    // Verificar qué formatos soporta el navegador
    const formatSupport = await page.evaluate(() => {
      const video = document.createElement('video');
      const formats = [
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',  // H.264 Baseline + AAC
        'video/mp4; codecs="avc1.64001E, mp4a.40.2"',  // H.264 High + AAC
        'video/webm; codecs="vp8, vorbis"',             // WebM VP8 + Vorbis
        'video/webm; codecs="vp9, opus"',               // WebM VP9 + Opus
        'video/ogg; codecs="theora, vorbis"',           // OGG Theora + Vorbis
        'video/mp4',                                    // MP4 genérico
        'video/webm',                                   // WebM genérico
        'video/ogg'                                     // OGG genérico
      ];

      const support = {};
      formats.forEach(format => {
        support[format] = video.canPlayType(format);
      });

      return support;
    });

    console.log('Soporte de formatos del navegador:');
    Object.entries(formatSupport).forEach(([format, support]) => {
      console.log(`  ${format}: ${support}`);
    });

    console.log('\n=== 5. INTENTANDO SOLUCIONES ALTERNATIVAS ===');

    // Probar diferentes soluciones para el video 2
    console.log('\nProbando solución 1: Forzar carga con atributos HTML5...');
    await page.evaluate(() => {
      const video2 = document.getElementById('benefitsVideo');
      if (video2) {
        // Limpiar el video
        video2.innerHTML = '';

        // Añadir source con atributos adecuados
        const source = document.createElement('source');
        source.src = 'https://lifepluspdf.peterestela.com/videos/solis-greenly.mp4';
        source.type = 'video/mp4';

        video2.appendChild(source);
        video2.load();

        // Añadir atributos para mejor compatibilidad
        video2.setAttribute('controls', '');
        video2.setAttribute('muted', '');
        video2.setAttribute('playsinline', '');
        video2.setAttribute('crossorigin', 'anonymous');
      }
    });

    await page.waitForTimeout(3000);

    const solution1Result = await page.evaluate(() => {
      const video2 = document.getElementById('benefitsVideo');
      if (video2) {
        return {
          readyState: video2.readyState,
          networkState: video2.networkState,
          error: video2.error ? video2.error.message : null,
          currentSrc: video2.currentSrc,
          duration: video2.duration,
          videoWidth: video2.videoWidth,
          videoHeight: video2.videoHeight
        };
      }
      return null;
    });

    console.log('Resultado solución 1:', solution1Result);

    // Si sigue sin funcionar, probar con otros formatos
    if (solution1Result && solution1Result.readyState === 0) {
      console.log('\nProbando solución 2: Buscar versiones alternativas...');

      const alternativeFormats = [
        'https://lifepluspdf.peterestela.com/videos/solis-greenly.webm',
        'https://lifepluspdf.peterestela.com/videos/solis-greenly.ogg',
        'https://lifepluspdf.peterestela.com/videos/solis-greenly.mov',
        'https://lifepluspdf.peterestela.com/videos/solis-greenly.avi'
      ];

      for (const format of alternativeFormats) {
        try {
          console.log(`\nProbando formato: ${format}`);
          const response = await page.request.get(format, { timeout: 5000 });
          console.log(`  Status: ${response.status()}`);

          if (response.status() === 200) {
            console.log(`  ✅ Formato alternativo encontrado: ${format}`);

            // Probar con este formato
            await page.evaluate((url) => {
              const video2 = document.getElementById('benefitsVideo');
              if (video2) {
                video2.innerHTML = '';
                const source = document.createElement('source');
                source.src = url;
                source.type = url.includes('.webm') ? 'video/webm' :
                             url.includes('.ogg') ? 'video/ogg' :
                             url.includes('.mov') ? 'video/quicktime' : 'video/mp4';
                video2.appendChild(source);
                video2.load();
              }
            }, format);

            await page.waitForTimeout(2000);

            const altResult = await page.evaluate(() => {
              const video2 = document.getElementById('benefitsVideo');
              if (video2) {
                return {
                  readyState: video2.readyState,
                  error: video2.error ? video2.error.message : null,
                  duration: video2.duration
                };
              }
              return null;
            });

            console.log('Resultado con formato alternativo:', altResult);

            if (altResult && altResult.readyState > 0) {
              console.log('✅ ¡Formato alternativo funcionando!');
              break;
            }
          }
        } catch (error) {
          console.log(`  ❌ Formato no disponible: ${error.message}`);
        }
      }
    }

    console.log('\n=== 6. RECOMENDACIONES FINALES ===');

    console.log('ANÁLISIS COMPLETO:');
    console.log('1. El archivo existe y es accesible (HTTP 206)');
    console.log('2. El problema es de compatibilidad de formato/códec');
    console.log('3. El error "DEMUXER_ERROR_NO_SUPPORTED_STREAMS" indica formato incompatible');

    console.log('\nSOLUCIONES RECOMENDADAS:');
    console.log('1. Convertir el video a formato web estándar:');
    console.log('   - Video: H.264 (AVC)');
    console.log('   - Audio: AAC');
    console.log('   - Contenedor: MP4');

    console.log('\n2. Comando FFmpeg sugerido:');
    console.log('   ffmpeg -i "2 SOLIS GREENLY.mp4" -c:v libx264 -c:a aac -movflags +faststart solis-greenly-fixed.mp4');

    console.log('\n3. Alternativas:');
    console.log('   - Probar con formato WebM (VP9 + Opus)');
    console.log('   - Usar un servicio online para convertir el video');
    console.log('   - Verificar si el video original tiene protección DRM');

  } catch (error) {
    console.error('Error durante el análisis:', error);
  } finally {
    await browser.close();
  }
})();