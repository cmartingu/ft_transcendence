interface User {
  username: string;
  email: string;
}

const playersInfo: User[] = [];
let currentLogin = 2;

const login_Div = document.getElementById("login-others")!;
const username_In = document.getElementById("username") as HTMLInputElement;
const password_In = document.getElementById("password") as HTMLInputElement;
const confirm_Btn = document.getElementById("confirm-player")!;
const login_Title = document.getElementById("login-title")!;
const error_Msg = document.getElementById("login-error")!;
const gameContainer = document.getElementById("game-container")!;
const countdown_El = document.getElementById("countdown")!;
const winner_Msg = document.getElementById("winner-msg")!;
const winner_Text = document.getElementById("winner-name")!;

const livesDisplay = [
  document.getElementById("p1-lives")!,
  document.getElementById("p2-lives")!,
  document.getElementById("p3-lives")!,
  document.getElementById("p4-lives")!
];

const canva = document.getElementById("pongCanvas") as HTMLCanvasElement;
const ctx_ = canva.getContext("2d")!;

const userStr = localStorage.getItem("user");
if (!userStr) {
  window.location.href = "./login.html";
} else {
  playersInfo.push(JSON.parse(userStr));
}

confirm_Btn.addEventListener("click", async () => {
  const username = username_In.value.trim();
  const password = password_In.value.trim();
  error_Msg.textContent = "";

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      error_Msg.textContent = data.error || "Error";
      return;
    }

    const user: User = await res.json();
    if (playersInfo.find(p => p.username === user.username)) {
      error_Msg.textContent = "Jugador ya registrado.";
      return;
    }

    playersInfo.push(user);
    currentLogin++;

    if (playersInfo.length === 4) {
      login_Div.classList.add("hidden");
      start_Game();
    } else {
      username_In.value = "";
      password_In.value = "";
      login_Title.textContent = `Jugador ${currentLogin} - Login`;
    }
  } catch {
    error_Msg.textContent = "Error de conexión.";
  }
});

// ==== Juego ====

interface Player {
  side: "left" | "right" | "top" | "bottom";
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  moveUp: boolean;
  moveDown: boolean;
  lives: number;
  eliminated: boolean;
}

const players_: Player[] = [
  { side: "left", color: "red",    x: 0, y: 250, w: 10, h: 100, moveUp: false, moveDown: false, lives: 3, eliminated: false },
  { side: "right", color: "blue",   x: 590, y: 250, w: 10, h: 100, moveUp: false, moveDown: false, lives: 3, eliminated: false },
  { side: "top", color: "green",    x: 250, y: 0, w: 100, h: 10, moveUp: false, moveDown: false, lives: 3, eliminated: false },
  { side: "bottom", color: "yellow", x: 250, y: 590, w: 100, h: 10, moveUp: false, moveDown: false, lives: 3, eliminated: false },
];

let ball_X = 300, ball_Y = 300;
let speedX = 0;
let speedY = 0;
let ani_: number;

let allowMove = false;

function startRound() {
  ball_X = 300;
  ball_Y = 300;
  allowMove = false;
  countdown_El.textContent = "3";
  countdown_El.classList.remove("hidden");
  let count = 3;
  const interval = setInterval(() => {
    count--;
    countdown_El.textContent = count > 0 ? String(count) : "";
    if (count <= 0) {
      clearInterval(interval);
      countdown_El.classList.add("hidden");
      speedX = 5 * (Math.random() < 0.5 ? 1 : -1);
      speedY = 5 * (Math.random() < 0.5 ? 1 : -1);
      allowMove = true;
    }
  }, 1000);
}

document.addEventListener("keydown", e => {
  if (["ArrowUp", "ArrowDown", "w", "s", "i", "k", "z", "x"].includes(e.key)) {
    e.preventDefault();
    if (e.key === "w") players_[0].moveUp = true;
    if (e.key === "s") players_[0].moveDown = true;
    if (e.key === "ArrowUp") players_[1].moveUp = true;
    if (e.key === "ArrowDown") players_[1].moveDown = true;
    if (e.key === "i") players_[2].moveUp = true;
    if (e.key === "k") players_[2].moveDown = true;
    if (e.key === "z") players_[3].moveUp = true;
    if (e.key === "x") players_[3].moveDown = true;
  }
});

