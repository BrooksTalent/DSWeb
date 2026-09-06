const startButton = document.querySelector('#startButton');
const resetButton = document.querySelector('#resetButton');
const currentBalls = document.querySelector('#currentBalls');
const historyList = document.querySelector('#historyList');
const emptyState = document.querySelector('#emptyState');
const drawCount = document.querySelector('#drawCount');
const stageLabel = document.querySelector('#stageLabel');

let draws = [];

function makeDraw() {
  const pool = Array.from({ length: 49 }, (_, index) => index + 1);
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, 6).sort((a, b) => a - b);
}

function formatNumber(number) {
  return String(number).padStart(2, '0');
}

function addDraw(numbers = makeDraw()) {
  const draw = { numbers, time: new Date() };
  draws.push(draw);
  renderCurrent(draw);
  renderHistory();
  return draw;
}

function renderCurrent(draw) {
  stageLabel.textContent = `第 ${draws.length} 次結果`;
  currentBalls.innerHTML = draw.numbers
    .map((number) => `<span class="ball">${formatNumber(number)}</span>`)
    .join('');
}

function renderHistory() {
  emptyState.hidden = draws.length > 0;
  drawCount.textContent = `${draws.length} 次`;
  historyList.innerHTML = [...draws].reverse().map((draw, reverseIndex) => {
    const drawNumber = draws.length - reverseIndex;
    const time = draw.time.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const chips = draw.numbers.map((number) => `<span class="number-chip">${formatNumber(number)}</span>`).join('');
    return `<li class="draw-row"><span class="draw-index">第 ${drawNumber} 次</span><span class="row-numbers">${chips}</span><time class="draw-time">${time}</time></li>`;
  }).join('');
}

function resetDraws() {
  draws = [];
  currentBalls.innerHTML = '<span class="placeholder">按下「開始」抽出 6 個號碼</span>';
  stageLabel.textContent = '準備開始';
  renderHistory();
}

startButton.addEventListener('click', () => addDraw());
resetButton.addEventListener('click', resetDraws);

const context = document.modelContext;
if (context?.registerTool) {
  const tools = [
    {
      name: 'draw_mark_six_numbers',
      title: '抽出六合彩號碼',
      description: '由 1 至 49 隨機抽出 6 個不重複號碼，並新增至頁面紀錄。',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        const draw = addDraw();
        return { drawNumber: draws.length, numbers: draw.numbers };
      }
    },
    {
      name: 'reset_mark_six_draws',
      title: '重設六合彩紀錄',
      description: '清空頁面上所有已模擬的開獎結果。',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        resetDraws();
        return { drawCount: 0 };
      }
    }
  ];
  tools.forEach((tool) => Promise.resolve(context.registerTool(tool)).catch(() => {}));
}
