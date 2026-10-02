/**
 * AURA PLATFORM - MAIN JAVASCRIPT ENGINE (v3.0)
 * Bugatti-Style Silky Inertial Smooth Scroll + 3D Rotation on Scroll Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State
  let currentLang = 'ka';
  let soundEnabled = true;
  let audioCtx = null;
  let pricingIsYearly = false;

  // Initialize Canvas
  if (window.HeroCanvas) {
    new window.HeroCanvas('hero-canvas');
  }

  // --------------------------------------------------------------------------
  // 2. BUGATTI SILKY SMOOTH INERTIAL SCROLL & 3D ROTATION ENGINE
  // --------------------------------------------------------------------------
  class BugattiScrollEngine {
    constructor() {
      this.currentY = window.pageYOffset || 0;
      this.targetY = window.pageYOffset || 0;
      this.ease = 0.068; // Silky luxury damping coefficient (Bugatti-style)
      this.isScrolling = false;
      this.velocity = 0;
      this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      this.rotateElements = document.querySelectorAll('.scroll-rotate-item');
      this.gyroRings = document.querySelectorAll('.gyro-ring');
      this.gyroAngle = 0;

      this.init();
    }

    init() {
      // Desktop wheel interception with smooth momentum
      if (!this.isTouch) {
        window.addEventListener('wheel', (e) => {
          // Do not hijack scroll if inside scrollable console or open drawer
          if (e.target.closest('.console-logs, .mobile-drawer')) {
            return;
          }
          e.preventDefault();
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          this.targetY += e.deltaY * 0.95;
          this.targetY = Math.max(0, Math.min(this.targetY, maxScroll));

          if (!this.isScrolling) {
            this.isScrolling = true;
            this.rafId = requestAnimationFrame(() => this.loop());
          }
        }, { passive: false });
      }

      // Touch & native scroll synchronization
      let lastScrollY = window.pageYOffset;
      window.addEventListener('scroll', () => {
        const nowY = window.pageYOffset;
        if (this.isTouch || !this.isScrolling) {
          this.velocity = nowY - lastScrollY;
          lastScrollY = nowY;
          this.currentY = nowY;
          this.targetY = nowY;
          this.update3DRotations(this.velocity);
        }
        this.updateGlobalProgress(nowY);
      }, { passive: true });
    }

    loop() {
      const diff = this.targetY - this.currentY;
      this.velocity = diff * this.ease;
      this.currentY += this.velocity;

      window.scrollTo(0, this.currentY);
      this.update3DRotations(this.velocity);
      this.updateGlobalProgress(this.currentY);

      if (Math.abs(diff) > 0.4) {
        this.rafId = requestAnimationFrame(() => this.loop());
      } else {
        this.currentY = this.targetY;
        window.scrollTo(0, this.currentY);
        this.velocity = 0;
        this.update3DRotations(0);
        this.isScrolling = false;
      }
    }

    update3DRotations(vel) {
      // 1. Rotate items based on scroll velocity (Aerodynamic 3D tilt)
      const clampedVel = Math.max(-14, Math.min(14, vel));
      const rotX = clampedVel * 0.12;
      const rotZ = clampedVel * 0.025;

      // 2. Viewport-based 3D entry rotation for all rotating cards
      const vh = window.innerHeight;
      this.rotateElements.forEach(el => {
        // Only calculate if in view
        const rect = el.getBoundingClientRect();
        if (rect.bottom >= -50 && rect.top <= vh + 50) {
          const centerOffset = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
          const dynamicAngleX = Math.max(-10, Math.min(10, centerOffset * 6 + rotX));
          const dynamicAngleY = Math.max(-5, Math.min(5, centerOffset * -3));
          
          el.style.transform = `perspective(1000px) rotateX(${dynamicAngleX}deg) rotateY(${dynamicAngleY}deg) rotateZ(${rotZ}deg)`;
        }
      });

      // 3. Accelerate Hero Gyroscope 3D rotation during scroll
      this.gyroAngle += 0.5 + Math.abs(clampedVel) * 0.35;
      this.gyroRings.forEach((ring, idx) => {
        const factor = (idx + 1) * 0.8;
        ring.style.transform = `rotate3d(1, 1, 1, ${this.gyroAngle * factor}deg)`;
      });
    }

    updateGlobalProgress(scrollTop) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      // Top linear progress bar
      const topBar = document.getElementById('scroll-progress-bar-top');
      if (topBar) {
        topBar.style.width = `${progress * 100}%`;
      }

      // Back to top circular ring & button visibility
      const backBtn = document.getElementById('back-to-top');
      const circle = document.getElementById('scroll-progress-circle');
      if (backBtn) {
        if (scrollTop > 350) {
          backBtn.classList.add('visible');
        } else {
          backBtn.classList.remove('visible');
        }
      }
      if (circle) {
        const circumference = 140;
        circle.style.strokeDashoffset = circumference - (progress * circumference);
      }

      // Parallax glow orbs
      const glowOrbs = document.querySelectorAll('.glow-orb');
      glowOrbs.forEach((orb, i) => {
        const speed = (i + 1) * 0.05;
        orb.style.transform = `translateY(${scrollTop * speed}px)`;
      });
    }

    scrollToTarget(targetY) {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      this.targetY = Math.max(0, Math.min(targetY, maxScroll));
      if (!this.isScrolling) {
        this.isScrolling = true;
        this.loop();
      }
    }
  }

  const smoothScrollEngine = new BugattiScrollEngine();

  // Smooth scroll for anchor navigation links with navbar offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const navOffset = 70;
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navOffset;

          smoothScrollEngine.scrollToTarget(offsetPosition);
        }
      }
    });
  });

  // Back to top button click
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      smoothScrollEngine.scrollToTarget(0);
      playSynthSound('click');
    });
  }

  // --------------------------------------------------------------------------
  // 3. WEB AUDIO API SYNTH (SUBTLE SCI-FI SFX)
  // --------------------------------------------------------------------------
  function playSynthSound(type = 'click') {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.04);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.07);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const chordOsc = audioCtx.createOscillator();
          const chordGain = audioCtx.createGain();
          chordOsc.connect(chordGain);
          chordGain.connect(audioCtx.destination);

          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(freq, now + i * 0.05);
          chordGain.gain.setValueAtTime(0.035, now + i * 0.05);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.3);

          chordOsc.start(now + i * 0.05);
          chordOsc.stop(now + i * 0.05 + 0.3);
        });
      }
    } catch (e) {
      // AudioContext policy
    }
  }

  // Sound Toggle Button
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
        showToast(currentLang === 'ka' ? 'ხმოვანი ეფექტები ჩართულია 🔊' : 'Audio SFX Enabled 🔊');
        playSynthSound('click');
      } else {
        soundIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
        showToast(currentLang === 'ka' ? 'ხმოვანი ეფექტები გამორთულია 🔇' : 'Audio SFX Muted 🔇');
      }
    });
  }

  // Attach sound listeners
  document.querySelectorAll('button, .nav-link, .filter-btn, .tab-nav-btn, .btn-util, .faq-trigger, .code-lang-btn').forEach(el => {
    el.addEventListener('mouseenter', () => playSynthSound('hover'), { passive: true });
    el.addEventListener('click', () => playSynthSound('click'), { passive: true });
  });

  // --------------------------------------------------------------------------
  // 4. LANGUAGE SWITCHER (GEORGIAN <-> ENGLISH)
  // --------------------------------------------------------------------------
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langCurrentLabel = document.getElementById('lang-current-label');

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    if (langCurrentLabel) {
      langCurrentLabel.textContent = lang === 'ka' ? 'KA' : 'EN';
    }

    const dict = (window.translations || (typeof translations !== 'undefined' ? translations : null))?.[lang];
    if (!dict) {
      console.warn('Translations dictionary not available yet');
      return;
    }

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update all placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Refresh pricing in active currency mode
    updatePricingDisplay();
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const nextLang = currentLang === 'ka' ? 'en' : 'ka';
      setLanguage(nextLang);
      playSynthSound('click');
      showToast(nextLang === 'ka' ? 'ენა შეიცვალა: ქართული 🇬🇪' : 'Language switched: English 🇺🇸');
    });
  }

  // --------------------------------------------------------------------------
  // 5. CUSTOM CURSOR (DESKTOP)
  // --------------------------------------------------------------------------
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorCircle = document.querySelector('.cursor-circle');

  if (cursorDot && cursorCircle && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = -100, mouseY = -100;
    let circleX = -100, circleY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }, { passive: true });

    function renderCursor() {
      circleX += (mouseX - circleX) * 0.2;
      circleY += (mouseY - circleY) * 0.2;
      cursorCircle.style.left = `${circleX}px`;
      cursorCircle.style.top = `${circleY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    const hoverTargets = document.querySelectorAll('a, button, input, textarea, select, .feature-card, .bento-card, .pricing-card, .faq-trigger');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'), { passive: true });
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'), { passive: true });
    });
  }

  // --------------------------------------------------------------------------
  // 6. NAVBAR SCROLL EFFECT & MOBILE MENU
  // --------------------------------------------------------------------------
  const navbar = document.querySelector('.header-navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('open', isOpen);
    });

    mobileDrawer.querySelectorAll('.mobile-nav-link, .btn-primary').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('open');
      });
    });
  }

  // Active link highlighter on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset + 140;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 7. 3D CARD TILT & RADIAL CURSOR GLOW
  // --------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.tilt-card, .feature-card, .bento-card, .pricing-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    }, { passive: true });
  });

  // --------------------------------------------------------------------------
  // 8. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -25px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --------------------------------------------------------------------------
  // 9. ANIMATED NUMBER COUNTERS
  // --------------------------------------------------------------------------
  const counterElements = document.querySelectorAll('[data-count]');
  let countersStarted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        animateCounters();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-strip-section');
  if (statsSection) {
    countObserver.observe(statsSection);
  }

  function animateCounters() {
    counterElements.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-count'));
      const isDecimal = target % 1 !== 0;
      const duration = 2000;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeOut * target;

        counter.textContent = isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  // --------------------------------------------------------------------------
  // 10. FEATURE FILTER TABS
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const featureCards = document.querySelectorAll('.feature-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      featureCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeInCard 0.4s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 11. INTERACTIVE BENCHMARK SHOWCASE SIMULATOR
  // --------------------------------------------------------------------------
  const tabNavBtns = document.querySelectorAll('.tab-nav-btn');
  const btnRunBenchmark = document.getElementById('btn-run-benchmark');
  const consoleLogs = document.getElementById('console-logs');
  const consoleProgressBar = document.getElementById('console-progress-bar');
  const metricLatency = document.getElementById('metric-latency');
  const metricAccuracy = document.getElementById('metric-accuracy');
  const metricThroughput = document.getElementById('metric-throughput');

  let activeTab = 'neural';
  let isBenchmarking = false;

  tabNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isBenchmarking) return;
      tabNavBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');

      addConsoleLine('SYSTEM', `Target module loaded: [${activeTab.toUpperCase()}_CORE_V2]`, 'log-cyan');
    });
  });

  function addConsoleLine(tag, message, colorClass = '') {
    if (!consoleLogs) return;
    const time = new Date().toLocaleTimeString('en-GB');
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `
      <span class="log-time">[${time}]</span>
      <span class="log-tag">[${tag}]</span>
      <span class="${colorClass}">${message}</span>
    `;
    consoleLogs.appendChild(line);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
  }

  if (btnRunBenchmark) {
    btnRunBenchmark.addEventListener('click', () => {
      if (isBenchmarking) return;
      isBenchmarking = true;
      btnRunBenchmark.disabled = true;
      btnRunBenchmark.innerHTML = `
        <svg class="spinner-svg" style="animation: spin 1s linear infinite; width:18px; height:18px; margin-right:8px; display:inline-block;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        <span data-i18n="showcase_running">${currentLang === 'ka' ? 'მუშავდება...' : 'Computing Pipeline...'}</span>
      `;

      addConsoleLine('BENCHMARK', `Initializing synthetic stress workload for [${activeTab.toUpperCase()}]...`, 'log-cyan');
      consoleProgressBar.style.width = '0%';

      let step = 0;
      const steps = [
        { pct: 25, tag: 'INIT', msg: 'Allocating virtual GPU tensors & memory buffers...' },
        { pct: 55, tag: 'PROCESS', msg: 'Executing 128-layer parallel convolutional forward pass...' },
        { pct: 85, tag: 'VERIFY', msg: 'Validating cryptographic consensus & zero-loss checksums...' },
        { pct: 100, tag: 'COMPLETED', msg: 'Workload execution verified. 0 dropped packets. Latency: 6.8ms.', color: 'log-success' }
      ];

      const interval = setInterval(() => {
        if (step < steps.length) {
          const currentStep = steps[step];
          consoleProgressBar.style.width = `${currentStep.pct}%`;
          addConsoleLine(currentStep.tag, currentStep.msg, currentStep.color || '');
          playSynthSound('hover');

          if (metricLatency) metricLatency.textContent = (5.8 + Math.random() * 2).toFixed(1) + 'ms';
          if (metricAccuracy) metricAccuracy.textContent = (99.95 + Math.random() * 0.04).toFixed(2) + '%';
          if (metricThroughput) metricThroughput.textContent = (3.8 + Math.random() * 0.6).toFixed(1) + ' GB/s';

          step++;
        } else {
          clearInterval(interval);
          isBenchmarking = false;
          btnRunBenchmark.disabled = false;
          btnRunBenchmark.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; display:inline-block;">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span data-i18n="showcase_btn_run">${currentLang === 'ka' ? 'სიმულაციის გაშვება' : 'Execute Benchmark'}</span>
          `;
          playSynthSound('success');
          showToast(currentLang === 'ka' ? 'ტესტირება წარმატებით დასრულდა! ⚡' : 'Benchmark executed successfully! ⚡');
        }
      }, 550);
    });
  }

  // --------------------------------------------------------------------------
  // 12. DEVELOPER CODE QUICKSTART TABS & COPY
  // --------------------------------------------------------------------------
  const codeSnippets = {
    curl: `curl -X POST https://api.aura-platform.io/v2/neural/inference \\
  -H "Authorization: Bearer aura_live_key_9823f4b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "aura-quantum-ultra",
    "prompt": "Optimize distributed cluster fabric",
    "stream": true,
    "temperature": 0.2
  }'`,
    js: `import { AuraClient } from '@aura/sdk';

const aura = new AuraClient({ apiKey: process.env.AURA_API_KEY });

// Execute sub-10ms neural inference
const stream = await aura.neural.stream({
  model: 'aura-quantum-ultra',
  payload: { clusterId: 'edge-eu-central-1', throughput: 'auto' }
});

for await (const chunk of stream) {
  process.stdout.write(chunk.delta);
}`,
    python: `from aura_ai import AuraClient

client = AuraClient(api_key="aura_live_key_9823f4b")

# Autonomous orchestrator call
response = client.neural.compute(
    model="aura-quantum-ultra",
    tasks=["auto_scale", "zero_trust_verify"],
    precision="fp16"
)

print(f"Optimal cluster latency: {response.latency_ms}ms")`,
    rust: `use aura_rs::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new("aura_live_key_9823f4b");
    
    let result = client.neural()
        .model("aura-quantum-ultra")
        .dispatch().await?;
        
    println!("Execution completed: {:?}", result.status);
    Ok(())
}`
  };

  const codeLangBtns = document.querySelectorAll('.code-lang-btn');
  const codeDisplayEl = document.getElementById('code-display');
  const btnCopyCode = document.getElementById('btn-copy-code');
  let currentCodeLang = 'curl';

  function renderCodeSnippet() {
    if (!codeDisplayEl) return;
    const raw = codeSnippets[currentCodeLang] || codeSnippets.curl;
    codeDisplayEl.textContent = raw;
  }

  codeLangBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      codeLangBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCodeLang = btn.getAttribute('data-lang');
      renderCodeSnippet();
      playSynthSound('click');
    });
  });

  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      const raw = codeSnippets[currentCodeLang] || '';
      navigator.clipboard.writeText(raw).then(() => {
        playSynthSound('success');
        const span = btnCopyCode.querySelector('span');
        const copyLabel = currentLang === 'ka' ? 'დაკოპირდა! ✓' : 'Copied! ✓';
        if (span) span.textContent = copyLabel;
        showToast(currentLang === 'ka' ? 'კოდის ფრაგმენტი დაკოპირდა! 💻' : 'Code snippet copied! 💻');
        setTimeout(() => {
          if (span) {
            span.textContent = currentLang === 'ka' ? 'კოდის კოპირება' : 'Copy Snippet';
          }
        }, 2200);
      });
    });
  }

  renderCodeSnippet();

  // --------------------------------------------------------------------------
  // 13. PRICING MONTHLY / YEARLY TOGGLE
  // --------------------------------------------------------------------------
  const pricingSwitch = document.getElementById('pricing-switch');
  const labelMonthly = document.getElementById('label-monthly');
  const labelYearly = document.getElementById('label-yearly');

  const prices = {
    starter: { monthly: '$29', yearly: '$23' },
    pro: { monthly: '$89', yearly: '$71' },
    enterprise: { monthly: '$249', yearly: '$199' }
  };

  function updatePricingDisplay() {
    const starterEl = document.getElementById('price-starter');
    const proEl = document.getElementById('price-pro');
    const entEl = document.getElementById('price-ent');

    const mode = pricingIsYearly ? 'yearly' : 'monthly';
    if (starterEl) starterEl.textContent = prices.starter[mode];
    if (proEl) proEl.textContent = prices.pro[mode];
    if (entEl) entEl.textContent = prices.enterprise[mode];

    if (pricingSwitch) {
      pricingSwitch.classList.toggle('active', pricingIsYearly);
    }
    if (labelMonthly) labelMonthly.classList.toggle('active', !pricingIsYearly);
    if (labelYearly) labelYearly.classList.toggle('active', pricingIsYearly);
  }

  if (pricingSwitch) {
    pricingSwitch.addEventListener('click', () => {
      pricingIsYearly = !pricingIsYearly;
      updatePricingDisplay();
      playSynthSound('click');
      showToast(pricingIsYearly 
        ? (currentLang === 'ka' ? 'წლიური გეგმა გააქტიურებულია (-20% 🎉)' : 'Yearly billing activated (20% off 🎉)')
        : (currentLang === 'ka' ? 'ყოველთვიური გეგმა გააქტიურებულია' : 'Monthly billing activated')
      );
    });
  }

  if (labelMonthly) {
    labelMonthly.addEventListener('click', () => {
      if (pricingIsYearly) {
        pricingIsYearly = false;
        updatePricingDisplay();
        playSynthSound('click');
      }
    });
  }

  if (labelYearly) {
    labelYearly.addEventListener('click', () => {
      if (!pricingIsYearly) {
        pricingIsYearly = true;
        updatePricingDisplay();
        playSynthSound('click');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 14. INTERACTIVE FAQ ACCORDION
  // --------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close other items for sleek clean accordion feel
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('open');
        });

        item.classList.toggle('open', !isOpen);
        playSynthSound('click');
      });
    }
  });

  // --------------------------------------------------------------------------
  // 15. CONTACT FORM VALIDATION & CONFETTI CELEBRATION
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const serviceChips = document.querySelectorAll('.chip-label');
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const formSuccessCard = document.getElementById('form-success-card');
  const btnResetForm = document.getElementById('btn-reset-form');

  serviceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      serviceChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      const radio = chip.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'contact@aura-platform.io';
      navigator.clipboard.writeText(email).then(() => {
        playSynthSound('success');
        showToast(currentLang === 'ka' ? 'ელ-ფოსტა დაკოპირდა! 📋' : 'Email copied to clipboard! 📋');
      }).catch(() => {
        showToast(email);
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasError = false;
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const messageInput = document.getElementById('form-message');

      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('has-error');
        hasError = true;
      } else {
        nameInput.closest('.form-group').classList.remove('has-error');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('has-error');
        hasError = true;
      } else {
        emailInput.closest('.form-group').classList.remove('has-error');
      }

      if (!messageInput.value.trim()) {
        messageInput.closest('.form-group').classList.add('has-error');
        hasError = true;
      } else {
        messageInput.closest('.form-group').classList.remove('has-error');
      }

      if (hasError) {
        showToast(currentLang === 'ka' ? 'გთხოვთ შეავსოთ ველები სწორად!' : 'Please fill all required fields correctly!');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-contact');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:18px; height:18px; margin-right:8px; display:inline-block;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        <span>${currentLang === 'ka' ? 'იგზავნება...' : 'Transmitting...'}</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>${currentLang === 'ka' ? 'შეტყობინების გაგზავნა' : 'Dispatch Message'}</span>`;
        if (formSuccessCard) {
          formSuccessCard.classList.add('active');
        }
        playSynthSound('success');
        triggerConfetti();
        showToast(currentLang === 'ka' ? 'შეტყობინება წარმატებით გაიგზავნა! 🚀' : 'Message dispatched successfully! 🚀');
      }, 900);
    });
  }

  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      if (formSuccessCard) formSuccessCard.classList.remove('active');
      if (contactForm) contactForm.reset();
    });
  }

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input && input.value.trim()) {
        playSynthSound('success');
        showToast(currentLang === 'ka' ? 'გმადლობთ გამოწერისთვის! 🎉' : 'Thank you for subscribing! 🎉');
        input.value = '';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 16. PURE JS CONFETTI PARTICLE SYSTEM
  // --------------------------------------------------------------------------
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = 100;
    const pieces = [];
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b'];

    for (let i = 0; i < count; i++) {
      pieces.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 1.2) * 14,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    let confettiAnimId;
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.009;

        if (p.opacity > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(p.opacity, 0);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        confettiAnimId = requestAnimationFrame(renderConfetti);
      } else {
        cancelAnimationFrame(confettiAnimId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    renderConfetti();
  }

  // --------------------------------------------------------------------------
  // 17. TOAST NOTIFICATION UTILITY
  // --------------------------------------------------------------------------
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // 18. INTERACTIVE DEMO PREVIEW MODAL
  // --------------------------------------------------------------------------
  const demoModal = document.getElementById('demo-modal');
  const btnOpenDemo = document.getElementById('btn-open-demo');
  const btnCloseModal = document.getElementById('modal-close-btn');

  if (btnOpenDemo && demoModal) {
    btnOpenDemo.addEventListener('click', (e) => {
      e.preventDefault();
      demoModal.classList.add('open');
      playSynthSound('click');
    });
  }

  function closeModal() {
    if (demoModal) {
      demoModal.classList.remove('open');
    }
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeModal);
  }

  if (demoModal) {
    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Apply default language
  setLanguage('ka');
});
