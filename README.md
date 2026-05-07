# Neon Rift Runner

**Neon Rift Runner** is a ready-to-play cyberpunk side-scrolling platform game. It runs in a browser, works on phones, and can be installed like an app from supported mobile browsers.

## What is included

- Futuristic neon side-scroller gameplay.
- Tuned gravity, acceleration, friction, platform collisions, pits, spikes, and enemy patrols.
- Double jump, lives, score, collectible lumen shards, win and game-over states.
- On-screen phone controls plus keyboard controls.
- Built-in synthwave music and sound effects.
- Offline-capable Progressive Web App files for mobile installation.

## Play now

If you have this project on your computer, run this one command from the main project folder:

```bash
npm run play
```

That command builds the game, starts a local game server, and tries to open the game automatically in your browser.

If your browser does not open automatically, go to:

```text
http://localhost:3000
```

## Play on your phone

Run the same command:

```bash
npm run play
```

The terminal will print phone-ready links for your Wi-Fi network, such as:

```text
http://192.168.1.25:3000
```

Open the printed phone link on your phone while your phone and computer are on the same Wi-Fi network.

## Install on your phone

After opening the phone link:

- **iPhone Safari**: tap **Share** → **Add to Home Screen**.
- **Android Chrome**: tap the browser menu → **Add to Home screen** or **Install app**.

The game includes a web app manifest and service worker so it can behave like an installable mobile web app after it has been loaded.

## Controls

### Phone

- Hold **←** to move left.
- Hold **→** to move right.
- Tap **Jump** to jump.
- Tap **Jump** again in the air to double jump.
- Tap **Start synthwave** to turn on music.
- Tap **Restart** to restart the run.

### Keyboard

- Move: **A/D** or **Left/Right arrows**.
- Jump: **Space**, **W**, or **Up arrow**.
- Double jump: press jump again while in the air.

## Developer commands

```bash
npm run build
npm start
npm test
```

The actual game frontend lives in `frontend/`, but the root scripts are provided so you do not need to remember that.
