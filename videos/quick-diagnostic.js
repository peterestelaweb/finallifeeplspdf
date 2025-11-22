const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar errores de red
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });

  // Capturar respuestas de video
  page.on('response', response => {
    const url = response.url();
    if (url.includes('.mp4') || url.includes('.webm')) {
      console.log(`VIDEO RESPONSE: ${url} - Status: ${response.status()}`);
    }
  });

  try {
    console.log('=== ANÁLISIS RÁPIDO DE VIDEOS ===');

    await page.goto('https://lifepluspdf.peterestela.com/', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Esperar un momento para que los videos intenten cargar
    await page.waitForTimeout(3000);

    console.log('\n=== 1. VERIFICANDO ELEMENTOS DE VIDEO ===');
    const videos = await page.$$('video');
    console.log(`Videos encontrados: ${videos.length}`);

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.log(`\n--- Video ${i + 1} ---`);

      const videoId = await video.getAttribute('id');
      const videoSrc = await video.getAttribute('src');

      console.log(`ID: ${videoId || 'No ID'}`);
      console.log(`Src atributo: ${videoSrc || 'No src'}`);

      // Obtener estado actual
      const state = await video.evaluate(v => ({
        currentSrc: v.currentSrc,
        readyState: v.readyState,
        networkState: v.networkState,
        error: v.error ? v.error.message : null,
        duration: v.duration,
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight
      }));

      console.log(`CurrentSrc: ${state.currentSrc}`);
      console.log(`ReadyState: ${state.readyState}`);
      console.log(`NetworkState: ${state.networkState}`);
      console.log(`Error: ${state.error}`);
      console.log(`Duration: ${state.duration}`);
      console.log(`Dimensions: ${state.videoWidth}x${state.videoHeight}`);
    }

    console.log('\n=== 2. VERIFICANDO ARCHIVOS EN EL SERVIDOR ===');

    // Probar acceso directo a los archivos de video
    const videoUrls = [
      'https://lifepluspdf.peterestela.com/videos/demo-video.mp4',
      'https://lifepluspdf.peterestela.com/videos/2%20SOLIS%20GREENLY.mp4',
      'https://lifepluspdf.peterestela.com/videos/2 SOLIS GREENLY.mp4',
      'https://lifepluspdf.peterestela.com/videos/solis-greenly.mp4',
      'https://lifepluspdf.peterestela.com/videos/video2.mp4'
    ];

    for (const url of videoUrls) {
      try {
        console.log(`\nProbando: ${url}`);
        const response = await page.request.get(url, { timeout: 5000 });
        console.log(`  Status: ${response.status()}`);
        console.log(`  Content-Type: ${response.headers()['content-type'] || 'No especificado'}`);
        console.log(`  Content-Length: ${response.headers()['content-length'] || 'No especificado'}`);

        if (response.status() === 200) {
          console.log('  ✅ ARCHIVO ENCONTRADO');
        } else if (response.status() === 404) {
          console.log('  ❌ ARCHIVO NO ENCONTRADO (404)');
        } else {
          console.log(`  ⚠️  CÓDIGO INESPERADO: ${response.status()}`);
        }
      } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`);
      }
    }

    console.log('\n=== 3. REVISANDO CÓDIGO FUENTE ===');

    // Buscar referencias a videos en el HTML
    const htmlContent = await page.content();

    const videoReferences = [];
    const regex = /src="([^"]*\.mp4[^"]*)"/gi;
    let match;

    while ((match = regex.exec(htmlContent)) !== null) {
      videoReferences.push(match[1]);
    }

    console.log('Referencias a videos encontradas en HTML:');
    videoReferences.forEach((ref, index) => {
      console.log(`  ${index + 1}. ${ref}`);
    });

    // Buscar IDs de video
    const videoIds = [];
    const idRegex = /id="([^"]*video[^"]*)"/gi;

    while ((match = idRegex.exec(htmlContent)) !== null) {
      videoIds.push(match[1]);
    }

    console.log('IDs de video encontrados:');
    videoIds.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });

    console.log('\n=== 4. VERIFICANDO DIRECTORIO DE VIDEOS ===');

    // Intentar listar el directorio de videos
    try {
      const response = await page.request.get('https://lifepluspdf.peterestela.com/videos/', { timeout: 5000 });
      console.log(`Status del directorio /videos/: ${response.status()}`);

      if (response.status() === 200) {
        const html = await response.text();
        console.log('El directorio /videos/ es accesible');

        // Buscar archivos .mp4 en el listado del directorio
        const mp4Files = html.match(/[^"]*\.mp4/g) || [];
        console.log('Archivos .mp4 encontrados en el directorio:');
        mp4Files.forEach(file => {
          console.log(`  - ${file}`);
        });
      }
    } catch (error) {
      console.log(`No se pudo acceder al directorio /videos/: ${error.message}`);
    }

    console.log('\n=== 5. SOLUCIONES PROPUESTAS ===');

    // Analizar el problema y proponer soluciones
    console.log('Análisis del problema:');
    console.log('1. El video "demo-video.mp4" funciona correctamente');
    console.log('2. El video "2 SOLIS GREENLY.mp4" da error 404');
    console.log('3. Esto sugiere que:');
    console.log('   - El archivo no existe en el servidor');
    console.log('   - O el nombre del archivo es diferente');
    console.log('   - O la ruta es incorrecta');

    console.log('\nSoluciones posibles:');
    console.log('1. Verificar el nombre exacto del archivo en el servidor');
    console.log('2. Renombrar el archivo a "solis-greenly.mp4" (sin espacios)');
    console.log('3. Actualizar la ruta en el código HTML');
    console.log('4. Verificar permisos del archivo');
    console.log('5. Asegurar que el archivo esté en el directorio correcto');

  } catch (error) {
    console.error('Error durante el análisis:', error);
  } finally {
    await browser.close();
  }
})();