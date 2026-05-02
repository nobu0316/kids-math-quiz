// 出題する問題数です。あとで増やしたいときは、この数字を変えます。
const TOTAL_QUESTIONS = 10;

// HTMLの部品をJavaScriptで使えるように取り出します。
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const finishScreen = document.getElementById("finish-screen");
const finishTitle = document.getElementById("finish-title");

const difficultyButtons = document.querySelectorAll(".difficulty-button");
const operationButtons = document.querySelectorAll(".operation-button");
const questionCount = document.getElementById("question-count");
const question = document.getElementById("question");
const answerInput = document.getElementById("answer-input");
const answerButton = document.getElementById("answer-button");
const resultMessage = document.getElementById("result-message");
const correctResult = document.getElementById("correct-result");
const timeResult = document.getElementById("time-result");
const mistakeTitle = document.getElementById("mistake-title");
const mistakeList = document.getElementById("mistake-list");
const reviewButton = document.getElementById("review-button");
const restartButton = document.getElementById("restart-button");

// 難易度ごとの数字の範囲です。
// max の数字だけ変えれば、出題される数字の大きさを調整できます。
const difficultySettings = {
  easy: {
    name: "かんたん",
    max: 9
  },
  normal: {
    name: "ふつう",
    max: 20
  },
  hard: {
    name: "むずかしい",
    max: 50
  }
};

// クイズ中に使うデータを入れておく変数です。
let selectedDifficulty = "easy";
let selectedOperation = "add";
let currentQuestionNumber = 0;
let correctCount = 0;
let currentQuestion = null;
let mistakes = [];
let quizStartTime = 0;
let isReviewMode = false;
let reviewQuestions = [];
let reviewMistakes = [];

// 難易度ボタンを押したときに、選ばれた難易度を覚えます。
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedDifficulty = button.dataset.difficulty;

    // どの難易度が選ばれているか見た目でも分かるようにします。
    difficultyButtons.forEach((difficultyButton) => {
      difficultyButton.classList.remove("selected");
    });
    button.classList.add("selected");
  });
});

// 足し算、引き算、掛け算のボタンを押したときにクイズを始めます。
operationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedOperation = button.dataset.operation;
    startQuiz();
  });
});

// 答えるボタンを押したときに答え合わせをします。
answerButton.addEventListener("click", checkAnswer);

// Enterキーでも答えられるようにします。
answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

// もう一度やるボタンを押したら最初の画面に戻します。
restartButton.addEventListener("click", () => {
  showScreen(startScreen);
});

// 復習ボタンを押したら、間違えた問題だけでもう一度クイズをします。
reviewButton.addEventListener("click", startReview);

// クイズを最初から始める関数です。
function startQuiz() {
  isReviewMode = false;
  currentQuestionNumber = 0;
  correctCount = 0;
  mistakes = [];
  reviewMistakes = [];
  // クイズを始めた時刻を覚えて、最後にかかった時間を計算します。
  quizStartTime = Date.now();
  resultMessage.textContent = "";

  showScreen(quizScreen);
  showNextQuestion();
}

// 次の問題を表示する関数です。
function showNextQuestion() {
  currentQuestionNumber++;
  const totalQuestionCount = isReviewMode ? reviewQuestions.length : TOTAL_QUESTIONS;

  // 決められた問題数を解き終わったら結果画面を表示します。
  if (currentQuestionNumber > totalQuestionCount) {
    if (isReviewMode) {
      showReviewFinishScreen();
    } else {
      showFinishScreen();
    }
    return;
  }

  if (isReviewMode) {
    // 復習モードでは、保存しておいた間違い問題を順番に出します。
    currentQuestion = reviewQuestions[currentQuestionNumber - 1];
  } else {
    currentQuestion = createQuestion(selectedOperation);
  }

  questionCount.textContent = `${currentQuestionNumber} / ${totalQuestionCount} 問目`;
  question.textContent = currentQuestion.text;
  answerInput.value = "";
  resultMessage.textContent = "";
  resultMessage.className = "result-message";
  answerInput.focus();
}

// 計算の種類に合わせて問題を1つ作る関数です。
function createQuestion(operation) {
  // 選ばれた難易度から、使う数字の最大値を取り出します。
  const maxNumber = difficultySettings[selectedDifficulty].max;

  let firstNumber = randomNumber(1, maxNumber);
  let secondNumber = randomNumber(1, maxNumber);
  let text = "";
  let answer = 0;

  if (operation === "add") {
    text = `${firstNumber} + ${secondNumber} = ?`;
    answer = firstNumber + secondNumber;
  }

  if (operation === "subtract") {
    // 小学生向けに、答えがマイナスにならないように大きい数を前にします。
    if (firstNumber < secondNumber) {
      const temporaryNumber = firstNumber;
      firstNumber = secondNumber;
      secondNumber = temporaryNumber;
    }

    text = `${firstNumber} - ${secondNumber} = ?`;
    answer = firstNumber - secondNumber;
  }

  if (operation === "multiply") {
    text = `${firstNumber} × ${secondNumber} = ?`;
    answer = firstNumber * secondNumber;
  }

  return {
    text: text,
    answer: answer
  };
}

