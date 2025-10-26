// Prueba manual del header - Verificación visual
document.addEventListener('DOMContentLoaded', function() {

    console.log('🧪 Iniciando pruebas manuales del header...\n');

    setTimeout(() => {
        let testsPassed = 0;
        let totalTests = 0;

        // 1. Verificar existencia de elementos
        console.log('🔍 1. Verificando estructura del header...');
        totalTests++;

        const lifeplusLogo = document.querySelector('.lifeplus-side-logo');
        const sunshineLogo = document.querySelector('.sunshine-side-logo');
        const headerCentered = document.querySelector('.header-centered');
        const headerContent = document.querySelector('.header-content');
        const elegantTitle = document.querySelector('.elegant-title');

        if (!lifeplusLogo || !sunshineLogo) {
            console.log('❌ No se encontraron los logos laterales');
        } else {
            console.log('✅ Ambos logos encontrados');
            testsPassed++;
        }

        if (!headerCentered || !headerContent) {
            console.log('❌ No se encontró el contenedor centrado');
        } else {
            console.log('✅ Contenedor centrado encontrado');
            testsPassed++;
        }

        if (!elegantTitle) {
            console.log('❌ No se encontró el título elegante');
        } else {
            console.log('✅ Título elegante encontrado');
            testsPassed++;
        }

        // 2. Verificar tamaños de logos
        console.log('\n📏 2. Verificando tamaños de logos...');
        totalTests++;

        if (lifeplusLogo && sunshineLogo) {
            const lifeplusRect = lifeplusLogo.getBoundingClientRect();
            const sunshineRect = sunshineLogo.getBoundingClientRect();

            console.log(`   LifePlus: ${Math.round(lifeplusRect.width)}x${Math.round(lifeplusRect.height)}`);
            console.log(`   Sunshine: ${Math.round(sunshineRect.width)}x${Math.round(sunshineRect.height)}`);

            const widthDiff = Math.abs(lifeplusRect.width - sunshineRect.width);
            if (widthDiff <= 5) {
                console.log('✅ Ambos logos tienen aproximadamente el mismo tamaño');
                testsPassed++;
            } else {
                console.log(`❌ Diferencia de tamaño: ${widthDiff}px`);
            }
        }

        // 3. Verificar posicionamiento
        console.log('\n📍 3. Verificando posicionamiento...');
        totalTests++;

        if (headerCentered && headerContent && lifeplusLogo && sunshineLogo) {
            const headerRect = headerCentered.getBoundingClientRect();
            const contentRect = headerContent.getBoundingClientRect();
            const lifeplusRect = lifeplusLogo.getBoundingClientRect();
            const sunshineRect = sunshineLogo.getBoundingClientRect();

            // Verificar que el contenido está entre los logos
            const contentCenter = contentRect.left + contentRect.width / 2;
            const headerCenter = headerRect.left + headerRect.width / 2;
            const centerDiff = Math.abs(contentCenter - headerCenter);

            console.log(`   Centro del header: ${Math.round(headerCenter)}px`);
            console.log(`   Centro del contenido: ${Math.round(contentCenter)}px`);
            console.log(`   Diferencia: ${Math.round(centerDiff)}px`);

            if (centerDiff <= 20) {
                console.log('✅ El contenido está centrado correctamente');
                testsPassed++;
            } else {
                console.log('❌ El contenido no está centrado');
            }

            // Verificar que los logos están a los lados
            totalTests++;
            if (lifeplusRect.right < contentRect.left - 10 && sunshineRect.left > contentRect.right + 10) {
                console.log('✅ Los logos están posicionados a los lados sin solaparse');
                testsPassed++;
            } else {
                console.log('❌ Los logos podrían estar solapando el contenido');
            }
        }

        // 4. Verificar ausencia de glitch
        console.log('\n🎨 4. Verificando ausencia de efecto glitch...');
        totalTests++;

        const glitchElements = document.querySelectorAll('.glitch-text');
        if (glitchElements.length === 0) {
            console.log('✅ No se encontraron elementos con efecto glitch');
            testsPassed++;
        } else {
            console.log(`❌ Se encontraron ${glitchElements.length} elementos con glitch`);
        }

        // 5. Verificar animaciones
        console.log('\n🎭 5. Verificando animaciones...');
        totalTests++;

        const titleOpacity = window.getComputedStyle(elegantTitle).opacity;
        if (parseFloat(titleOpacity) > 0.8) {
            console.log('✅ El título es visible después de la animación');
            testsPassed++;
        } else {
            console.log(`❌ El título podría no ser visible (opacidad: ${titleOpacity})`);
        }

        // 6. Verificar interactividad
        console.log('\n🎮 6. Verificando interactividad...');
        totalTests++;

        // Simular hover en logos
        if (lifeplusLogo && sunshineLogo) {
            // Guardar estilos originales
            const lifeplusOriginal = lifeplusLogo.style.transform;
            const sunshineOriginal = sunshineLogo.style.transform;

            // Simular hover
            lifeplusLogo.dispatchEvent(new Event('mouseenter'));
            sunshineLogo.dispatchEvent(new Event('mouseenter'));

            setTimeout(() => {
                const lifeplusHover = lifeplusLogo.style.transform;
                const sunshineHover = sunshineLogo.style.transform;

                if (lifeplusHover !== lifeplusOriginal || sunshineHover !== sunshineOriginal) {
                    console.log('✅ Los logos responden al hover');
                    testsPassed++;
                } else {
                    console.log('❌ Los logos no responden al hover');
                }

                // Restaurar
                lifeplusLogo.dispatchEvent(new Event('mouseleave'));
                sunshineLogo.dispatchEvent(new Event('mouseleave'));

                // Resultado final
                console.log('\n' + '='.repeat(50));
                console.log('📊 RESULTADO DE LAS PRUEBAS');
                console.log('='.repeat(50));
                console.log(`✅ Pruebas superadas: ${testsPassed}/${totalTests}`);
                console.log(`📈 Porcentaje de éxito: ${Math.round((testsPassed/totalTests) * 100)}%`);

                if (testsPassed === totalTests) {
                    console.log('🎉 ¡TODAS LAS PRUEBAS SUPERADAS!');
                    console.log('✅ El header cumple con todos los requisitos:');
                    console.log('   - Logos iguales y centrados');
                    console.log('   - Posicionamiento lateral correcto');
                    console.log('   - Sin efecto cyberpunk/glitch');
                    console.log('   - Animaciones suaves funcionando');
                    console.log('   - Interactividad completa');
                } else {
                    console.log('⚠️  Algunas pruebas fallaron. Revisa los detalles above.');
                }
                console.log('='.repeat(50));

            }, 100);
        }
    }, 3000); // Esperar a que las animaciones se completen
});