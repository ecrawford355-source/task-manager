/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const WORLD = {
  width: 5200,
  height: 720,
  floor: 584,
  gravity: 2150,
  maxFall: 1280,
  moveSpeed: 360,
  acceleration: 4200,
  friction: 3100,
  jumpVelocity: -760,
  doubleJumpVelocity: -690
};

const PLAYER_START = { x: 90, y: 420, w: 38, h: 58 };
const CONTROL_KEYS = ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space', 'ArrowUp', 'KeyW'];

const LEVEL = {
  platforms: [
    { x: 0, y: WORLD.floor, w: 680, h: 80, kind: 'street' },
    { x: 790, y: WORLD.floor, w: 430, h: 80, kind: 'street' },
    { x: 1320, y: WORLD.floor, w: 640, h: 80, kind: 'street' },
    { x: 2110, y: WORLD.floor, w: 620, h: 80, kind: 'street' },
    { x: 2870, y: WORLD.floor, w: 620, h: 80, kind: 'street' },
    { x: 3610, y: WORLD.floor, w: 500, h: 80, kind: 'street' },
    { x: 4230, y: WORLD.floor, w: 970, h: 80, kind: 'street' },
    { x: 390, y: 444, w: 240, h: 28, kind: 'glass' },
    { x: 890, y: 392, w: 250, h: 28, kind: 'glass' },
    { x: 1420, y: 430, w: 260, h: 28, kind: 'glass' },
    { x: 1750, y: 340, w: 210, h: 28, kind: 'glass' },
    { x: 2220, y: 405, w: 310, h: 28, kind: 'glass' },
    { x: 2920, y: 380, w: 260, h: 28, kind: 'glass' },
    { x: 3330, y: 306, w: 280, h: 28, kind: 'glass' },
    { x: 3710, y: 438, w: 250, h: 28, kind: 'glass' },
    { x: 4260, y: 392, w: 260, h: 28, kind: 'glass' },
    { x: 4610, y: 312, w: 270, h: 28, kind: 'glass' }
  ],
  spikes: [
    { x: 565, y: WORLD.floor - 28, w: 90, h: 28 },
    { x: 1505, y: WORLD.floor - 28, w: 110, h: 28 },
    { x: 2410, y: WORLD.floor - 28, w: 130, h: 28 },
    { x: 3125, y: WORLD.floor - 28, w: 110, h: 28 },
    { x: 3910, y: WORLD.floor - 28, w: 120, h: 28 }
  ],
  enemies: [
    { x: 930, y: WORLD.floor - 46, w: 44, h: 42, min: 830, max: 1160, speed: 92, dir: 1 },
    { x: 1630, y: WORLD.floor - 46, w: 44, h: 42, min: 1370, max: 1900, speed: 116, dir: -1 },
    { x: 2310, y: WORLD.floor - 46, w: 44, h: 42, min: 2150, max: 2680, speed: 128, dir: 1 },
    { x: 3000, y: 334, w: 44, h: 42, min: 2920, max: 3130, speed: 82, dir: 1 },
    { x: 3780, y: WORLD.floor - 46, w: 44, h: 42, min: 3630, max: 4070, speed: 132, dir: -1 },
    { x: 4480, y: WORLD.floor - 46, w: 44, h: 42, min: 4280, max: 4920, speed: 146, dir: 1 }
  ],
  shards: [
    { x: 440, y: 386 }, { x: 520, y: 386 }, { x: 600, y: 386 },
    { x: 930, y: 334 }, { x: 1010, y: 334 }, { x: 1090, y: 334 },
    { x: 1390, y: 526 }, { x: 1515, y: 372 }, { x: 1640, y: 526 },
    { x: 1790, y: 282 }, { x: 1880, y: 282 },
    { x: 2240, y: 348 }, { x: 2350, y: 348 }, { x: 2470, y: 348 },
    { x: 2980, y: 322 }, { x: 3100, y: 322 },
    { x: 3370, y: 248 }, { x: 3470, y: 248 }, { x: 3570, y: 248 },
    { x: 3750, y: 380 }, { x: 3890, y: 380 },
    { x: 4310, y: 334 }, { x: 4430, y: 334 },
    { x: 4650, y: 254 }, { x: 4760, y: 254 }, { x: 4870, y: 254 }
  ],
  goal: { x: 5070, y: WORLD.floor - 132, w: 64, h: 132 }
};

