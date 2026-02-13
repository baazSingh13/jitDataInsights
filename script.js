document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(5, 5, 5, 0.95)';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.background = 'rgba(5, 5, 5, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                navLinks.classList.remove('active');
                if (mobileBtn) mobileBtn.textContent = '☰';
            }
        });
    });
    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Particle Network Animation with Data Transfer
    const canvas = document.getElementById('data-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let packets = []; // "Data packets" moving between nodes
        
        // Configuration
        const config = {
            particleCount: 150, // Reduced slightly for full screen performance
            connectionDistance: 120,
            packetSpawnRate: 0.05, // Chance per frame to spawn a packet on a connection
            packetSpeed: 2,
            colors: ['#00f0ff', '#7000ff', '#ffffff', '#0066ff', '#ff00aa']
        };

        let mouseX = 0, mouseY = 0;

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            // Re-distribute particles if needed, or just keep them
            if (particles.length === 0) initParticles();
        }

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1.0;
                this.vy = (Math.random() - 0.5) * 1.0;
                this.size = Math.random() * 2 + 1;
                this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    const force = (150 - distance) / 150;
                    this.vx += (dx / distance) * force * 0.2;
                    this.vy += (dy / distance) * force * 0.2;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        class Packet {
            constructor(p1, p2) {
                this.p1 = p1;
                this.p2 = p2;
                this.progress = 0;
                this.speed = config.packetSpeed / Math.hypot(p2.x - p1.x, p2.y - p1.y); // Normalize speed
                this.color = '#ffffff'; // White/Bright for data
                this.size = 2;
            }

            update() {
                this.progress += this.speed;
                return this.progress >= 1; // Return true if finished
            }

            draw() {
                const x = this.p1.x + (this.p2.x - this.p1.x) * this.progress;
                const y = this.p1.y + (this.p2.y - this.p1.y) * this.progress;
                
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 5;
                ctx.shadowColor = this.color;
                ctx.arc(x, y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0; // Reset
            }
        }

        function initParticles() {
            particles = [];
            packets = [];
            // Adjust count based on screen size area roughly
            const area = width * height;
            const count = Math.min(200, Math.floor(area / 10000));
            
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Connections and Packets
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.connectionDistance) {
                        // Draw Connection
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 100, 255, ${0.15 * (1 - dist / config.connectionDistance)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();

                        // Chance to spawn packet
                        if (Math.random() < 0.001) { // Very low chance per frame per connection, but many connections
                            packets.push(new Packet(p1, p2));
                        }
                    }
                }
            }

            // Update and draw packets
            packets = packets.filter(packet => {
                const finished = packet.update();
                if (!finished) packet.draw();
                return !finished;
            });

            requestAnimationFrame(animate);
        }

        // Mouse tracking (global)
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Init
        window.addEventListener('resize', resize);
        resize();
        animate();
    }
});
