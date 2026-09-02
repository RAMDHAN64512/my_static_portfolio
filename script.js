/* ==========================================================================
   RAMDHAN TIU - 3D AI CLOUD ENGINEER PORTFOLIO JAVASCRIPT
   Features: Three.js 3D WebGL Background, 3D Tilt Dynamics, AI Terminal Agent,
   Skills Filter, Custom Cursor, Dynamic Counter Stats
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initThreeJS();
    initCustomCursor();
    initTypingEffect();
    initProfile3DTilt();
    initProject3DTilt();
    initSkillsFilter();
    initAITerminal();
    initNavbarScroll();
    initMobileNav();
    initContactForm();
});

/* ==========================================================================
   1. Three.js Interactive 3D WebGL Scene
   ========================================================================== */

let scene, camera, renderer, particlesMesh, floatingNodes = [];
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

function initThreeJS() {
    const canvas = document.getElementById("webgl-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    // Create Scene, Camera, Renderer
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0012);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Dual Color Lighting (Cyan + Orange matching profile photo!)
    const cyanLight = new THREE.PointLight(0x00f0ff, 3, 600);
    cyanLight.position.set(-250, 200, 200);
    scene.add(cyanLight);

    const orangeLight = new THREE.PointLight(0xff6b00, 3, 600);
    orangeLight.position.set(250, -200, 200);
    scene.add(orangeLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Particle Cloud Constellation
    const particleCount = 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f0ff); // Cyan
    const color2 = new THREE.Color(0xff6b00); // Orange
    const color3 = new THREE.Color(0x3b82f6); // Blue

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 1200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1200;

        // Mix particle colors
        const mixedColor = Math.random() < 0.4 ? color1 : (Math.random() < 0.7 ? color2 : color3);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    // Floating 3D Geometric Cloud Server Nodes (Octahedrons & Wireframes)
    const geometries = [
        new THREE.OctahedronGeometry(14, 0),
        new THREE.IcosahedronGeometry(12, 0),
        new THREE.TorusGeometry(10, 3, 16, 32)
    ];

    for (let i = 0; i < 24; i++) {
        const geom = geometries[Math.floor(Math.random() * geometries.length)];
        const isWireframe = Math.random() > 0.3;
        
        const mat = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0x00f0ff : 0xff6b00,
            wireframe: isWireframe,
            transparent: true,
            opacity: isWireframe ? 0.4 : 0.6,
            roughness: 0.2,
            metalness: 0.8
        });

        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 900,
            (Math.random() - 0.5) * 900,
            (Math.random() - 0.5) * 600
        );

        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            0
        );

        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.015,
            rotSpeedY: (Math.random() - 0.5) * 0.015,
            floatSpeed: 0.005 + Math.random() * 0.01,
            floatOffset: Math.random() * Math.PI * 2
        };

        floatingNodes.push(mesh);
        scene.add(mesh);
    }

    // Mouse Listeners for Parallax
    document.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX - window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2);
    });

    window.addEventListener("resize", onWindowResize);

    // Start Animation Loop
    animateThreeJS();
}

