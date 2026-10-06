// 定義測驗題目資料庫（共 5 題，每題包含問題、4個選項與正確答案索引）
let quizData = [
  {
    question: "1. 在 p5.js 中，哪一個函式只會在程式開始時執行一次？",
    options: ["A. draw()", "B. setup()", "C. mousePressed()", "D. preload()"],
    answer: 1 // 正確答案：B. setup()
  },
  {
    question: "2. 想要繪製一個填滿紅色的圓形，應該先呼叫哪一個函式？",
    options: ["A. stroke(255, 0, 0)", "B. fill(255, 0, 0)", "C. background(255, 0, 0)", "D. color(255, 0, 0)"],
    answer: 1 // 正確答案：B. fill(255, 0, 0)
  },
  {
    question: "3. 設定畫布背景顏色的指令是什麼？",
    options: ["A. background()", "B. canvas()", "C. clear()", "D. setBackground()"],
    answer: 0 // 正確答案：A. background()
  },
  {
    question: "4. 哪一個系統變數可以取得滑鼠目前的 X 軸座標？",
    options: ["A. xMouse", "B. mouseX", "C. positionX", "D. cursorX"],
    answer: 1 // 正確答案：B. mouseX
  },
  {
    question: "5. 在 p5.js 中，rect(10, 20, 30, 40) 前兩個參數代表什麼？",
    options: ["A. 寬度與高度", "B. 右下角座標", "C. 左上角座標", "D. 中心點座標"],
    answer: 2 // 正確答案：C. 左上角座標
  }
];

let currentQuestion = 0;   // 目前進行到的題目編號（從0開始）
let score = 0;             // 累積答對題數
let selectedOption = -1;   // 使用者點選的選項索引（-1 表示尚未選擇）
let isAnswered = false;    // 紀錄當前題目是否已經作答
let optionButtons = [];    // 儲存 4 個選項按鈕 DOM 物件的陣列
let nextButton;            // 下一題按鈕 DOM 物件
let bounceOffset = 0;      // 正確選項跳動動畫的位移量

// 響應式佈局變數
let cardW, cardH, btnW, btnH, btnSpacing;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定文字對齊方式為水平居中與垂直居中
  textAlign(CENTER, CENTER);

  // 初始化響應式尺寸數據
  calculateLayout();

  // 建立 4 個選項按鈕
  for (let i = 0; i < 4; i++) {
    let btn = createButton(''); // 建立空按鈕
    btn.style('cursor', 'pointer'); // 設定滑鼠懸停指標樣式
    btn.style('border', '2px solid #ccc'); // 設定邊框
    btn.style('border-radius', '8px'); // 設定圓角
    btn.style('background-color', '#ffffff'); // 設定預設背景顏色為白色
    btn.mousePressed(() => checkAnswer(i)); // 綁定點擊事件並傳入選項索引
    optionButtons.push(btn); // 將按鈕存入陣列中
  }

  // 建立下一題按鈕
  nextButton = createButton('下一題'); // 建立顯示「下一題」的按鈕
  nextButton.style('cursor', 'pointer'); // 設定滑鼠懸停指標
  nextButton.style('background-color', '#4CAF50'); // 設定背景顏色為綠色
  nextButton.style('color', 'white'); // 設定文字顏色為白色
  nextButton.style('border', 'none'); // 移除邊框
  nextButton.style('border-radius', '5px'); // 設定圓角
  nextButton.mousePressed(nextQuestion); // 綁定點擊事件以切換至下一題
  nextButton.hide(); // 初始狀態隱藏下一題按鈕

  // 載入第一個題目的介面佈局
  loadQuestion();
}

// 計算響應式相關尺寸與元件位置
function calculateLayout() {
  // 依據視窗大小動態計算卡片與按鈕寬度
  cardW = min(650, width * 0.9); // 卡片寬度為視窗寬度的 90%，最高不超過 650px
  cardH = min(120, height * 0.18); // 卡片高度
  btnW = min(500, width * 0.85); // 按鈕寬度
  btnH = max(42, height * 0.065); // 按鈕高度
  btnSpacing = btnH + 12; // 按鈕與按鈕之間的垂直間距
}

function draw() {
  // 設定畫布背景顏色為淺灰藍色
  background(245, 247, 250);

  // 檢查是否還有題目需進行
  if (currentQuestion < quizData.length) {
    let centerY = height * 0.22; // 題目卡片中心點 Y 座標位置

    // 繪製題目卡片背景框
    fill(255); // 白色填滿
    stroke(220); // 邊框顏色
    strokeWeight(1); // 邊框粗細
    rectMode(CENTER); // 以中心點繪製矩形
    rect(width / 2, centerY, cardW, cardH, 12); // 畫出題目背景卡片

    // 顯示題目文字（響應式字體大小）
    fill(30); // 深灰色文字
    noStroke(); // 停用文字邊框
    textSize(constrain(width * 0.035, 15, 20)); // 動態計算字型大小（限制在 15px ~ 20px）
    text(quizData[currentQuestion].question, width / 2, centerY, cardW - 30, cardH - 10); // 繪製題目文字

    // 若已作答且答錯，計算正確選項的上下跳動位移量
    if (isAnswered && selectedOption !== quizData[currentQuestion].answer) {
      // 使用正弦波（sin）計算連續平滑的上下跳動數值
      bounceOffset = sin(frameCount * 0.15) * 8; 
      
      // 更新正確選項按鈕的位置，讓其呈現跳動效果
      let correctIdx = quizData[currentQuestion].answer; // 取得正確答案索引
      let startY = height * 0.38; // 選項起始 Y 座標
      let buttonY = startY + correctIdx * btnSpacing + bounceOffset; // 計算加入跳動偏移後的 Y 座標
      optionButtons[correctIdx].position(width / 2 - btnW / 2, buttonY); // 更新該按鈕畫面上位置
    }
  } else {
    // 五題皆作答完畢，顯示最終測驗結果畫面
    displayResult();
  }
}