// 入力された答えが正しいか確認する関数です。
function checkAnswer() {
  const userAnswer = Number(answerInput.value);

  // 何も入力されていないときは、答え合わせをしません。
  if (answerInput.value === "") {
    resultMessage.textContent = "答えを入力してね";
    resultMessage.className = "result-message wrong";
    answerInput.focus();
    return;
  }

  if (userAnswer === currentQuestion.answer) {
    correctCount++;
    resultMessage.textContent = "正解！";
    resultMessage.className = "result-message correct";
  } else {
    resultMessage.textContent = `不正解。正解は ${currentQuestion.answer} だよ`;
    resultMessage.className = "result-message wrong";

    const mistake = {
      questionText: currentQuestion.text,
      userAnswer: userAnswer,
      correctAnswer: currentQuestion.answer
    };

    if (isReviewMode) {
      // 復習で間違えた問題は、復習結果用に別の配列へ保存します。
      reviewMistakes.push(mistake);
    } else {
      // 通常クイズで間違えた問題は、あとで復習できるように保存します。
      mistakes.push(mistake);
    }
  }

  // メッセージを少し見せてから、次の問題に進みます。
  setTimeout(showNextQuestion, 900);
}

// 結果画面を表示する関数です。
function showFinishScreen() {
  const elapsedSeconds = Math.floor((Date.now() - quizStartTime) / 1000);

  // 正解した数とかかった時間を表示します。
  finishTitle.textContent = "結果発表";
  correctResult.textContent = `${TOTAL_QUESTIONS}問中 ${correctCount}問正解`;
  timeResult.textContent = `かかった時間: ${formatTime(elapsedSeconds)}`;
  timeResult.classList.remove("hidden");
  mistakeTitle.textContent = "間違えた問題";
  mistakeList.innerHTML = "";

  if (mistakes.length === 0) {
    const listItem = document.createElement("li");
    listItem.textContent = "全問正解です！";
    mistakeList.appendChild(listItem);
    reviewButton.classList.add("hidden");
  } else {
    mistakes.forEach((mistake) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${mistake.questionText} あなたの答え: ${mistake.userAnswer} / 正解: ${mistake.correctAnswer}`;
      mistakeList.appendChild(listItem);
    });

    reviewButton.classList.remove("hidden");
  }

  showScreen(finishScreen);
}

// 間違えた問題だけを復習するための関数です。
function startReview() {
  isReviewMode = true;
  currentQuestionNumber = 0;
  correctCount = 0;
  reviewMistakes = [];

  // 最初に間違えた問題だけを、復習用の問題としてコピーします。
  reviewQuestions = mistakes.map((mistake) => {
    return {
      text: mistake.questionText,
      answer: mistake.correctAnswer
    };
  });

  resultMessage.textContent = "";
  showScreen(quizScreen);
  showNextQuestion();
}

// 復習モードが終わったときの結果画面を表示する関数です。
function showReviewFinishScreen() {
  finishTitle.textContent = "復習結果";
  correctResult.textContent = `${reviewQuestions.length}問中 ${correctCount}問正解`;

  // 復習結果では時間を表示しないので、時間表示の行だけ隠します。
  timeResult.classList.add("hidden");
  mistakeTitle.textContent = "復習で間違えた問題";
  mistakeList.innerHTML = "";
  reviewButton.classList.add("hidden");

  if (reviewMistakes.length === 0) {
    const listItem = document.createElement("li");
    listItem.textContent = "復習は全問正解です！";
    mistakeList.appendChild(listItem);
  } else {
    reviewMistakes.forEach((mistake) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${mistake.questionText} あなたの答え: ${mistake.userAnswer} / 正解: ${mistake.correctAnswer}`;
      mistakeList.appendChild(listItem);
    });
  }

  showScreen(finishScreen);
}

// 秒数を「○秒」または「○分○秒」の形に変える関数です。
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}秒`;
  }

  return `${minutes}分${seconds}秒`;
}

// 表示したい画面だけを見せる関数です。
function showScreen(screenToShow) {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  finishScreen.classList.add("hidden");

  screenToShow.classList.remove("hidden");
}

// minからmaxまでのランダムな整数を作る関数です。
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
