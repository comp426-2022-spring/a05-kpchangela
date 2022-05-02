// Focus div based on nav button click
let curr = "home";
function changeFocus(button) {
  const id = button.id.slice(0,-3);
  document.getElementById(curr).className = "hidden";
  if (id != "home") {
    document.getElementById(id).className = "active";
  } else {
    document.getElementById("home").classList.remove("hidden");
  }
  curr = id;
}

async function singleFlip() {
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await fetch('http://localhost:5555/app/flip', requestOptions);
  let resp = await response.json();
  console.log(`Flip Result: ${resp.flip}`);
  document.getElementById("single-flip-result").src = `./assets/img/${resp.flip}.png`;
}

async function multiFlip(number) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: number })
  };
  const response = await fetch('http://localhost:5555/app/flip/coins', requestOptions);
  let resp = await response.json();
  const headsVal = resp.summary.heads;
  const tailsVal = resp.summary.tails;
  document.getElementById("heads-bar").style.height = `${20*headsVal}px`;
  document.getElementById("tails-bar").style.height = `${20*tailsVal}px`;
  document.getElementById("multi-summary").innerText = `Summary: Heads-${headsVal}    Tails-${tailsVal}`;
  document.getElementById("multi-results").classList.remove("hidden");
}

async function guessFlip(call) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ call: call })
  };
  const response = await fetch('http://localhost:5555/app/flip/call', requestOptions);
  let resp = await response.json();
  const flip = resp.flip;
  const result = resp.result;
  document.getElementById("guess-flip-result").src = `./assets/img/${flip}.png`;
  document.getElementById("user-guess").innerText = `Your Guess: ${call}`;
  const resultElem = document.getElementById("guess-win-lose");
  if (result === "win") {
    resultElem.className = "win";
    resultElem.innerText = `WIN`;
  } else {

    resultElem.className = 'lose';
    resultElem.innerText = `LOSE`;
  }
  document.getElementById("guess-results").classList.remove("hidden");
}