function makeInitialGame() {
  return {
    player: { ...PLAYER_START, vx: 0, vy: 0, onGround: false, jumps: 0, facing: 1, invincible: 0 },
    enemies: LEVEL.enemies.map(enemy => ({ ...enemy })),
    collected: new Set(),
    score: 0,
    lives: 3,
    time: 0,
    cameraX: 0,
    won: false,
    gameOver: false,
    comboText: '',
    shake: 0
  };
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function NeonRunner() {
  const canvasRef = useRef(null);
  const gameRef = useRef(makeInitialGame());
  const keysRef = useRef({ left: false, right: false, jump: false, jumpQueued: false });
  const audioRef = useRef(null);
  const loopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [hud, setHud] = useState({ score: 0, lives: 3, shards: 0, total: LEVEL.shards.length, won: false, gameOver: false, music: false });

  // The game loop intentionally owns its animation lifecycle; mutable refs keep input and physics current without restarting RAF.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.min(1120, rect.width);
      const height = Math.max(420, Math.min(680, window.innerHeight - 170));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onKeyDown = (event) => {
      if (!CONTROL_KEYS.includes(event.code)) return;
      event.preventDefault();
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') keysRef.current.left = true;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') keysRef.current.right = true;
      if (['Space', 'ArrowUp', 'KeyW'].includes(event.code) && !keysRef.current.jump) {
        keysRef.current.jumpQueued = true;
        keysRef.current.jump = true;
      }
    };

    const onKeyUp = (event) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') keysRef.current.left = false;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') keysRef.current.right = false;
      if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) keysRef.current.jump = false;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const step = (timestamp) => {
      const previous = lastTimeRef.current || timestamp;
      const dt = Math.min(0.033, (timestamp - previous) / 1000);
      lastTimeRef.current = timestamp;
      updateGame(dt, canvas);
      drawGame(ctx, canvas, gameRef.current);
      loopRef.current = requestAnimationFrame(step);
    };
    loopRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      cancelAnimationFrame(loopRef.current);
      stopMusic();
    };
  }, []);

  const updateHud = () => {
    const game = gameRef.current;
    setHud({
      score: game.score,
      lives: game.lives,
      shards: game.collected.size,
      total: LEVEL.shards.length,
      won: game.won,
      gameOver: game.gameOver,
      music: Boolean(audioRef.current)
    });
  };

  const queueJump = () => {
    keysRef.current.jumpQueued = true;
    keysRef.current.jump = true;
  };

  const setControl = (control, active) => {
    keysRef.current[control] = active;
    if (control === 'jump' && active) queueJump();
  };

  const resetGame = () => {
    gameRef.current = makeInitialGame();
    lastTimeRef.current = performance.now();
    updateHud();
  };

  const hurtPlayer = () => {
    const game = gameRef.current;
    if (game.player.invincible > 0 || game.won || game.gameOver) return;
    game.lives -= 1;
    game.shake = 22;
    game.comboText = 'Signal disrupted!';
    if (game.lives <= 0) {
      game.gameOver = true;
      game.comboText = 'Runner offline';
    } else {
      Object.assign(game.player, { ...PLAYER_START, vx: 0, vy: 0, invincible: 1.8, onGround: false, jumps: 0 });
    }
    beep('danger');
    updateHud();
  };

  const updateGame = (dt, canvas) => {
    const game = gameRef.current;
    const player = game.player;
    if (game.won || game.gameOver) {
      game.time += dt;
      game.cameraX += Math.sin(game.time) * 0.05;
      return;
    }

    game.time += dt;
    game.shake = Math.max(0, game.shake - 80 * dt);
    player.invincible = Math.max(0, player.invincible - dt);

    const input = keysRef.current;
    const targetVx = (input.right ? WORLD.moveSpeed : 0) - (input.left ? WORLD.moveSpeed : 0);
    const accel = targetVx === 0 ? WORLD.friction : WORLD.acceleration;
    if (player.vx < targetVx) player.vx = Math.min(targetVx, player.vx + accel * dt);
    if (player.vx > targetVx) player.vx = Math.max(targetVx, player.vx - accel * dt);
    if (Math.abs(player.vx) > 5) player.facing = Math.sign(player.vx);

    if (input.jumpQueued) {
      if (player.onGround || player.jumps < 2) {
        const firstJump = player.onGround || player.jumps === 0;
        player.vy = firstJump ? WORLD.jumpVelocity : WORLD.doubleJumpVelocity;
        player.onGround = false;
        player.jumps = firstJump ? 1 : 2;
        game.comboText = firstJump ? 'Boost jump' : 'Double jump!';
        beep(firstJump ? 'jump' : 'double');
      }
      input.jumpQueued = false;
    }

    player.vy = Math.min(WORLD.maxFall, player.vy + WORLD.gravity * dt);
    movePlayer(player, dt);

    for (const enemy of game.enemies) {
      enemy.x += enemy.speed * enemy.dir * dt;
      if (enemy.x < enemy.min || enemy.x + enemy.w > enemy.max) {
        enemy.dir *= -1;
        enemy.x = clamp(enemy.x, enemy.min, enemy.max - enemy.w);
      }
      if (intersects(player, enemy)) hurtPlayer();
    }

    for (const spike of LEVEL.spikes) {
      if (intersects(player, spike)) hurtPlayer();
    }

    LEVEL.shards.forEach((shard, index) => {
      if (game.collected.has(index)) return;
      const box = { x: shard.x - 17, y: shard.y - 17, w: 34, h: 34 };
      if (intersects(player, box)) {
        game.collected.add(index);
        game.score += 125 + Math.floor(Math.max(0, player.vx) / 8);
        game.comboText = '+125 lumen shard';
        beep('collect');
        updateHud();
      }
    });

    if (player.y > WORLD.height + 90) hurtPlayer();
    if (intersects(player, LEVEL.goal)) {
      game.won = true;
      game.score += 1000 + game.lives * 300 + game.collected.size * 25;
      game.comboText = 'Neon gate breached!';
      beep('win');
      updateHud();
    }

    const viewW = canvas.clientWidth || 900;
    game.cameraX = clamp(player.x - viewW * 0.38, 0, WORLD.width - viewW);
  };

  const movePlayer = (player, dt) => {
    player.x += player.vx * dt;
    player.x = clamp(player.x, 0, WORLD.width - player.w);

    for (const platform of LEVEL.platforms) {
      if (!intersects(player, platform)) continue;
      if (player.vx > 0) player.x = platform.x - player.w;
      else if (player.vx < 0) player.x = platform.x + platform.w;
      player.vx = 0;
    }

    player.y += player.vy * dt;
    player.onGround = false;

    for (const platform of LEVEL.platforms) {
      if (!intersects(player, platform)) continue;
      if (player.vy > 0) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.jumps = 0;
      } else if (player.vy < 0) {
        player.y = platform.y + platform.h;
        player.vy = 0;
      }
    }
  };

  const beep = (type) => {
    if (!audioRef.current) return;
    const { context, master } = audioRef.current;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const tones = {
      jump: [260, 410, 0.08],
      double: [420, 740, 0.1],
      collect: [760, 1180, 0.12],
      danger: [150, 64, 0.18],
      win: [520, 980, 0.45]
    };
    const [start, end, duration] = tones[type] || tones.collect;
    osc.type = type === 'danger' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(end, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === 'danger' ? 0.16 : 0.11, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  };

  const startMusic = async () => {
    if (audioRef.current) {
      stopMusic();
      updateHud();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    await context.resume();
    const master = context.createGain();
    master.gain.value = 0.18;
    master.connect(context.destination);
    const timers = [];
    const bassNotes = [55, 55, 82.41, 73.42, 55, 110, 98, 73.42];
    const leadNotes = [220, 261.63, 329.63, 392, 329.63, 293.66, 261.63, 196];

    const playTone = (frequency, start, duration, type, volume) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      osc.type = type;
      osc.frequency.value = frequency;
      filter.type = 'lowpass';
      filter.frequency.value = type === 'sawtooth' ? 740 : 1600;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    };

    const scheduleBar = () => {
      const now = context.currentTime + 0.06;
      bassNotes.forEach((note, index) => playTone(note, now + index * 0.25, 0.2, 'sawtooth', 0.12));
      leadNotes.forEach((note, index) => {
        if (index % 2 === 0) playTone(note, now + index * 0.25 + 0.05, 0.16, 'square', 0.035);
      });
    };
    scheduleBar();
    timers.push(setInterval(scheduleBar, 1950));
    audioRef.current = { context, master, timers };
    updateHud();
  };

  const stopMusic = () => {
    if (!audioRef.current) return;
    audioRef.current.timers.forEach(clearInterval);
    audioRef.current.context.close();
    audioRef.current = null;
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Cyberpunk platformer</p>
          <h1>Neon Rift Runner</h1>
          <p className="subtitle">Sprint across rain-slick skyways, double-jump over voids, dodge rogue drones, and harvest lumen shards before breaching the neon gate.</p>
        </div>
        <div className="status-card" aria-live="polite">
          <span>Score <strong>{hud.score}</strong></span>
          <span>Lives <strong>{'◆'.repeat(hud.lives)}{'◇'.repeat(Math.max(0, 3 - hud.lives))}</strong></span>
          <span>Shards <strong>{hud.shards}/{hud.total}</strong></span>
        </div>
      </section>

      <section className="game-card">
        <div className="canvas-wrap">
          <canvas ref={canvasRef} aria-label="Neon Rift Runner side-scrolling game canvas" />
          {(hud.won || hud.gameOver) && (
            <div className="overlay-panel">
              <h2>{hud.won ? 'Gate breached' : 'Runner offline'}</h2>
              <p>{hud.won ? 'You crossed the city and cashed out the shard haul.' : 'The city got you. Reboot and make the run again.'}</p>
              <button onClick={resetGame}>Restart run</button>
            </div>
          )}
        </div>

        <div className="control-deck">
          <div className="mobile-pad" aria-label="Movement controls">
            <button onPointerDown={() => setControl('left', true)} onPointerUp={() => setControl('left', false)} onPointerLeave={() => setControl('left', false)}>←</button>
            <button onPointerDown={() => setControl('right', true)} onPointerUp={() => setControl('right', false)} onPointerLeave={() => setControl('right', false)}>→</button>
          </div>
          <button className="jump-button" onPointerDown={() => setControl('jump', true)} onPointerUp={() => setControl('jump', false)} onPointerLeave={() => setControl('jump', false)}>Jump</button>
          <button className="music-button" onClick={startMusic}>{hud.music ? 'Stop synthwave' : 'Start synthwave'}</button>
          <button className="restart-button" onClick={resetGame}>Restart</button>
        </div>

        <div className="instructions">
          <span>Keyboard: A/D or arrows to move, Space/W/↑ to jump.</span>
          <span>Phone: hold the bottom buttons. Tap jump again mid-air for a double jump.</span>
        </div>
      </section>
    </main>
  );
}

