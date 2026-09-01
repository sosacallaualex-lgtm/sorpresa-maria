// JavaScript para la sorpresa interactiva de María

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. VARIABLES Y CONFIGURACIÓN DEL CANVAS
    // ----------------------------------------------------
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = [
        '#f6d6cf', // rose gold light
        '#e8b0a2', // rose gold
        '#b87366', // rose gold dark
        '#fbe6af', // gold light
        '#d4af37', // gold
        '#ff9ebb', // pink light
        '#ff5e7e'  // vibrant pink
    ];

    // Adaptar canvas al redimensionar la ventana
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Clase Partícula
    class Particle {
        constructor(x, y, isBurst = false) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 6 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Si es parte de una explosión, la velocidad es radial y más rápida
            if (isBurst) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 2;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed - 2; // Añadir impulso hacia arriba
            } else {
                this.speedX = Math.random() * 1.5 - 0.75;
                this.speedY = Math.random() * -1.5 - 0.5; // Flotar hacia arriba lentamente
            }
            
            this.opacity = 1;
            this.fadeSpeed = Math.random() * 0.015 + 0.005;
            // Forma: 'circle' (confeti), 'heart' o 'star'
            const shapes = ['circle', 'heart', 'star'];
            this.shape = shapes[Math.floor(Math.random() * shapes.length)];
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 2 - 1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            
            // Gravedad leve para explosiones
            if (Math.abs(this.speedX) > 1) {
                this.speedY += 0.05; // Caída por gravedad
                this.speedX *= 0.98; // Resistencia al aire
            }
            
            this.opacity -= this.fadeSpeed;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            
            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.shape === 'heart') {
                ctx.beginPath();
                const d = this.size * 1.2;
                ctx.moveTo(0, -d / 4);
                ctx.bezierCurveTo(-d / 2, -d * 0.7, -d, -d / 3, 0, d * 0.8);
                ctx.bezierCurveTo(d, -d / 3, d / 2, -d * 0.7, 0, -d / 4);
                ctx.fill();
            } else if (this.shape === 'star') {
                ctx.beginPath();
                const spikes = 5;
                const outerRadius = this.size;
                const innerRadius = this.size / 2;
                let rot = Math.PI / 2 * 3;
                let cx = 0;
                let cy = 0;
                const step = Math.PI / spikes;

                ctx.moveTo(0, -outerRadius);
                for (let i = 0; i < spikes; i++) {
                    cx = Math.cos(rot) * outerRadius;
                    cy = Math.sin(rot) * outerRadius;
                    ctx.lineTo(cx, cy);
                    rot += step;

                    cx = Math.cos(rot) * innerRadius;
                    cy = Math.sin(rot) * innerRadius;
                    ctx.lineTo(cx, cy);
                    rot += step;
                }
                ctx.lineTo(0, -outerRadius);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Función para crear ráfagas
    function createBurst(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, true));
        }
    }

    // Loop de animación
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Spawn pasivo de partículas en la parte inferior
        if (particles.length < 80 && Math.random() < 0.15) {
            particles.push(new Particle(Math.random() * width, height + 10));
        }

        // Actualizar y dibujar partículas
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].opacity <= 0) {
                particles.splice(i, 1);
            } else {
                particles[i].draw();
            }
        }
        
        requestAnimationFrame(animate);
    }
    animate();

    // ----------------------------------------------------
    // 2. SINTETIZADOR DE MÚSICA (WEB AUDIO API)
    // ----------------------------------------------------
    let audioCtx = null;
    let isPlaying = false;
    let schedulerTimer = null;
    let currentNoteIndex = 0;
    let nextNoteTime = 0.0;
    
    const lookahead = 25.0; // Milisegundos de anticipación
    const scheduleAheadTime = 0.1; // Segundos de anticipación para programar

    // Frecuencias extendidas de las notas para Sign of the Times
    const noteFreqs = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
        'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
        'SILENCE': 0
    };

    // Melodía: Harry Styles - Sign of the Times (Caja de Música Instrumental)
    const tempo = 110;
    const beatDuration = 60 / tempo;

    const melody = [
        // "Just stop your crying"
        { note: 'C5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 1.0 },
        // "It's a sign of the times"
        { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 2.0 },
        // "Welcome to the final"
        { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 1.5 }, { note: 'F4', dur: 0.5 },
        // "show"
        { note: 'D4', dur: 2.0 },
        // "Hope you're wearing your best"
        { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 1.5 }, { note: 'F4', dur: 0.5 },
        // "clothes"
        { note: 'D4', dur: 2.0 },
        // "You can't bribe the door on"
        { note: 'C5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 1.0 },
        // "your way to the sky"
        { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 2.0 },
        // "You look pretty good down"
        { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 1.5 }, { note: 'F4', dur: 0.5 },
        // "here"
        { note: 'D4', dur: 2.0 },
        // "But you ain't really"
        { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 1.5 }, { note: 'F4', dur: 0.5 },
        // "good"
        { note: 'D4', dur: 2.0 },
        { note: 'SILENCE', dur: 2.0 } // Pausa antes de repetir
    ];

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Sintetizar tono de caja de música
    function playNote(freq, time, duration) {
        if (freq === 0 || !audioCtx) return;

        // Crear oscilador principal (onda triangular para tono dulce de flauta/caja)
        const osc1 = audioCtx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, time);

        // Crear oscilador secundario (un armónico superior para simular el brillo del metal)
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, time);

        // Crear nodo de ganancia para la envolvente de volumen
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, time);
        
        // Envolvente tipo Caja de Música (Ataque ultra rápido, decaimiento exponencial largo)
        gainNode.gain.linearRampToValueAtTime(0.2, time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.05);

        // Conectar efectos para dar espacio y suavidad (Filtro Biquad)
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);

        // Conexiones
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        
        // Nivel bajo para el armónico brillante
        const osc2Gain = audioCtx.createGain();
        osc2Gain.gain.setValueAtTime(0.04, time);
        osc2.connect(osc2Gain);
        osc2Gain.connect(gainNode);

        gainNode.connect(filter);
        filter.connect(audioCtx.destination);

        // Iniciar y detener
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);
    }

    function scheduler() {
        while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
            scheduleNote(currentNoteIndex, nextNoteTime);
            nextNote();
        }
        schedulerTimer = setTimeout(scheduler, lookahead);
    }

    function scheduleNote(index, time) {
        const item = melody[index];
        const freq = noteFreqs[item.note];
        const duration = item.dur * beatDuration;
        
        if (freq > 0) {
            playNote(freq, time, duration);
        }
    }

    function nextNote() {
        const lastItem = melody[currentNoteIndex];
        const secondsPerBeat = beatDuration;
        nextNoteTime += lastItem.dur * secondsPerBeat;
        
        currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    }

    function startMusic() {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        isPlaying = true;
        nextNoteTime = audioCtx.currentTime + 0.1;
        currentNoteIndex = 0;
        scheduler();
        
        document.getElementById('music-control-btn').classList.add('playing');
    }

    function stopMusic() {
        isPlaying = false;
        clearTimeout(schedulerTimer);
        document.getElementById('music-control-btn').classList.remove('playing');
    }

    function toggleMusic() {
        if (isPlaying) {
            stopMusic();
        } else {
            startMusic();
        }
    }

    // Vincular botón flotante de música
    document.getElementById('music-control-btn').addEventListener('click', toggleMusic);

    // ----------------------------------------------------
    // 3. LOGICA DE INTERACCIÓN GENERAL
    // ----------------------------------------------------
    
    // Botón de Inicio / Entrada
    const btnStart = document.getElementById('btn-start');
    const introOverlay = document.getElementById('intro-overlay');
    const mainContent = document.getElementById('main-content');

    btnStart.addEventListener('click', () => {
        // Iniciar música
        startMusic();
        
        // Transición de salida de la pantalla intro
        introOverlay.style.opacity = '0';
        setTimeout(() => {
            introOverlay.classList.add('hidden');
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = '1';
            
            // Pequeña ráfaga inicial de corazones para recibir a María
            createBurst(width / 2, height / 2, 60);
        }, 1000);
    });

    // Sobre interactivo y Efecto Typewriter para la Carta
    const envelope = document.getElementById('interactive-envelope');
    const waxSeal = document.getElementById('wax-seal');
    const letterContainer = document.getElementById('letter');
    const letterContent = document.querySelector('.letter-content');
    
    let isTyping = false;
    let typingTimeout = null;
    let hasTypedOnce = false;

    // Guardar contenido original de los párrafos de la carta
    const letterItems = letterContent ? Array.from(letterContent.children).map(el => ({
        el: el,
        html: el.innerHTML
    })) : [];

    function showAllLetterText() {
        isTyping = false;
        if (typingTimeout) clearTimeout(typingTimeout);
        
        letterItems.forEach(item => {
            item.el.innerHTML = item.html;
        });
        
        const skipBtn = document.getElementById('btn-skip-typing');
        if (skipBtn) skipBtn.remove();
        hasTypedOnce = true;
    }

    function typeElement(el, fullHtml, speed, onComplete) {
        el.innerHTML = '';
        let i = 0;
        
        function step() {
            if (!isTyping) return;
            
            if (i < fullHtml.length) {
                // Saltar etiquetas HTML como <br> o <span> automáticamente
                if (fullHtml[i] === '<') {
                    const tagEnd = fullHtml.indexOf('>', i);
                    if (tagEnd !== -1) {
                        i = tagEnd + 1;
                    } else {
                        i++;
                    }
                } else {
                    i++;
                }
                
                el.innerHTML = fullHtml.substring(0, i) + '<span class="typing-cursor"></span>';
                if (letterContainer) {
                    letterContainer.scrollTop = letterContainer.scrollHeight;
                }
                typingTimeout = setTimeout(step, speed);
            } else {
                el.innerHTML = fullHtml;
                if (onComplete) onComplete();
            }
        }
        
        step();
    }

    function startTypingLetter() {
        if (hasTypedOnce || isTyping || letterItems.length === 0) return;
        
        isTyping = true;
        
        // Limpiar elementos inicialmente
        letterItems.forEach(item => {
            item.el.innerHTML = '';
        });
        
        // Crear botón de saltar animación
        let skipBtn = document.getElementById('btn-skip-typing');
        if (!skipBtn && letterContent) {
            skipBtn = document.createElement('button');
            skipBtn.id = 'btn-skip-typing';
            skipBtn.className = 'btn-skip-typing';
            skipBtn.innerHTML = '⚡ Mostrar todo el texto';
            skipBtn.addEventListener('click', (evt) => {
                evt.stopPropagation();
                showAllLetterText();
            });
            letterContent.appendChild(skipBtn);
        }
        
        let currentIndex = 0;
        
        function typeNextItem() {
            if (!isTyping) return;
            
            if (currentIndex < letterItems.length) {
                const item = letterItems[currentIndex];
                currentIndex++;
                
                typeElement(item.el, item.html, 20, () => {
                    typingTimeout = setTimeout(typeNextItem, 180);
                });
            } else {
                isTyping = false;
                hasTypedOnce = true;
                const btn = document.getElementById('btn-skip-typing');
                if (btn) btn.remove();
            }
        }
        
        typeNextItem();
    }

    envelope.addEventListener('click', (e) => {
        // Evitar reiniciar si se hace clic dentro del contenido de la carta o en el botón de saltar
        if (e.target.closest('.letter') || e.target.closest('.btn-skip-typing')) return;
        
        const isOpen = envelope.classList.toggle('open');
        
        if (isOpen) {
            const rect = waxSeal ? waxSeal.getBoundingClientRect() : envelope.getBoundingClientRect();
            const posX = rect.left + rect.width / 2;
            const posY = rect.top + rect.height / 2;
            
            // Ráfaga inmediata al romper el sello
            createBurst(posX, posY, 45);
            
            // Ráfaga secundaria suave
            setTimeout(() => {
                createBurst(posX, posY - 20, 25);
            }, 150);

            // Iniciar efecto mecanografía cuando la carta comience a subir
            setTimeout(() => {
                startTypingLetter();
            }, 450);
        } else {
            // Si el sobre se cierra, mostrar el texto completo por si se vuelve a abrir
            showAllLetterText();
        }
    });

    // Pastel y Velas
    const candles = document.querySelectorAll('.candle');
    const wishMessage = document.getElementById('wish-message');
    const cakeInstruction = document.getElementById('cake-instruction');
    let activeCandlesCount = candles.length;

    candles.forEach(candle => {
        candle.addEventListener('click', function() {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                activeCandlesCount--;

                // Efecto de chispa al apagar una vela
                const rect = this.getBoundingClientRect();
                createBurst(rect.left + rect.width / 2, rect.top, 15);

                // Si se apagaron todas las velas
                if (activeCandlesCount === 0) {
                    setTimeout(() => {
                        // Gran explosión de felicidad en la torta
                        const cakeRect = document.querySelector('.cake').getBoundingClientRect();
                        createBurst(cakeRect.left + cakeRect.width / 2, cakeRect.top - 20, 100);
                        
                        // Revelar mensaje de deseos
                        wishMessage.classList.remove('hidden');
                        cakeInstruction.innerHTML = "✨ ¡Todas las velas están apagadas! Has pedido tu deseo. ✨";
                    }, 500);
                }
            }
        });
    });

    // Corazones con deseos
    const heartButtons = document.querySelectorAll('.heart-btn');
    const heartMessages = document.querySelectorAll('.heart-msg');

    heartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover activo de otros botones
            heartButtons.forEach(b => b.classList.remove('active'));
            // Añadir activo al actual
            this.classList.add('active');

            const targetId = this.getAttribute('data-target');
            
            // Ocultar mensajes activos y mostrar el seleccionado
            heartMessages.forEach(msg => {
                msg.classList.add('hidden');
                msg.classList.remove('active');
            });
            
            const targetMsg = document.getElementById(targetId);
            if (targetMsg) {
                targetMsg.classList.remove('hidden');
                // Timeout para permitir transiciones correctas
                setTimeout(() => {
                    targetMsg.classList.add('active');
                }, 50);
            }
            
            // Desvanecer el marcador de posición
            document.getElementById('heart-msg-placeholder').classList.add('hidden');
            document.getElementById('heart-msg-placeholder').classList.remove('active');

            // Crear explosión de corazones cerca del botón clickeado
            const rect = this.getBoundingClientRect();
            createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
        });
    });

    // ----------------------------------------------------
    // 4. INCLINACIÓN 3D (TILT EFFECT) PARA TARJETAS POLAROID
    // ----------------------------------------------------
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    
    polaroidCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -14;
            const rotateY = ((x - centerX) / centerX) * 14;
            
            card.style.transform = `perspective(1000px) scale(1.07) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
});
