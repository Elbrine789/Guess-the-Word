const words = [
  // Common words
  { word: "hello", category: "greeting" },
  { word: "goodbye", category: "greeting" },
  { word: "thank you", category: "expression" },
  { word: "please", category: "expression" },
  
  // Food
  { word: "apple", category: "fruit" },
  { word: "banana", category: "fruit" },
  { word: "orange", category: "fruit" },
  { word: "bread", category: "food" },
  { word: "water", category: "drink" },
  { word: "coffee", category: "drink" },
  
  // Places
  { word: "school", category: "place" },
  { word: "hospital", category: "place" },
  { word: "restaurant", category: "place" },
  { word: "airport", category: "place" },
  
  // Objects
  { word: "book", category: "object" },
  { word: "computer", category: "object" },
  { word: "phone", category: "object" },
  { word: "key", category: "object" },
  
  // Actions
  { word: "run", category: "action" },
  { word: "jump", category: "action" },
  { word: "swim", category: "action" },
  { word: "read", category: "action" },
  
  // Emotions
  { word: "happy", category: "emotion" },
  { word: "sad", category: "emotion" },
  { word: "angry", category: "emotion" },
  { word: "love", category: "emotion" },
  
  // Time
  { word: "morning", category: "time" },
  { word: "afternoon", category: "time" },
  { word: "evening", category: "time" },
  { word: "tomorrow", category: "time" },
  
  // Phrases
  { word: "how are you", category: "phrase" },
  { word: "what time is it", category: "phrase" },
  { word: "where is the bathroom", category: "phrase" },
  { word: "how much does it cost", category: "phrase" }
];

let currentWord = "";
let score = 0;
let wordsPlayed = 0;
const totalWords = words.length;

const targetLangMap = {
  "id": "id-ID",
  "es": "es-ES",
  "fr": "fr-FR",
  "ja": "ja-JP",
  "de": "de-DE",
  "it": "it-IT"
};

function updateProgress() {
  const progress = (wordsPlayed / totalWords) * 100;
  document.getElementById("progressBar").style.width = `${progress}%`;
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function playWord() {
  if (wordsPlayed >= totalWords) {
    alert("Congratulations! You've completed all words.");
    return;
  }

  const availableWords = words.filter(w => w.word !== currentWord);
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  currentWord = availableWords[randomIndex].word;

  document.getElementById("correctAnswer").textContent = "-";
  document.getElementById("userSpeech").textContent = "-";
  document.getElementById("translation").textContent = "-";
  document.getElementById("hint").textContent = "-";
  document.getElementById("textAnswer").value = "";

  translateAndSpeak(currentWord);
  wordsPlayed++;
  updateProgress();
}

function skipWord() {
  if (!currentWord) return;
  
  document.getElementById("correctAnswer").textContent = currentWord;
  document.getElementById("translation").textContent = "-";
  playWord();
}

function showAnswer() {
  if (!currentWord) return;
  
  document.getElementById("correctAnswer").textContent = currentWord;
  translateAndSpeak(currentWord);
}

function getHint() {
  if (!currentWord) {
    alert("No word is currently playing. Click 'Play Word' first.");
    return;
  }

  const word = currentWord.toLowerCase();
  const wordObj = words.find(w => w.word.toLowerCase() === word);
  
  let hint = "";
  const wordLength = word.length;
  const firstLetter = word[0];
  const lastLetter = word[wordLength-1];
  const vowelCount = (word.match(/[aeiou]/gi) || []).length;
  
  // Basic hint about the word
  if (wordLength <= 3) {
    hint = `Very short word (${wordLength} letters)`;
  } else if (wordLength <= 5) {
    hint = `Short word (${wordLength} letters)`;
  } else {
    hint = `${wordLength}-letter word`;
  }
  
  // Add first letter hint after first try
  hint += `, starts with '${firstLetter.toUpperCase()}'`;
  
  // Add category hint
  if (wordObj) {
    hint += `, related to ${wordObj.category}`;
  }
  
  // Add vowel count for longer words
  if (wordLength > 6) {
    hint += `, has ${vowelCount} vowels`;
  }
  
  // Special hints for phrases
  if (wordObj?.category === "phrase") {
    hint += ` (common ${wordObj.category})`;
    const wordCount = word.split(' ').length;
    hint += `, ${wordCount}-word phrase`;
  }

  document.getElementById("hint").textContent = hint;
}

function checkTypedAnswer() {
  const typed = document.getElementById("textAnswer").value.toLowerCase().trim();
  if (typed === "") return;
  
  document.getElementById("userSpeech").textContent = typed;

  if (typed === currentWord.toLowerCase()) {
    document.getElementById("correctAnswer").textContent = "Correct! 🎉";
    score += 10;
    updateScore();
    setTimeout(playWord, 1500);
  } else {
    document.getElementById("correctAnswer").textContent = "Incorrect 😞";
  }
}

function startRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Your browser doesn't support speech recognition. Use Chrome or Edge.");
    return;
  }

  const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  
  document.getElementById("userSpeech").textContent = "Listening...";
  
  recognition.start();

  recognition.onresult = function(event) {
    const speechResult = event.results[0][0].transcript.toLowerCase().trim();
    document.getElementById("userSpeech").textContent = speechResult;

    if (speechResult === currentWord.toLowerCase()) {
      document.getElementById("correctAnswer").textContent = "Correct! 🎉";
      score += 10;
      updateScore();
      setTimeout(playWord, 1500);
    } else {
      document.getElementById("correctAnswer").textContent = "Incorrect 😞";
    }
  };

  recognition.onerror = function(event) {
    console.error("Recognition error", event.error);
    document.getElementById("userSpeech").textContent = "Error: " + event.error;
  };
}

function translateAndSpeak(word) {
  if (!word) return;

  const targetLang = document.getElementById("language").value;

  fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(word)}`)
    .then(res => res.json())
    .then(data => {
      const translated = data[0][0][0];
      document.getElementById("translation").textContent = translated;

      const utter = new SpeechSynthesisUtterance(translated);
      utter.lang = targetLangMap[targetLang] || "en-US";
      window.speechSynthesis.speak(utter);
    })
    .catch(err => {
      document.getElementById("translation").textContent = "(Translation failed)";
      console.error("Error:", err);
    });
}

// Initialize the game
updateScore();
updateProgress();