function drawGame(ctx, canvas, game) {
  const width = canvas.clientWidth || 900;
  const height = canvas.clientHeight || 560;
  const cameraX = game.cameraX + (game.shake ? Math.sin(game.time * 80) * game.shake : 0);
  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#08071a');
  sky.addColorStop(0.45, '#151044');
  sky.addColorStop(1, '#260920');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  drawCity(ctx, width, height, cameraX, game.time);
  ctx.save();
  ctx.translate(-cameraX, 0);
  drawPlatforms(ctx);
  drawSpikes(ctx);
  drawShards(ctx, game);
  drawEnemies(ctx, game);
  drawGoal(ctx, game.time);
  drawPlayer(ctx, game.player, game.time);
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  ctx.font = '700 15px Inter, Arial';
  ctx.fillText(game.comboText, 22, height - 24);
}

function drawCity(ctx, width, height, cameraX, time) {
  for (let layer = 0; layer < 3; layer += 1) {
    const speed = [0.12, 0.24, 0.38][layer];
    const baseY = [210, 260, 320][layer];
    const buildingW = [76, 96, 124][layer];
    ctx.fillStyle = [`rgba(11, 14, 45, .72)`, `rgba(18, 13, 58, .82)`, `rgba(9, 7, 25, .95)`][layer];
    const offset = -((cameraX * speed) % buildingW);
    for (let x = offset - buildingW; x < width + buildingW; x += buildingW) {
      const h = 120 + ((Math.sin((x + cameraX * speed) * 0.014 + layer) + 1) * 90);
      ctx.fillRect(x, baseY + 150 - h, buildingW - 12, h + height);
      ctx.fillStyle = layer === 2 ? 'rgba(25, 247, 255, .22)' : 'rgba(255, 45, 214, .16)';
      for (let wy = baseY + 180 - h; wy < baseY + 100; wy += 28) {
        if (Math.sin(x * 0.1 + wy + time) > -0.2) ctx.fillRect(x + 12, wy, buildingW - 36, 4);
      }
      ctx.fillStyle = [`rgba(11, 14, 45, .72)`, `rgba(18, 13, 58, .82)`, `rgba(9, 7, 25, .95)`][layer];
    }
  }

  ctx.strokeStyle = 'rgba(24, 247, 255, .18)';
  ctx.lineWidth = 2;
  for (let y = height - 130; y < height; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y - 22);
    ctx.stroke();
  }
}

