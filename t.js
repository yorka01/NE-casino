const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const result = document.getElementById('result');
const balanceDisplay = document.getElementById('balanceDisplay');
const betAmountInput = document.getElementById('betAmount');
const chosenNumberInput = document.getElementById('chosenNumber');
const sectors = 31; // Количество секторов
const radius = 280; // Радиус колеса
let balance = parseFloat(localStorage.getItem('balance')) || 100;

// Генерация колеса
function drawWheel() {
    const angleStep = (2 * Math.PI) / sectors;
    for (let i = 0; i < sectors; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'red' : 'black';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, i * angleStep, (i + 1) * angleStep);
        ctx.closePath();
        ctx.fill();

        const angle = i * angleStep + angleStep / 2;
        const x = canvas.width / 2 + Math.cos(angle) * (radius - 40);
        const y = canvas.height / 2 + Math.sin(angle) * (radius - 40);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, x, y);
    }
}

// Рисуем стрелку
function drawArrow() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 15, 10);
    ctx.lineTo(canvas.width / 2 + 15, 10);
    ctx.lineTo(canvas.width / 2, 50);
    ctx.closePath();
    ctx.fill();
}

// Анимация вращения
function spinWheel() {
    const betAmount = parseInt(betAmountInput.value);
    const chosenNumber = parseInt(chosenNumberInput.value);

    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Введите корректную ставку!");
        return;
    }

    if (isNaN(chosenNumber) || chosenNumber < 1 || chosenNumber > sectors) {
        alert(`Выберите число от 1 до ${sectors}!`);
        return;
    }

    if (betAmount > balance) {
        alert("Недостаточно средств!");
        return;
    }

    const randomSector = Math.floor(Math.random() * sectors) + 1;
    const anglePerSector = (2 * Math.PI) / sectors;

    // Целевой угол: корректируем так, чтобы сектор оказался под стрелкой
    const targetAngle = (2 * Math.PI - (randomSector - 1) * anglePerSector) + anglePerSector / 2;
    const spinAngle = targetAngle + 10 * Math.PI; // Полные обороты
    const duration = 4000; // 4 секунды
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentAngle = spinAngle * easeOut(progress);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(currentAngle);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawWheel();
        ctx.restore();
        drawArrow();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            displayResult(randomSector, chosenNumber, betAmount);
        }
    }

    requestAnimationFrame(animate);
}

// Отображение результата
function displayResult(randomSector, chosenNumber, betAmount) {
    result.textContent = `Выпало число: ${randomSector}`;
    if (randomSector === chosenNumber) {
        const winnings = betAmount * 10;
        balance += winnings;
        result.textContent += ` Вы выиграли ${winnings}!`;
    } else {
        balance -= betAmount;
        result.textContent += " Вы проиграли.";
    }
    balanceDisplay.textContent = `Баланс: ${balance}$`;
    localStorage.setItem('balance', balance);
}

// Плавное замедление
function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Инициализация
spinButton.addEventListener('click', () => {
    result.textContent = '';
    spinWheel();
});

// Отрисовка колеса и стрелки при загрузке страницы
drawWheel();
drawArrow();
balanceDisplay.textContent = `Баланс: ${balance}$`;
