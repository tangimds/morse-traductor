var pressed = {},
  audio = document.getElementById('sound'),
  duration,
  volume = 0.5,
  startTime = 0,
  elpasedTime = 0,
  tiTime = 200,
  listening = false;

audio.volume = volume;

var readingLetter = [];
var readingWord = [];
var bufferWords = new Buffer(10, 10, 20);

// authorize the popovers
$(function () {
  $('[data-toggle="popover"]').popover()
});

var morseCode = {
  a: "._", b: "_...", c: "_._.", d: "_..", e: ".",
  f: ".._.", g: "__.", h: "....", i: "..", j: ".___",
  k: "_._", l: "._..", m: "__", n: "_.", o: "___",
  p: ".__.", q: "__._", r: "._.", s: "...", t: "_",
  u: ".._", v: "..._", w: ".__", x: "_.._", y: "_.__", z: "__..",
  1: ".____", 2: "..___", 3: "...__", 4: "...._", 5: ".....",
  6: "_....", 7: "__...", 8: "___..", 9: "____.", 0: "_____"
};

function getKeyByValue(object, value) {
  let k = Object.keys(object).find(key => object[key] === value);
  if (k === undefined) k = '?';
  return k;
}

function getValue(object, value) {
  value = value.toLowerCase();
  let v = object[value];
  if (v === undefined) v = '?';
  return v;
}

function setup() {
  //createCanvas(window.innerWidth, window.innerHeight / 2);
  startTime = Date.now();
}

function draw() {
  loopSound(audio.currentTime);
  elpasedTime = Date.now() - startTime;
  if (elpasedTime > 7 * tiTime && wordNotEmpty()) {
    let word = readingWord.join("");
    console.log(word);
    readingWord = [];
    bufferWords.add(" ");
    console.log("new word");
  } else if (elpasedTime > 3 * tiTime && letterNotEmpty()) {
    let letterMorse = readingLetter.join("");
    console.log(letterMorse);
    let letter = getKeyByValue(morseCode, letterMorse);
    console.log(letter);
    readingWord.push(letter);
    bufferWords.add(letter);
    readingLetter = [];
  } else {
    //console.log("new bip ?");
  }

  bufferWords.update();
  if(listening)
    $('#listen_button').attr("disabled",true);
  else {
    $('#listen_button').attr("disabled",false);
    $('#listen_button').popover('hide');
  }

}

function letterNotEmpty() {
  return readingLetter.length !== 0;
}

function wordNotEmpty() {
  return readingWord.length !== 0;
}

function read(time) {
  if (time <= tiTime) {
    readingLetter.push('.');
  } else {
    readingLetter.push('_');
  }
}

function loopSound(t) {
  if (t > 22) {
    audio.currentTime = 0.2;
    console.log("looping sound");
  }
}

document.onkeydown = function (e) {
  if (pressed[e.which]) return;
  if (e.keyCode === 32 && e.shiftKey) {
    pressed[e.which] = e.timeStamp;
    audio.currentTime = 0.2;
    audio.play();
  } else if (e.keyCode === 8 && e.ctrlKey) {
    bufferWords.clear();
  } else if (e.keyCode === 8) {
    bufferWords.delete();
  } 
};

document.onkeyup = function (e) {
  if (!pressed[e.which]) return;

  // space bar
  if (e.keyCode === 32) {

    // Calculate press time
    elpasedTime = (e.timeStamp - pressed[e.which]);

    audio.pause();
    audio.currentTime = 0;

    pressed[e.which] = 0;

    // Log press duration and resulting volume
    read(elpasedTime, true);
    startTime = Date.now();
    return false;
  }
};

// Frequency
var slider = document.getElementById("myRange");
var titime = document.getElementById("titime");
titime.innerHTML = slider.value / 1000 + "Hz";
slider.oninput = function () {
  titime.innerHTML = this.value / 1000 + "Hz";
  tiTime = this.value;
}


buttonListen = document.getElementById("listen_button");
//text = document.getElementById("myText");
//morseTrad = document.getElementById("morseTrad");
//morseTrad.innerHTML = getMorse(text.value);

buttonListen.onclick = function () {
  $(this).attr('data-content',getMorse(input_text.value));
  if(!listening)
    play(input_text.value);
}

buttonTranslate = document.getElementById("translate_button");
morseInput = document.getElementById("input_morse");
//morseTrad = document.getElementById("morseTrad");
//morseTrad.innerHTML = getMorse(text.value);

buttonTranslate.onclick = function () {
  console.log()
  $(this).attr('data-content',getText(input_morse.value));
}

morseInput.oninput = function () {
  console.log("typing");
  $('#translate_button').popover('hide');
}

morseInput.onclick = function () {
  console.log('clicking');
  $('#translate_button').popover('hide');
}

function playNextAudio(bips) {
  if (bips.length === 0){
    console.log("stop listening");
    $('#listen_button').popover('hide');
    listening = false;
    return;
  }
  let bip = bips[0];
  let time = 0;
  let play = false;
  switch (bip) {
    case "?":
      time = 0;
      break;
    case "/":
      time = tiTime;
      break;
    case "/letter":
      time = 3 * tiTime;
      break;
    case "/word":
      time = 7 * tiTime;
      break;
    case ".":
      play = true;
      time = tiTime;
      break;
    case "_":
      play = true;
      time = 3 * tiTime;
      break;

  }
  if (play) audio.play();
  setTimeout(function () {
    audio.pause();
    audio.currentTime = 0;
    bips.splice(0, 1);
    playNextAudio(bips)
  }, time);
}

function play(text) {
  listening = true;
  let letters = text.split("");
  let lettersMorse = [];
  for (let i = 0; i < letters.length; i++) {
    if (letters[i] !== " ") {
      (getValue(morseCode, letters[i]).split("")).forEach(function (bip) {
        lettersMorse.push(bip);
        lettersMorse.push("/");
      });
      lettersMorse.splice(lettersMorse.length - 1, 1);
      lettersMorse.push("/letter");
    }
    else {
      lettersMorse.splice(lettersMorse.length - 1, 1);
      lettersMorse.push("/word");
      continue;
    }

  }
  console.log(lettersMorse);
  playNextAudio(lettersMorse);
}

function getMorse(text) {
  let letters = text.split("");
  let lettersMorse = [];
  for (let i = 0; i < letters.length; i++) {
    if (letters[i] !== " ") {
      let w = getValue(morseCode, letters[i]);
      lettersMorse.push(w);
      lettersMorse.push("/");
    }
    else {
      lettersMorse.splice(lettersMorse.length - 1, 1);
      lettersMorse.push("//");
      continue;
    }
  }
  lettersMorse.splice(lettersMorse.length - 1, 1);

  return lettersMorse.join('');
}

function getText(morse){
  let lettersMorse = morse.split("/");
  let letters = [];
  for (let i = 0; i < lettersMorse.length; i++) {
    if (lettersMorse[i] !== "") {
      let w = getKeyByValue(morseCode, lettersMorse[i]);
      letters.push(w);
    }
    else {
      letters.push(" ");
      continue;
    }
  }
  return letters.join('');
}