function drawPlatforms(ctx) {
  LEVEL.platforms.forEach(platform => {
    const grad = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.h);
    grad.addColorStop(0, platform.kind === 'glass' ? '#33f5ff' : '#22215b');
    grad.addColorStop(0.25, platform.kind === 'glass' ? '#7cfbff' : '#372369');
    grad.addColorStop(1, platform.kind === 'glass' ? '#14305a' : '#090915');
    ctx.fillStyle = grad;
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.strokeStyle = platform.kind === 'glass' ? '#ff38df' : '#21f6ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    for (let x = platform.x + 18; x < platform.x + platform.w; x += 84) ctx.fillRect(x, platform.y + 8, 42, 4);
  });
}

function drawSpikes(ctx) {
  LEVEL.spikes.forEach(spike => {
    const count = Math.max(2, Math.floor(spike.w / 22));
    for (let i = 0; i < count; i += 1) {
      const x = spike.x + (i * spike.w) / count;
      ctx.beginPath();
      ctx.moveTo(x, spike.y + spike.h);
      ctx.lineTo(x + spike.w / count / 2, spike.y);
      ctx.lineTo(x + spike.w / count, spike.y + spike.h);
      ctx.closePath();
      ctx.fillStyle = '#ff2bbd';
      ctx.fill();
      ctx.strokeStyle = '#ffe9fb';
      ctx.stroke();
    }
  });
}

