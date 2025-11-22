// Modal legal para información de mercado estadounidense
console.log('⚖️ Iniciando modal legal...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado, configurando modal legal...');

    // Elementos del modal
    const modal = document.getElementById('legalModal');
    const disclaimerLink = document.getElementById('disclaimerLink');
    const closeModal = document.querySelector('.legal-modal-close');
    const closeBtn = document.getElementById('closeLegalModal');

    if (!modal || !disclaimerLink) {
        console.error('❌ Modal o enlace de aviso legal no encontrado');
        return;
    }

    console.log('✅ Elementos del modal encontrados');

    // Función para abrir modal
    function openModal(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('📖 Abriendo modal legal...');
        modal.style.display = 'flex';
        modal.style.opacity = '0';

        // Animación suave de aparición
        setTimeout(() => {
            modal.style.transition = 'opacity 0.3s ease-in-out';
            modal.style.opacity = '1';
        }, 10);

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }

    // Función para cerrar modal
    function closeModalFunction() {
        console.log('📕 Cerrando modal legal...');

        modal.style.opacity = '0';

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Event listeners
    disclaimerLink.addEventListener('click', openModal);

    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunction);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModalFunction);
    }

    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalFunction();
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModalFunction();
        }
    });

    console.log('✅ Modal legal configurado correctamente');

    // Mostrar información en consola para propósitos legales
    console.log('⚖️ Información legal:');
    console.log('- Servidores: Estados Unidos');
    console.log('- Mercado objetivo: Estadounidense');
    console.log('- Regulación: FDA y agencias estadounidenses');
    console.log('- Alojamiento: Servidores en territorio estadounidense');
});

// Detectar cuando se intenta abrir el modal
window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('legalModal')) {
        console.error('❌ Error en modal legal:', event.error);
    }
});