// Animaciones suaves y elegantes para el header
document.addEventListener('DOMContentLoaded', function() {

    // Crear partículas energéticas mejoradas
    function createSoftParticles() {
        const container = document.querySelector('.particles-container');
        if (!container) return;

        const particleCount = 25; // Aumentado para efecto más impresionante

        for (let i = 0; i < particleCount; i++) {
            createEnhancedParticle(container, i);
        }
    }

    function createEnhancedParticle(container, index) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Tamaño variado para más interés visual
        const size = Math.random() * 8 + 3; // Tamaño más grande
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        // Posición horizontal aleatoria
        particle.style.left = Math.random() * 100 + '%';

        // Retraso aleatorio para efecto escalonado
        particle.style.animationDelay = Math.random() * 8 + 's';

        // Duración variada para movimiento más dinámico
        particle.style.animationDuration = (Math.random() * 4 + 3) + 's';

        // Colores más vibrantes (cyberpunk)
        const colors = [
            { hue: 120, name: 'green' },    // Verde cyberpunk
            { hue: 200, name: 'blue' },     // Azul neón
            { hue: 280, name: 'purple' },   // Púrpura
            { hue: 40, name: 'orange' }     // Naranja
        ];

        const colorScheme = colors[Math.floor(Math.random() * colors.length)];
        const hue = colorScheme.hue + (Math.random() * 20 - 10); // Variación sutil

        // Gradiente más impresionante
        particle.style.background = `radial-gradient(circle, hsla(${hue}, 80%, 60%, 0.9), hsla(${hue + 30}, 70%, 50%, 0.4))`;
        particle.style.boxShadow = `
            0 0 ${size}px hsla(${hue}, 80%, 60%, 0.6),
            0 0 ${size * 2}px hsla(${hue}, 70%, 50%, 0.3),
            inset 0 0 ${size/2}px hsla(${hue + 60}, 90%, 70%, 0.4)
        `;

        // Añadir brillo adicional
        particle.style.filter = 'brightness(1.2)';

        container.appendChild(particle);

        // Recrear partícula cuando termine la animación
        particle.addEventListener('animationiteration', function() {
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 4 + 3) + 's';

            // Ocasionalmente cambiar el color
            if (Math.random() < 0.3) {
                const newColorScheme = colors[Math.floor(Math.random() * colors.length)];
                const newHue = newColorScheme.hue + (Math.random() * 20 - 10);
                particle.style.background = `radial-gradient(circle, hsla(${newHue}, 80%, 60%, 0.9), hsla(${newHue + 30}, 70%, 50%, 0.4))`;
                particle.style.boxShadow = `
                    0 0 ${size}px hsla(${newHue}, 80%, 60%, 0.6),
                    0 0 ${size * 2}px hsla(${newHue}, 70%, 50%, 0.3),
                    inset 0 0 ${size/2}px hsla(${newHue + 60}, 90%, 70%, 0.4)
                `;
            }
        });
    }

    // Hacer logos laterales interactivos
    function makeSideLogosInteractive() {
        const logos = document.querySelectorAll('.side-logo');

        logos.forEach((logo, index) => {
            // Efectos de click suaves
            logo.addEventListener('click', function() {
                this.style.animation = 'none';
                setTimeout(() => {
                    if (this.classList.contains('lifeplus-side-logo')) {
                        this.style.animation = 'bounceDownLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
                    } else {
                        this.style.animation = 'bounceDownRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
                    }
                }, 50);
            });

            // Efectos hover elegantes
            logo.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.1)';
                if (this.classList.contains('lifeplus-side-logo')) {
                    this.style.filter = 'drop-shadow(0 15px 30px rgba(0, 168, 107, 0.5)) brightness(1.1)';
                } else {
                    this.style.filter = 'drop-shadow(0 15px 30px rgba(255, 165, 0, 0.5)) brightness(1.1)';
                }
            });

            logo.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                if (this.classList.contains('lifeplus-side-logo')) {
                    this.style.filter = 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))';
                } else {
                    this.style.filter = 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))';
                }
            });
        });
    }

    // Efecto hover elegante para el botón de contacto
    function enhanceContactButton() {
        const contactBtn = document.querySelector('.contact-btn');
        if (!contactBtn) return;

        contactBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
            this.style.boxShadow = '0 8px 25px rgba(0, 168, 107, 0.3)';
        });

        contactBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
        });

        // Efecto de pulsación suave
        contactBtn.addEventListener('click', function() {
            this.style.animation = 'softPulse 0.8s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 800);
        });
    }

    // Añadir efectos visuales sutiles
    function addSubtleVisualFeedback() {
        const header = document.querySelector('.header');

        header.addEventListener('click', function(e) {
            // Crear onda suave en el punto del click
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(0, 168, 107, 0.3) 0%, transparent 70%);
                left: ${e.offsetX - 15}px;
                top: ${e.offsetY - 15}px;
                pointer-events: none;
                animation: softRipple 0.8s ease-out forwards;
                z-index: 10;
            `;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 800);
        });
    }

    // Crear partículas 3D para el fondo
    function create3DParticles() {
        const container = document.getElementById('threeDParticles');
        if (!container) return;

        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            create3DParticle(container, i);
        }
    }

    function create3DParticle(container, index) {
        const particle = document.createElement('div');
        particle.className = 'particle-3d';

        // Tamaño y forma variados
        const size = Math.random() * 6 + 2;
        const shape = Math.random() > 0.5 ? 'circle' : 'square';

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${shape === 'circle'
                ? `radial-gradient(circle, rgba(0, 168, 107, 0.8), rgba(102, 126, 234, 0.4))`
                : `linear-gradient(45deg, rgba(0, 168, 107, 0.6), rgba(102, 126, 234, 0.3))`};
            border-radius: ${shape === 'circle' ? '50%' : '10%'};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particle3D ${Math.random() * 10 + 15}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            box-shadow: 0 0 ${size * 2}px rgba(0, 168, 107, 0.4);
            filter: brightness(1.2);
        `;

        container.appendChild(particle);

        // Recrear partícula cuando termine la animación
        particle.addEventListener('animationiteration', function() {
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        });
    }

    // Inicializar todas las animaciones mejoradas
    function initSmoothAnimations() {
        createSoftParticles();
        create3DParticles();
        makeSideLogosInteractive();
        enhanceContactButton();
        addSubtleVisualFeedback();

        console.log('✅ Animaciones 3D y cyberpunk mejoradas inicializadas');
    }

    // Retrasar la inicialización para un efecto más natural
    setTimeout(initSmoothAnimations, 500);
});

// Añadir animaciones suaves
const headerStyle = document.createElement('style');
headerStyle.textContent = `
    @keyframes softRipple {
        0% {
            transform: scale(0);
            opacity: 0.8;
        }
        100% {
            transform: scale(8);
            opacity: 0;
        }
    }

    @keyframes softPulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.08);
        }
    }

    @keyframes gentleFloat {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(headerStyle);

// Exportar para uso global
window.HeaderAnimations = {
    createSoftParticles: createSoftParticles,
    createEnhancedParticle: createEnhancedParticle,
    create3DParticles: create3DParticles,
    create3DParticle: create3DParticle,
    makeSideLogosInteractive: makeSideLogosInteractive
};