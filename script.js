
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const TIME_UNLOCK_ANSWERS = 1; //sn
const TIME_QUESTION_DURATION = 30; //sn
const MAX_QUESTION = 10;

const appContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const resultContainer = document.getElementById('result-container');

const questionTextElement = document.getElementById('question-text');
const questionNoElement = document.getElementById('question-no');
const answerOptionsElement = document.getElementById('answer-options');
const skipButtonElement = document.getElementById('skip-question');
const leftTimeElement = document.getElementById('left-time');

let questions = [];
let currentQuestionIndex = 0;
let timer_unlockAnswers;
let timer_nextQuestion;
let interval_leftTime;

const optionLetters = ['A', 'B', 'C', 'D'];

document.addEventListener('DOMContentLoaded', async () => {

  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(data => {
      questions = data.slice(0, MAX_QUESTION).map((item, index) => {
        return {
          text: `${capitalizeFirstLetter(item.body)}?`,
          answerOptions: [
            item.body.split(' ')[0],
            item.body.split(' ')[1],
            item.body.split(' ')[2],
            item.body.split(' ')[3]
          ],
          correctAnswer: Math.floor(Math.random() * 4),
          selectedAnswer: -1 // -1 means not answered
        };
      });
      startQuiz();
    })
    .catch(error => console.error('Error fetching questions:', error));

  skipButtonElement.addEventListener('click', () => {
    saveAnswer(currentQuestionIndex, -1);
  });
});

function startQuiz() {
  showQuestion(0);
}

function showQuestion(questionIndex) {
  currentQuestionIndex = questionIndex;
  const question = questions[questionIndex];
  console.log(questionIndex + 1, question);
  questionTextElement.textContent = question.text;
  questionNoElement.textContent = `${questionIndex + 1}/${questions.length}`;
  answerOptionsElement.innerHTML = '';
  question.answerOptions.forEach((option, index) => {
    const button = document.createElement('button');
    button.classList.add("answer");
    button.classList.add("disable");
    button.textContent = `${optionLetters[index]}) ${capitalizeFirstLetter(option)}`;
    button.disabled = true;
    button.addEventListener('click', () => saveAnswer(questionIndex, index));
    answerOptionsElement.appendChild(button);
  });
  skipButtonElement.classList.add("disable");
  skipButtonElement.classList.remove("enable");
  skipButtonElement.disabled = true;

  timer_unlockAnswers = setTimeout(() => {
    const answerOptionElements = document.querySelectorAll('button.answer');
    answerOptionElements.forEach(element => {
      element.classList.remove("disable");
      element.classList.add("enable");
      element.disabled = false;
    });
    skipButtonElement.classList.remove("disable");
    skipButtonElement.classList.add("enable");
    skipButtonElement.disabled = false;
  }, TIME_UNLOCK_ANSWERS * 1000);

  // timer_nextQuestion = setTimeout(() => {
  //   saveAnswer(questionIndex, -1); // -1 means not answered
  // }, TIME_QUESTION_DURATION * 1000);

  let timeLeft = TIME_QUESTION_DURATION;
  leftTimeElement.textContent = timeLeft;
  interval_leftTime = setInterval(() => {
    timeLeft--;
    leftTimeElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      saveAnswer(questionIndex, -1);
    }
  }, 1000);

}

function saveAnswer(questionIndex, answerIndex) {
  clearTimeout(timer_unlockAnswers);
  clearTimeout(timer_nextQuestion);
  clearInterval(interval_leftTime);
  questions[questionIndex].selectedAnswer = answerIndex;
  console.log(`Question: ${questionIndex + 1}, Answer: ${answerIndex + 1}`);

  if (questionIndex < questions.length - 1) {
    showQuestion(questionIndex + 1);
  } else {
    showResult();
  }
}

function showResult() {
  questionContainer.style.display = 'none';
  resultContainer.style.display = 'flex';

  questions.forEach((question, index) => {
    const resultRow = document.createElement('div');
    const questionNo = document.createElement('p');
    const resultQuestion = document.createElement('p');
    const resultAnswer = document.createElement('p');
    resultAnswer.classList.add('result-answer');
    questionNo.textContent = `Question ${index + 1}`;
    resultQuestion.textContent = `${question.text}`;
    if (question.selectedAnswer === -1) {
      resultAnswer.textContent += `-`;
      resultRow.classList.add('null-result-row');
    } else if (question.selectedAnswer === question.correctAnswer) {
      resultAnswer.textContent = `${optionLetters[question.selectedAnswer]}) `;
      resultAnswer.textContent += question.answerOptions[question.selectedAnswer];
      resultRow.classList.add('correct-result-row');
    } else {
      resultAnswer.textContent = `${optionLetters[question.selectedAnswer]}) `;
      resultAnswer.textContent += question.answerOptions[question.selectedAnswer];
      resultRow.classList.add('incorrect-result-row');
    }

    resultRow.appendChild(questionNo);
    resultRow.appendChild(resultQuestion);
    resultRow.appendChild(resultAnswer);
    resultContainer.appendChild(resultRow);
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}