function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);

    // Smooth Mouse Parallax
    targetX += (mouseX - targetX) * 0.03;
    targetY += (mouseY - targetY) * 0.03;

    camera.position.x = targetX * 0.2;
    camera.position.y = -targetY * 0.2;
    camera.lookAt(scene.position);

    // Rotate Particles
    if (particlesMesh) {
        particlesMesh.rotation.y += 0.0008;
        particlesMesh.rotation.x += 0.0004;
    }

    // Animate Floating Nodes
    const time = Date.now() * 0.001;
    floatingNodes.forEach(node => {
        node.rotation.x += node.userData.rotSpeedX;
        node.rotation.y += node.userData.rotSpeedY;
        node.position.y += Math.sin(time + node.userData.floatOffset) * 0.4;
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ==========================================================================
   2. Glowing Custom Cursor
   ========================================================================== */

function initCustomCursor() {
    const dot = document.getElementById("cursor-dot");
    const outline = document.getElementById("cursor-outline");
    if (!dot || !outline) return;

    let posX = 0, posY = 0;
    let outlineX = 0, outlineY = 0;

    document.addEventListener("mousemove", (e) => {
        posX = e.clientX;
        posY = e.clientY;
        dot.style.left = `${posX}px`;
        dot.style.top = `${posY}px`;
    });

    function animateCursor() {
        outlineX += (posX - outlineX) * 0.18;
        outlineY += (posY - outlineY) * 0.18;
        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover Scaling for Interactive Elements
    document.querySelectorAll("a, button, .skill-matrix-card, .project-3d-card, .social-card").forEach(el => {
        el.addEventListener("mouseenter", () => {
            outline.style.width = "50px";
            outline.style.height = "50px";
            outline.style.borderColor = "var(--orange-primary)";
        });
        el.addEventListener("mouseleave", () => {
            outline.style.width = "34px";
            outline.style.height = "34px";
            outline.style.borderColor = "var(--cyan-glow)";
        });
    });
}

/* ==========================================================================
   3. Hero Typing Effect
   ========================================================================== */

function initTypingEffect() {
    const typingText = document.getElementById("typing-text");
    if (!typingText) return;

    const phrases = [
        "AI Cloud Infrastructure Engineer",
        "AWS Certified Solutions Architect",
        "Kubernetes & MLOps Specialist",
        "Terraform & GitOps Developer",
        "Multi-Cloud Security Engineer"
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = phrases[phraseIdx];

        if (isDeleting) {
            typingText.textContent = currentPhrase.substring(0, charIdx - 1);
            charIdx--;
        } else {
            typingText.textContent = currentPhrase.substring(0, charIdx + 1);
            charIdx++;
        }

        let typeSpeed = isDeleting ? 40 : 90;

        if (!isDeleting && charIdx === currentPhrase.length) {
            typeSpeed = 2200; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

/* ==========================================================================
   4. Profile Card 3D Tilt Dynamics
   ========================================================================== */

function initProfile3DTilt() {
    const card = document.getElementById("profile-card");
    if (!card) return;

    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -18;
        const rotateY = ((x - centerX) / centerX) * 18;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
}

/* ==========================================================================
   5. Project Cards 3D Tilt
   ========================================================================== */

function initProject3DTilt() {
    document.querySelectorAll(".project-3d-card").forEach(card => {
        const inner = card.querySelector(".project-card-inner");
        if (!inner) return;

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateY = ((x / rect.width) - 0.5) * 16;
            const rotateX = ((y / rect.height) - 0.5) * -16;

            inner.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        card.addEventListener("mouseleave", () => {
            inner.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
        });
    });
}

/* ==========================================================================
   6. Skills Matrix Filtering
   ========================================================================== */

function initSkillsFilter() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const skillCards = document.querySelectorAll(".skill-matrix-card");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.getAttribute("data-filter");

            skillCards.forEach(card => {
                const category = card.getAttribute("data-category");
                if (filter === "all" || category === filter) {
                    card.style.display = "grid";
                    setTimeout(() => { card.style.opacity = "1"; card.style.transform = "translateY(0)"; }, 50);
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "translateY(20px)";
                    setTimeout(() => { card.style.display = "none"; }, 300);
                }
            });
        });
    });
}

/* ==========================================================================
   7. Interactive AI Assistant Terminal
   ========================================================================== */

function initAITerminal() {
    const form = document.getElementById("terminal-form");
    const input = document.getElementById("terminal-input");
    const body = document.getElementById("terminal-body");
    const chips = document.querySelectorAll(".chip-btn");

    if (!form || !input || !body) return;

    // Preset Knowledge Base for Ramdhan Tiu
    const knowledgeBase = [
        {
            keywords: ["skill", "aws", "cloud", "tech", "tools", "stack"],
            response: "Ramdhan Tiu specializes in AWS (EC2, S3, RDS, Lambda, EKS, VPC, IAM), Azure, GCP, Terraform (IaC), Docker, Kubernetes, Linux, Python, and Prometheus/Grafana monitoring."
        },
        {
            keywords: ["k8s", "kubernetes", "docker", "container", "helm", "mlops"],
            response: "Ramdhan builds production EKS/GKE clusters with automated GitOps (ArgoCD), Helm charts, zero-downtime rolling deployments, and Kubeflow MLOps pipelines."
        },
        {
            keywords: ["ai", "era", "machine learning", "bedrock", "finops", "automation"],
            response: "In the AI Era, Ramdhan deploys serverless AI inference endpoints (AWS Bedrock), builds custom FinOps bots to optimize cloud compute costs, and manages GPU cluster scaling."
        },
        {
            keywords: ["project", "work", "portfolio", "built"],
            response: "Ramdhan's featured projects include: 1) AI Multi-Region Serverless Platform, 2) Enterprise EKS Kubernetes MLOps Cluster, 3) Zero-Trust IaC Blueprints, and 4) Autonomous Cloud Cost Optimizer."
        },
        {
            keywords: ["hire", "contact", "email", "linkedin", "github", "reach", "social"],
            response: "You can reach Ramdhan Tiu directly via Email (ramdhan.tiu@example.com), LinkedIn (linkedin.com/in/ramdhantiu), or GitHub (github.com/ramdhantiu). He is open to Cloud Architect and AI Infrastructure roles!"
        }
    ];

    function appendMessage(text, type) {
        const line = document.createElement("div");
        line.className = `terminal-line ${type}`;

        if (type === "user") {
            line.innerHTML = `<span class="prompt">user@guest:~$</span> ${escapeHTML(text)}`;
        } else {
            line.innerHTML = `<span class="prompt">ramdhan-ai:~$</span> ${text}`;
        }

        body.appendChild(line);
        body.scrollTop = body.scrollHeight;
    }

    function handleQuery(userQuery) {
        if (!userQuery.trim()) return;

        appendMessage(userQuery, "user");

        // Simulate AI thinking response delay
        setTimeout(() => {
            const queryLower = userQuery.toLowerCase();
            let matched = knowledgeBase.find(kb => kb.keywords.some(k => queryLower.includes(k)));

            let responseText = matched 
                ? matched.response 
                : `Ramdhan Tiu is an ambitious Cloud & AI Infrastructure Engineer passionate about building secure, scalable systems. Ask me about his AWS skills, Kubernetes projects, or contact info!`;

            appendMessage(responseText, "ai");
        }, 400);
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = input.value;
        input.value = "";
        handleQuery(query);
    });

    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            const query = chip.getAttribute("data-query");
            handleQuery(query);
        });
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   8. Navbar Scroll Effect & Active Link Highlight
   ========================================================================== */

function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        // Active link on scroll
        let currentSection = "";
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 150;
            if (window.scrollY >= secTop) {
                currentSection = sec.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    });
}

/* ==========================================================================
   9. Mobile Navigation Drawer Toggle
   ========================================================================== */

function initMobileNav() {
    const toggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (!toggle || !navLinks) return;

    toggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        const icon = toggle.querySelector("i");
        if (navLinks.classList.contains("active")) {
            icon.className = "fa-solid fa-xmark";
        } else {
            icon.className = "fa-solid fa-bars-staggered";
        }
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            toggle.querySelector("i").className = "fa-solid fa-bars-staggered";
        });
    });
}

/* ==========================================================================
   10. Contact Form Dispatch Handler
   ========================================================================== */

function initContactForm() {
    const form = document.getElementById("contact-form");
    const result = document.getElementById("form-result");

    if (!form || !result) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        result.className = "form-result success";
        result.textContent = "⚡ Dispatching message via secure cloud gateway...";

        setTimeout(() => {
            result.textContent = "✅ Message successfully delivered! Ramdhan will get back to you shortly.";
            form.reset();
        }, 1200);
    });
}