function drawShards(ctx, game) {
  LEVEL.shards.forEach((shard, index) => {
    if (game.collected.has(index)) return;
    const bob = Math.sin(game.time * 4 + index) * 6;
    ctx.save();
    ctx.translate(shard.x, shard.y + bob);
    ctx.rotate(game.time * 2 + index);
    ctx.fillStyle = '#f7ff53';
    ctx.shadowColor = '#f7ff53';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(14, 0);
    ctx.lineTo(0, 18);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
  ctx.shadowBlur = 0;
}

function drawEnemies(ctx, game) {
  game.enemies.forEach(enemy => {
    ctx.save();
    ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
    ctx.fillStyle = '#ff3b61';
    ctx.shadowColor = '#ff3b61';
    ctx.shadowBlur = 14;
    ctx.fillRect(-enemy.w / 2, -enemy.h / 2 + 8, enemy.w, enemy.h - 8);
    ctx.fillStyle = '#151020';
    ctx.fillRect(-12, -3, 8, 8);
    ctx.fillRect(6, -3, 8, 8);
    ctx.strokeStyle = '#19f7ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.lineTo(-28, -22);
    ctx.moveTo(18, -12);
    ctx.lineTo(28, -22);
    ctx.stroke();
    ctx.restore();
  });
  ctx.shadowBlur = 0;
}

function drawGoal(ctx, time) {
  const goal = LEVEL.goal;
  ctx.save();
  ctx.translate(goal.x, goal.y);
  ctx.strokeStyle = '#19f7ff';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#19f7ff';
  ctx.shadowBlur = 20 + Math.sin(time * 6) * 8;
  ctx.strokeRect(0, 0, goal.w, goal.h);
  ctx.fillStyle = 'rgba(255, 45, 214, .25)';
  ctx.fillRect(8, 8, goal.w - 16, goal.h - 16);
  ctx.restore();
  ctx.shadowBlur = 0;
}

function drawPlayer(ctx, player, time) {
  ctx.save();
  ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
  if (player.invincible > 0 && Math.floor(time * 18) % 2 === 0) ctx.globalAlpha = 0.42;
  ctx.scale(player.facing, 1);
  ctx.fillStyle = '#1bf7ff';
  ctx.shadowColor = '#1bf7ff';
  ctx.shadowBlur = 18;
  ctx.fillRect(-15, -18, 30, 40);
  ctx.fillStyle = '#f5fbff';
  ctx.fillRect(-11, -32, 22, 16);
  ctx.fillStyle = '#ff2bd6';
  ctx.fillRect(2, -27, 13, 4);
  ctx.strokeStyle = '#f7ff53';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-14, 20);
  ctx.lineTo(-20, 32);
  ctx.moveTo(12, 20);
  ctx.lineTo(20, 32);
  ctx.stroke();
  ctx.restore();
  ctx.shadowBlur = 0;
}

export default NeonRunner;