// 載入當前題目與更新按鈕文字及位置
function loadQuestion() {
  let q = quizData[currentQuestion]; // 取得當前題目物件
  let startY = height * 0.38; // 第一個選項按鈕的起始 Y 座標
  let fontSize = constrain(width * 0.03, 14, 17); // 依視窗計算響應式按鈕字體大小

  // 顯示並設定 4 個選項按鈕
  for (let i = 0; i < 4; i++) {
    optionButtons[i].html(q.options[i]); // 更新按鈕上的選項文字
    optionButtons[i].position(width / 2 - btnW / 2, startY + i * btnSpacing); // 計算並設定選項按鈕置中的座標位置
    optionButtons[i].size(btnW, btnH); // 設定按鈕寬度與高度
    optionButtons[i].style('font-size', fontSize + 'px'); // 動態更新按鈕文字大小
    optionButtons[i].style('background-color', '#ffffff'); // 恢復預設背景顏色
    optionButtons[i].removeAttribute('disabled'); // 啟用按鈕點擊功能
    optionButtons[i].show(); // 顯示選項按鈕
  }
  
  // 隱藏下一題按鈕並重設作答狀態
  nextButton.hide();
  isAnswered = false;
  selectedOption = -1;
  bounceOffset = 0;
}

// 檢查使用者點選的答案
function checkAnswer(index) {
  // 若已經作答過則不重複執行
  if (isAnswered) return;

  isAnswered = true; // 標記為已作答
  selectedOption = index; // 紀錄使用者選擇的選項索引
  let correctIdx = quizData[currentQuestion].answer; // 取得正確答案索引

  // 停用所有選項按鈕，防止重複點擊
  for (let i = 0; i < 4; i++) {
    optionButtons[i].attribute('disabled', 'true');
  }

  // 判斷作答結果
  if (index === correctIdx) {
    // 答對：將選中的選項背景設為淺綠色
    optionButtons[index].style('background-color', '#c8e6c9');
    score++; // 答對題數加 1
  } else {
    // 答錯：將選錯的選項背景設為淺紅色
    optionButtons[index].style('background-color', '#ffcdd2');
    // 依需求，在正確選項上套用指定背景顏色 #bfdbf7
    optionButtons[correctIdx].style('background-color', '#bfdbf7');
  }

  // 動態更新並顯示下一題按鈕的位置與大小
  let startY = height * 0.38;
  let nextBtnY = startY + 4 * btnSpacing + 10; // 設置在最後一個選項下方
  let nextBtnW = min(120, btnW * 0.4); // 動態按鈕寬度
  let nextBtnH = max(40, btnH * 0.9); // 動態按鈕高度
  
  nextButton.position(width / 2 - nextBtnW / 2, nextBtnY); // 置中顯示
  nextButton.size(nextBtnW, nextBtnH); // 設定尺寸
  nextButton.style('font-size', constrain(width * 0.03, 14, 16) + 'px'); // 調整文字大小
  nextButton.show(); // 顯示下一題按鈕
}

// 切換至下一題或結束測驗
function nextQuestion() {
  currentQuestion++; // 題目編號加 1
  
  if (currentQuestion < quizData.length) {
    // 若還有題目，載入下一題
    loadQuestion();
  } else {
    // 題目已全部答完，隱藏所有選項按鈕與下一題按鈕
    for (let i = 0; i < 4; i++) {
      optionButtons[i].hide();
    }
    nextButton.hide();
  }
}

// 繪製最後得分結算畫面
function displayResult() {
  // 顯示結果標題（響應式字體）
  fill(40);
  textSize(constrain(width * 0.05, 24, 34));
  text("測驗結束！", width / 2, height / 2 - 40);

  // 顯示最終答對題數結果
  textSize(constrain(width * 0.04, 18, 26));
  fill(60);
  text(`你的得分： ${score} / ${quizData.length} 題`, width / 2, height / 2 + 20);
}

// 監聽視窗尺寸改變事件，實現動態響應式調整
function windowResized() {
  // 重新調整畫布大小為當前視窗大小
  resizeCanvas(windowWidth, windowHeight);

  // 重新計算卡片與按鈕的響應式尺寸數據
  calculateLayout();

  // 若測驗進行中，同步更新按鈕於畫面的位置與大小
  if (currentQuestion < quizData.length) {
    loadQuestion(); // 重新整理佈局與座標
    
    // 如果已經作答過，重新擺放下一題按鈕與維持點選後顏色狀態
    if (isAnswered) {
      checkAnswer(selectedOption); 
    }
  }
}