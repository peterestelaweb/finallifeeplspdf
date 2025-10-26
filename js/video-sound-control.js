// Controlador de sonido simplificado para videos
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔊 Iniciando controladores de sonido...');

    // Función para configurar cada video
    function setupVideo(videoId, buttonId) {
        const video = document.getElementById(videoId);
        const button = document.getElementById(buttonId);

        if (!video || !button) {
            console.error(`❌ No se encontró video ${videoId} o botón ${buttonId}`);
            return;
        }

        const icon = button.querySelector('i');
        if (!icon) {
            console.error(`❌ No se encontró icono en botón ${buttonId}`);
            return;
        }

        console.log(`✅ Configurando video ${videoId} con botón ${buttonId}`);

        // Hacer botón visible
        button.style.display = 'block';
        button.style.opacity = '1';
        button.style.cursor = 'pointer';

        // Función para alternar sonido
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (video.muted) {
                // Activar sonido
                video.muted = false;
                video.volume = 0.7;
                icon.className = 'fas fa-volume-up';
                button.title = 'Silenciar';
                console.log(`🔊 Sonido activado para ${videoId}`);
            } else {
                // Silenciar
                video.muted = true;
                icon.className = 'fas fa-volume-mute';
                button.title = 'Activar sonido';
                console.log(`🔇 Sonido silenciado para ${videoId}`);
            }
        });

        // Actualizar icono si el usuario cambia el volumen
        video.addEventListener('volumechange', function() {
            if (video.muted) {
                icon.className = 'fas fa-volume-mute';
                button.title = 'Activar sonido';
            } else {
                icon.className = 'fas fa-volume-up';
                button.title = 'Silenciar';
            }
        });

        // Efecto hover
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }

    // Configurar ambos videos
    setupVideo('demoVideo', 'soundToggle1');
    setupVideo('benefitsVideo', 'soundToggle2');

    console.log('🔊 Controladores de sonido configurados para ambos videos');
});