const docReady = () => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => scope.querySelectorAll(selector);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const randomFrom = (list) => list[Math.floor(Math.random() * list.length)];

  // Small audio helper for chimes
  let fxCtx;
  const playChime = (frequency = 660) => {
    if (!('AudioContext' in window || 'webkitAudioContext' in window)) return;
    fxCtx = fxCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (fxCtx.state === 'suspended') {
      fxCtx.resume();
    }
    const osc = fxCtx.createOscillator();
    const gain = fxCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(fxCtx.destination);
    const now = fxCtx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.32);
  };

  let triggerConfetti = () => {};

  // Typewriter intro
  const typewriter = $('#typewriter');
  if (typewriter) {
    const message = "Zunaira, this midnight page carries duas, kudos, and aurora-light from Jillani -- a fellow creative cheering for you.";
    let charIndex = 0;
    const typeLoop = () => {
      if (charIndex <= message.length) {
        typewriter.textContent = message.slice(0, charIndex);
        charIndex += 1;
        const delay = 40 + Math.random() * 60;
        setTimeout(typeLoop, delay);
      }
    };
    typeLoop();
  }

  // Smooth scroll buttons
  $$('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-scroll');
      const el = target ? document.querySelector(target) : null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Heartbeat shimmer (good energy meter)
  const heartbeatEl = $('#heartbeat');
  if (heartbeatEl) {
    const baseRate = 108;
    setInterval(() => {
      const beat = baseRate + Math.sin(Date.now() / 800) * 4 + Math.random() * 1.2;
      heartbeatEl.textContent = Math.round(beat).toString();
    }, 800);
  }

  // Ambient pad toggle
  const audioToggle = $('#audio-toggle');
  if (audioToggle && ('AudioContext' in window || 'webkitAudioContext' in window)) {
    let ambientCtx;
    let padNodes = [];
    let ambientActive = false;

    const startPad = async () => {
      ambientCtx = ambientCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (ambientCtx.state === 'suspended') {
        await ambientCtx.resume();
      }
      const base = 196;
      const intervals = [0, 4, 7];
      padNodes = intervals.map((interval, idx) => {
        const osc = ambientCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = base * 2 ** (interval / 12);
        const gain = ambientCtx.createGain();
        gain.gain.value = 0.03 / (idx + 1);
        const lfo = ambientCtx.createOscillator();
        const lfoGain = ambientCtx.createGain();
        lfo.frequency.value = 0.12 + idx * 0.03;
        lfoGain.gain.value = 20;
        lfo.connect(lfoGain).connect(osc.frequency);
        const panner = ambientCtx.createStereoPanner ? ambientCtx.createStereoPanner() : null;
        if (panner) {
          panner.pan.value = [-0.4, 0, 0.4][idx];
        }
        osc.connect(gain);
        if (panner) {
          gain.connect(panner).connect(ambientCtx.destination);
        } else {
          gain.connect(ambientCtx.destination);
        }
        osc.start();
        lfo.start();
        return { osc, lfo };
      });
      ambientActive = true;
      audioToggle.textContent = 'Pause aurora sound';
      audioToggle.setAttribute('aria-pressed', 'true');
    };

    const stopPad = () => {
      padNodes.forEach(({ osc, lfo }) => {
        osc.stop();
        lfo.stop();
      });
      padNodes = [];
      ambientActive = false;
      audioToggle.textContent = 'Play aurora sound';
      audioToggle.setAttribute('aria-pressed', 'false');
    };

    audioToggle.addEventListener('click', () => {
      if (!ambientActive) {
        startPad();
      } else {
        stopPad();
      }
    });
  } else if (audioToggle) {
    audioToggle.disabled = true;
    audioToggle.textContent = 'Audio unavailable';
  }

  // Culture chips
  const cultureData = [
    {
      title: 'Chai Pause',
      body: 'For every steaming cup you share with friends, may ideas feel lighter and schedules feel kinder.'
    },
    {
      title: 'Poetry Air',
      body: 'Night skies hold Ghazals. May every verse you love find its way into your day playlists.'
    },
    {
      title: 'Bazaar Glow',
      body: 'Lights in night bazaars, fabric stalls, and people smiling back. You deserve that kind of everyday color.'
    },
    {
      title: 'Sky Lantern',
      body: 'Sometimes wishes travel upward. Tonight, an entire aurora of them spells your name.'
    }
  ];
  const cultureTitle = $('#culture-title');
  const cultureBody = $('#culture-body');
  const chips = $$('.chip');
  const setCulture = (idx) => {
    if (!cultureTitle || !cultureBody) return;
    const data = cultureData[idx];
    cultureTitle.textContent = data.title;
    cultureBody.textContent = data.body;
    chips.forEach((chip, chipIdx) => {
      chip.setAttribute('aria-selected', chipIdx === idx);
    });
  };
  if (chips.length) {
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const idx = Number(chip.dataset.chip);
        setCulture(idx);
      });
    });
    setCulture(0);
  }

  // Wishes carousel
  const wishes = [
    'May your mornings start with warm chai, quiet confidence, and playlists that understand your mood.',
    'May every project you touch gather supportive teams and gentle timelines.',
    'May your kindness keep attracting people who guard it with care.',
    'May travel, study, and career doors open right when you knock.',
    'May the cities you walk through feel safe, bright, and welcoming.',
    'May brave conversations meet you with respect and thoughtful listening.',
    'May joy visit like monsoon rain: sudden, refreshing, and generous.'
  ];
  const wishText = $('#wish-text');
  const spellIndex = $('#spell-index');
  if (wishText && spellIndex) {
    let index = 0;
    const swapWish = () => {
      wishText.textContent = wishes[index];
      spellIndex.textContent = String(index + 1).padStart(2, '0');
      index = (index + 1) % wishes.length;
    };
    swapWish();
    setInterval(swapWish, 4200);
  }

  // Quote stream
  const quotes = [
    { text: 'Rain on quiet rooftops sounds like a drumroll for your next brave move.', tag: 'Monsoon note' },
    { text: 'Carry kindness the way we carry tote bags after a bazaar run -- visible and useful.', tag: 'City reminder' },
    { text: 'Every strong voice started as a whisper. Keep sharing yours.', tag: 'Quiet courage' },
    { text: 'Stay curious; even late-night chai dhabas hold ideas worth sketching.', tag: 'Street inspiration' }
  ];
  const quoteText = $('#quote-text');
  const quoteTag = $('#quote-tag');
  const quotePrev = $('#quote-prev');
  const quoteNext = $('#quote-next');
  let quoteIndex = 0;
  const setQuote = (idx) => {
    if (!quoteText || !quoteTag) return;
    const data = quotes[idx];
    quoteText.textContent = data.text;
    quoteTag.textContent = data.tag;
  };
  if (quotePrev && quoteNext) {
    quotePrev.addEventListener('click', () => {
      quoteIndex = (quoteIndex - 1 + quotes.length) % quotes.length;
      setQuote(quoteIndex);
    });
    quoteNext.addEventListener('click', () => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      setQuote(quoteIndex);
    });
    setQuote(quoteIndex);
  }

  // Cheer beacon
  const cheerLines = [
    'Reminder: Zunaira handles big dreams with soft confidence.',
    'Today is yours. If the sky could clap, it would.',
    'You inspire people who have never even met you.',
    'Your kindness is trending in all the right circles.',
    'Here is a digital high-five for every brave step you take.',
    'No rush, no panic. You are exactly on time for your own story.',
    'Consider this a standing ovation in code form.'
  ];
  const cheerButton = $('#cheer-button');
  const cheerFeed = $('#cheer-feed');
  const cheerStatus = $('#cheer-status');
  if (cheerFeed && cheerStatus) {
    const pushCheer = (text) => {
      const item = document.createElement('li');
      item.textContent = text;
      cheerFeed.prepend(item);
      while (cheerFeed.childElementCount > 5) {
        cheerFeed.removeChild(cheerFeed.lastElementChild);
      }
    };

    const dropCheer = (manual = false) => {
      const cheer = randomFrom(cheerLines);
      pushCheer(cheer);
      cheerStatus.textContent = manual ? 'Cheer launched. Another smile unlocked.' : 'Cheer drifted in automatically.';
      if (manual) {
        playChime(740 + Math.random() * 40);
        triggerConfetti();
      }
    };

    if (cheerButton) {
      cheerButton.addEventListener('click', () => dropCheer(true));
    }

    const cheerLoop = () => {
      dropCheer(false);
      setTimeout(cheerLoop, 16000 + Math.random() * 8000);
    };
    setTimeout(cheerLoop, 6000);
  }

  // Mini game logic (Playful Orbit)
  const compliments = [
    'Spark level up! You notice details others skip.',
    'Creative orbit unlocked. Your ideas feel like fresh playlists.',
    'You bring calm energy wherever you go.',
    'Everyone roots for someone who stays kind and curious.',
    'Your focus could light up a whole studio.',
    'You make even ordinary days feel cinematic.',
    'Confidence looks effortless on you tonight.'
  ];
  const gameBoard = $('#game-board');
  const scoreCount = $('#score-count');
  const gameToggle = $('#game-toggle');
  const gameFeed = $('#game-feed');
  if (gameBoard && scoreCount && gameToggle && gameFeed) {
    let gameActive = false;
    let spawnTimer;
    let score = 0;
    const activeOrbs = new Set();

    const updateScore = () => {
      scoreCount.textContent = String(score).padStart(2, '0');
    };

    const pushFeed = (text) => {
      const item = document.createElement('li');
      item.textContent = text;
      gameFeed.prepend(item);
      while (gameFeed.childElementCount > 4) {
        gameFeed.removeChild(gameFeed.lastElementChild);
      }
    };

    const removeOrb = (orb) => {
      if (!orb || !activeOrbs.has(orb)) return;
      activeOrbs.delete(orb);
      orb.remove();
    };

    const spawnOrb = () => {
      if (!gameActive) return;
      const orb = document.createElement('button');
      orb.type = 'button';
      orb.className = 'game-orb';
      const hue = Math.floor(Math.random() * 360);
      orb.style.setProperty('--hue', hue.toString());
      const size = 46;
      const maxX = Math.max(gameBoard.clientWidth - size, 0);
      const maxY = Math.max(gameBoard.clientHeight - size, 0);
      orb.style.left = `${Math.random() * maxX}px`;
      orb.style.top = `${Math.random() * maxY}px`;
      activeOrbs.add(orb);
      orb.addEventListener('click', () => {
        score += 1;
        updateScore();
        playChime(660 + Math.random() * 120);
        pushFeed(randomFrom(compliments));
        removeOrb(orb);
      }, { once: true });
      gameBoard.appendChild(orb);
      setTimeout(() => removeOrb(orb), 2600);
    };

    const stopGame = () => {
      gameActive = false;
      clearInterval(spawnTimer);
      activeOrbs.forEach((orb) => orb.remove());
      activeOrbs.clear();
      gameToggle.textContent = 'Start orbit game';
    };

    const startGame = () => {
      score = 0;
      updateScore();
      gameFeed.innerHTML = '';
      stopGame();
      gameActive = true;
      gameToggle.textContent = 'Stop orbit game';
      spawnOrb();
      spawnTimer = setInterval(spawnOrb, 900);
    };

    gameToggle.addEventListener('click', () => {
      if (gameActive) {
        stopGame();
      } else {
        startGame();
      }
    });
  }

  // Sequence Lab game
  const sequencePads = $$('.sequence-pad');
  const sequenceToggle = $('#sequence-toggle');
  const sequenceStatus = $('#sequence-status');
  const sequenceLevel = $('#sequence-level');
  const sequenceFeed = $('#sequence-feed');
  if (sequencePads.length && sequenceToggle && sequenceStatus && sequenceLevel && sequenceFeed) {
    let sequence = [];
    let allowInput = false;
    let level = 0;
    let playerIndex = 0;
    const padFrequencies = [520, 560, 600, 640];

    const pushSequenceFeed = (message) => {
      const item = document.createElement('li');
      item.textContent = message;
      sequenceFeed.prepend(item);
      while (sequenceFeed.childElementCount > 4) {
        sequenceFeed.removeChild(sequenceFeed.lastElementChild);
      }
    };

    const flashPad = (index) => {
      const pad = sequencePads[index];
      if (!pad) return;
      pad.classList.add('active');
      playChime(padFrequencies[index] || 520);
      setTimeout(() => pad.classList.remove('active'), 260);
    };

    const updateLevel = () => {
      sequenceLevel.textContent = String(level).padStart(2, '0');
    };

    const showSequence = async () => {
      allowInput = false;
      sequenceStatus.textContent = 'Watch the lights...';
      for (const step of sequence) {
        flashPad(step);
        await sleep(520);
      }
      sequenceStatus.textContent = 'Your turn. Tap the pads in order.';
      playerIndex = 0;
      allowInput = true;
    };

    const resetSequence = (message) => {
      sequence = [];
      level = 0;
      updateLevel();
      sequenceStatus.textContent = message;
      allowInput = false;
      sequenceToggle.textContent = 'Start sequence';
    };

    const addStep = () => {
      sequence.push(Math.floor(Math.random() * sequencePads.length));
      level += 1;
      updateLevel();
      showSequence();
      sequenceToggle.textContent = 'Restart sequence';
    };

    const handlePadPress = (index) => {
      if (!allowInput) return;
      flashPad(index);
      if (sequence[playerIndex] === index) {
        playerIndex += 1;
        if (playerIndex === sequence.length) {
          allowInput = false;
          pushSequenceFeed('Level ' + String(level).padStart(2, '0') + ' complete.');
          triggerConfetti();
          setTimeout(() => addStep(), 800);
        }
      } else {
        pushSequenceFeed('Sequence missed. Try again!');
        playChime(420);
        resetSequence('Missed the pattern. Tap start to try again.');
      }
    };

    sequenceToggle.addEventListener('click', () => {
      sequenceFeed.innerHTML = '';
      sequenceStatus.textContent = 'Get ready...';
      sequence = [];
      level = 0;
      updateLevel();
      setTimeout(() => addStep(), 500);
    });

    sequencePads.forEach((pad, idx) => {
      pad.addEventListener('click', () => handlePadPress(idx));
    });
  }

  // Timeline interactions
  const timelineData = [
    {
      title: 'Signal',
      body: 'Word travels fast when someone thoughtful is celebrating a birthday. Tonight, the city tuned in.'
    },
    {
      title: 'Momentum',
      body: 'Friends, mentors, and even strangers root for people who stay humble yet ambitious.'
    },
    {
      title: 'Community',
      body: 'Your circles widen each year -- classrooms, studios, workplaces -- and kindness becomes the constant.'
    },
    {
      title: 'Tomorrow',
      body: 'Whatever dream you pick next, may resources, guidance, and courage line up in your favor.'
    }
  ];
  const timelineTitle = $('#timeline-title');
  const timelineBody = $('#timeline-body');
  const ticks = $$('.timeline-track .tick');
  const progress = $('.timeline-progress');
  const setTimeline = (idx) => {
    if (!timelineTitle || !timelineBody || !progress) return;
    const data = timelineData[idx];
    timelineTitle.textContent = data.title;
    timelineBody.textContent = data.body;
    const percent = ((idx + 1) / timelineData.length) * 100;
    progress.style.setProperty('--progress', `${percent}%`);
    ticks.forEach((tick, buttonIndex) => {
      tick.setAttribute('aria-selected', buttonIndex === idx);
    });
  };
  if (ticks.length) {
    ticks.forEach((tick) => {
      tick.addEventListener('click', () => {
        const idx = Number(tick.dataset.index);
        setTimeline(idx);
      });
    });
    setTimeline(0);
  }

  // Photo tilt interactions (disabled on coarse pointers for mobile stability)
  const photoCards = $$('.photo-card');
  const allowTilt = window.matchMedia('(pointer: fine)').matches;
  if (allowTilt) {
    photoCards.forEach((card, idx) => {
      const baseTilt = idx % 2 === 0 ? -4 : 4;
      card.style.setProperty('--card-tilt', `${baseTilt}deg`);
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotate(${baseTilt}deg) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = `rotate(${baseTilt}deg)`;
      });
    });
  }

  // Future slider
  const dreamSlider = $('#dream-slider');
  const futureTitle = $('#future-title');
  const futureBody = $('#future-body');
  const dreamData = [
    {
      title: 'Learning Sprint',
      body: 'Sign up for that course, workshop, or mentorship you saved. Knowledge looks good on you.'
    },
    {
      title: 'Community Builds',
      body: 'Host small gatherings, volunteer, or mentor juniors. Your perspective could be someone\'s turning point.'
    },
    {
      title: 'Rest + Reset',
      body: 'Plan breaks, road trips, or book binges. Pauses fuel bigger leaps later.'
    }
  ];
  const setDream = (idx) => {
    if (!futureTitle || !futureBody) return;
    const dream = dreamData[idx];
    futureTitle.textContent = dream.title;
    futureBody.textContent = dream.body;
  };
  if (dreamSlider) {
    dreamSlider.addEventListener('input', (event) => {
      setDream(Number(event.target.value));
    });
    setDream(Number(dreamSlider.value));
  }

  // Countdown to next midnight
  const digits = $('#countdown-digits');
  const getNextMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight;
  };
  if (digits) {
    let target = getNextMidnight();
    const updateCountdown = () => {
      const now = new Date();
      if (now >= target) {
        target = getNextMidnight();
      }
      const diff = target - now;
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1_000);
      const pad = (value) => String(value).padStart(2, '0');
      digits.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Section reveal animations
  const sections = $$('.section');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    sections.forEach((section) => observer.observe(section));
  } else {
    sections.forEach((section) => section.classList.add('visible'));
  }

  // Cursor sparkles
  const sparkLayer = $('.cursor-sparkles');
  if (sparkLayer) {
    let lastSpark = 0;
    const spawnSpark = (x, y) => {
      const spark = document.createElement('span');
      spark.className = 'spark';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      sparkLayer.appendChild(spark);
      setTimeout(() => spark.remove(), 700);
    };
    document.addEventListener('pointermove', (event) => {
      const now = Date.now();
      if (now - lastSpark > 40) {
        spawnSpark(event.clientX, event.clientY);
        lastSpark = now;
      }
    });
  }

  // Starfield background
  const starCanvas = document.getElementById('starfield');
  if (starCanvas) {
    const ctx = starCanvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;
    let stars = [];
    let connectors = [];
    const pointer = { x: width / 2, y: height / 2 };

    const randomStar = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      depth: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      alpha: Math.random() * 0.5 + 0.2
    });

    const initStars = () => {
      const count = Math.min(260, Math.floor((width * height) / 4500));
      stars = Array.from({ length: count }, randomStar);
      connectors = stars.slice(0, Math.min(90, stars.length));
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      starCanvas.style.width = `${width}px`;
      starCanvas.style.height = `${height}px`;
      starCanvas.width = width * dpr;
      starCanvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      initStars();
    };

    const drawConnections = () => {
      connectors.forEach((star, index) => {
        for (let j = index + 1; j < index + 4 && j < connectors.length; j += 1) {
          const target = connectors[j];
          const dist = Math.hypot(star.x - target.x, star.y - target.y);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(126, 100, 255, ${1 - dist / 140})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        }
      });
    };

    const animateStars = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.y += star.speed * star.depth;
        star.x += (pointer.x - width / 2) * 0.0004 * star.depth;
        if (star.y > height + 10) {
          star.y = -10;
          star.x = Math.random() * width;
        }
        if (star.x > width + 10) star.x = -10;
        if (star.x < -10) star.x = width + 10;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.depth * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.fill();
      });
      drawConnections();
      requestAnimationFrame(animateStars);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    });
    animateStars();
  }
  // Confetti canvas
  const confettiCanvas = document.getElementById('confetti');
  if (confettiCanvas) {
    const ctx = confettiCanvas.getContext('2d');
    let width;
    let height;
    let dpr = window.devicePixelRatio || 1;
    let pieces = [];
    const colors = ['#ff7ad4', '#7e64ff', '#4de1ff', '#ffd86f'];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      confettiCanvas.style.width = `${width}px`;
      confettiCanvas.style.height = `${height}px`;
      confettiCanvas.width = width * dpr;
      confettiCanvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const spawnPieces = (x = width / 2, y = height / 3) => {
      for (let i = 0; i < 48; i += 1) {
        pieces.push({
          x,
          y,
          size: Math.random() * 6 + 4,
          color: randomFrom(colors),
          velocityX: (Math.random() - 0.5) * 6,
          velocityY: Math.random() * -4 - 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          life: 0,
          ttl: 120
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      pieces.forEach((piece) => {
        piece.life += 1;
        piece.x += piece.velocityX;
        piece.y += piece.velocityY;
        piece.velocityY += 0.05;
        piece.rotation += piece.rotationSpeed;
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.fillStyle = piece.color;
        ctx.globalAlpha = Math.max(0, 1 - piece.life / piece.ttl);
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size / 2);
        ctx.restore();
      });
      pieces = pieces.filter((piece) => piece.life < piece.ttl && piece.y < height + 40);
      requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    render();
    triggerConfetti = (x = width / 2, y = height / 3) => spawnPieces(x, y);
  }

  const auroraDrift = $('#aurora-drift');
  if (auroraDrift) {
    auroraDrift.addEventListener('click', (event) => {
      triggerConfetti(event.clientX, event.clientY);
    });
  }
};

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', docReady)
  : docReady();
