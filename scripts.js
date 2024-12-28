let currentMultiplier = 1.00;
let gameActive = false;
let betAmount = 0;
let balance = parseFloat(localStorage.getItem('balance')) || 100;
let autoCashoutMultiplier = parseFloat(localStorage.getItem('autoCashoutMultiplier')) || 0; // Считываем значение из localStorage
let autoCashoutActive = autoCashoutMultiplier > 0;

const betInput = document.getElementById('bet');
const autoCashoutInput = document.getElementById('autoCashoutInput');
const startButton = document.getElementById('startButton');
const cashoutButton = document.getElementById('cashoutButton');
const autoCashoutButton = document.getElementById('autoCashoutButton');
const multiplierDisplay = document.getElementById('multiplierDisplay');
const balanceDisplay = document.getElementById('balanceDisplay');

// Обновляем баланс на странице
function updateBalance() {
    balanceDisplay.textContent = `Баланс: ${balance}$`;
    localStorage.setItem('balance', balance);
}

// Запускаем игру
function startGame() {
    if (gameActive) return;

    betAmount = parseFloat(betInput.value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        return;
    }

    balance -= betAmount;
    updateBalance();

    gameActive = true;
    currentMultiplier = 1.00;
    cashoutButton.disabled = false;

    let randomChance = Math.random();
    let targetMultiplier;

    if (randomChance < 0.70) {
        targetMultiplier = 1.5 + Math.random() * 0.3;
    } else if (randomChance < 0.85) {
        targetMultiplier = 1.8 + Math.random() * 0.6;
    } else if (randomChance < 0.95) {
        targetMultiplier = 2.4 + Math.random() * 2;
    } else {
        targetMultiplier = 10;
    }

    let gameInterval = setInterval(() => {
        if (gameActive) {
            if (currentMultiplier < targetMultiplier) {
                currentMultiplier += 0.005;
            } else {
                endGame(true);
            }

            if (autoCashoutActive && currentMultiplier >= autoCashoutMultiplier) {
                cashOut();
            }

            multiplierDisplay.textContent = currentMultiplier.toFixed(2) + 'x';
        }
    }, 100);

    setTimeout(() => {
        if (gameActive) {
            endGame(false);
        }
    }, 30000);

    startButton.disabled = true;
}

// Выводим деньги
function cashOut() {
    if (!gameActive) return;

    const winAmount = betAmount * currentMultiplier;
    balance += winAmount;
    updateBalance();

    endGame(true);
}

// Завершаем игру
function endGame(won) {
    gameActive = false;
    startButton.disabled = false;
    cashoutButton.disabled = true;
    autoCashoutButton.disabled = true;

    if (won) {
        alert(`Вы выиграли ${betAmount * currentMultiplier - betAmount}$!`);
    } else {
        alert(`Вы проиграли ${betAmount}$!`);
    }

    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Устанавливаем автовывод
function setAutoCashout() {
    const multiplier = parseFloat(autoCashoutInput.value);
    if (isNaN(multiplier) || multiplier <= 1) {
        return;
    }

    autoCashoutMultiplier = multiplier;
    autoCashoutActive = true;

    // Сохраняем значение автовывода в localStorage
    localStorage.setItem('autoCashoutMultiplier', autoCashoutMultiplier);

    autoCashoutButton.disabled = true;
    alert(`Автовывод установлен на коэффициент: ${autoCashoutMultiplier}x`);
}

startButton.addEventListener('click', startGame);
cashoutButton.addEventListener('click', cashOut);
autoCashoutButton.addEventListener('click', setAutoCashout);

updateBalance();

// Если автовывод был активирован ранее, отображаем это на странице
if (autoCashoutActive) {
    autoCashoutInput.value = autoCashoutMultiplier;
    autoCashoutButton.disabled = true; // Делаем кнопку автовывода неактивной, если он уже установлен
}