document.addEventListener("keyup", e => {
  if (["ArrowUp", "ArrowDown", "w", "s", "i", "k", "z", "x"].includes(e.key)) {
    e.preventDefault();
    if (e.key === "w") players_[0].moveUp = false;
    if (e.key === "s") players_[0].moveDown = false;
    if (e.key === "ArrowUp") players_[1].moveUp = false;
    if (e.key === "ArrowDown") players_[1].moveDown = false;
    if (e.key === "i") players_[2].moveUp = false;
    if (e.key === "k") players_[2].moveDown = false;
    if (e.key === "z") players_[3].moveUp = false;
    if (e.key === "x") players_[3].moveDown = false;
  }
});

function update() {

  players_.forEach(p => {
    if (p.eliminated) return;
    if (p.side === "left" || p.side === "right") {
      if (p.moveUp && p.y > 0) p.y -= 8;
      if (p.moveDown && p.y + p.h < canva.height) p.y += 8;
    } else {
      if (p.moveUp && p.x > 0) p.x -= 8;
      if (p.moveDown && p.x + p.w < canva.width) p.x += 8;
    }
  });

  if (!allowMove) return;

  ball_X += speedX;
  ball_Y += speedY;

  let rebote = false;
  for (const p of players_) {
    if (p.eliminated) continue;
    if (p.side === "left" && ball_X <= p.x + p.w && ball_Y >= p.y && ball_Y <= p.y + p.h) {
      speedX *= -1; rebote = true;
    } else if (p.side === "right" && ball_X >= p.x && ball_Y >= p.y && ball_Y <= p.y + p.h) {
      speedX *= -1; rebote = true;
    } else if (p.side === "top" && ball_Y <= p.y + p.h && ball_X >= p.x && ball_X <= p.x + p.w) {
      speedY *= -1; rebote = true;
    } else if (p.side === "bottom" && ball_Y >= p.y && ball_X >= p.x && ball_X <= p.x + p.w) {
      speedY *= -1; rebote = true;
    }
  }

  if (!rebote) {
    if (ball_X <= 0 && players_[0].eliminated) speedX *= -1;
    else if (ball_X >= canva.width && players_[1].eliminated) speedX *= -1;
    else if (ball_Y <= 0 && players_[2].eliminated) speedY *= -1;
    else if (ball_Y >= canva.height && players_[3].eliminated) speedY *= -1;
    else if (ball_X <= 0) loseLife(0);
    else if (ball_X >= canva.width) loseLife(1);
    else if (ball_Y <= 0) loseLife(2);
    else if (ball_Y >= canva.height) loseLife(3);
  }
}

function loseLife(index: number) {
  const p = players_[index];
  if (p.eliminated) return;

  p.lives--;
  updateLives();
  if (p.lives === 0) p.eliminated = true;

  const vivos = players_.filter(p => !p.eliminated);
  if (vivos.length === 1) {
    const idx = players_.indexOf(vivos[0]);
    winner_Text.textContent = playersInfo[idx].username;
    winner_Msg.classList.remove("hidden");
    cancelAnimationFrame(ani_);
    return;
  }

  startRound();
}

function updateLives() {
  players_.forEach((p, i) => {
    const emoji = ["🟥", "🟦", "🟩", "🟨"][i];
    livesDisplay[i].textContent = `${emoji} ${p.eliminated ? "💀 Eliminado" : `${p.lives} vidas`}`;
  });
}

function draw_() {
  ctx_.clearRect(0, 0, canva.width, canva.height);

  players_.forEach(p => {
    if (!p.eliminated) {
      ctx_.fillStyle = p.color;
      ctx_.fillRect(p.x, p.y, p.w, p.h);
    }
  });

  ctx_.fillStyle = "white";
  ctx_.beginPath();
  ctx_.arc(ball_X, ball_Y, 10, 0, Math.PI * 2);
  ctx_.fill();
}

function loop() {
  update();
  draw_();
  ani_ = requestAnimationFrame(loop);
}

function start_Game() {
  gameContainer.classList.remove("hidden");

  document.getElementById("p1-name")!.textContent = playersInfo[0].username;
  document.getElementById("p2-name")!.textContent = playersInfo[1].username;
  document.getElementById("p3-name")!.textContent = playersInfo[2].username;
  document.getElementById("p4-name")!.textContent = playersInfo[3].username;

  updateLives();
  startRound();
  loop();
}
