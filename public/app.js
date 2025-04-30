async function loadValue() {
    const res = await fetch("/api/value");
    const data = await res.json();
    document.getElementById("current-value").textContent = data.value;
    document.getElementById("new-value").value = data.value;
    document.getElementById("change-date").value = data.date;
}

async function updateValue() {
    const newValue = parseFloat(document.getElementById("new-value").value);
    const reason = document.getElementById("change-reason").value;
    const gamedate = document.getElementById("change-date").value;

    await fetch("/api/value", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newValue, reason, gamedate })
    });

    document.getElementById("change-reason").value = "";

    loadValue();
    loadHistory();
}

async function loadHistory() {
    const res = await fetch("/api/logs");
    const data = await res.json();

    const list = document.getElementById("history-list");
    list.innerHTML = "";
    data.forEach(log => {
        const li = document.createElement("li");
        li.textContent = `${log.gamedate} : [${log.old_value} → ${log.new_value}] (${log.reason})`;
        list.appendChild(li);
    });
}

async function inflationCalculator() {
    const res = await fetch("/api/value");
    const data = await res.json();
    const currentPrice = data.value;
    const d20Roll = document.getElementById("inflation-d20").value;

    const minPercent = 0.001; // 0.1%
    const maxPercent = 0.1;  // 5%
    const percent = minPercent + ((d20Roll - 1) / 19) * (maxPercent - minPercent);

    const increase = Math.random() < 0.5;
    const direction = increase ? 1 : -1;
    const newValue = currentPrice * (1 + direction * percent);

    document.getElementById("inflation-result").textContent = `${Math.round(percent * 10000) / 100}% ${increase ? "increase" : "decrease"} [new value: ${Math.ceil(Math.round(newValue * 100) / 100)}]`;
}

async function addPlayer(){
    const pname = prompt("Enter player name:")
    if(!pname) return;

    fetch("api/player", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: pname,
            perception: 0,
            maxhp: 0,
            corruption: 0,
            copper: 0,
            silver: 0,
            gold: 0,
            platinum: 0,
            gnaw: 0
        })
    })
    loadPlayers();
}

async function loadPlayers(){
    const res = await fetch("/api/players");
    const players = await res.json();    
    //console.log(players);
    const parent = document.getElementById("players");
    parent.innerHTML = ``;
    players.forEach(p =>{
        const container = document.createElement("div");
        container.className = `player-card`;
        container.id = p.name;
        container.innerHTML = `
            <input class="input" id="${p.name}-name-input" value="${p.name}">
            <p> HP:
                <input class="input" id="${p.name}-hp-input" value="${p.maxhp}">
            </p>
            <p> PP:
                <input class="input" id="${p.name}-pp-input" value="${p.perception}">
            </p>
            <p> Madness:
                <input class="input" id="${p.name}-mad-input" value="${p.corruption}">
            </p>
            <div class="currency-div">
                <div>Copper:
                    <input class="input p-currency-input" id="${p.name}-c-input" value="${p.copper}">
                </div>
                <div>Silver:
                    <input class="input p-currency-input" id="${p.name}-s-input" value="${p.silver}">
                </div>
                <div>Gold:
                    <input class="input p-currency-input" id="${p.name}-g-input" value="${p.gold}">
                </div>
                <div>Platinum:
                <input class="input p-currency-input" id="${p.name}-p-input" value="${p.platinum}">
                </div>
                <div>Gnaws:
                    <input class="input p-currency-input" id="${p.name}-gnaw-input" value="${p.gnaw}">
                </div>
            </div>
            
            `;
            parent.appendChild(container);
            /*
            <h2>${p.name}</h2>
            <p>[HP: ${p.maxhp}] [PP: ${p.perception}] [Madness: ${p.corruption}]</p>
            <p>[C:${p.copper} S:${p.silver} G:${p.gold} P:${p.platinum}]</p>
            <p>[Gnaws: ${p.gnaw}]</p>
        */
    })
}

async function updatePlayers(){
    const playerCards = document.querySelectorAll(".player-card");
    const players = [];

    playerCards.forEach(card => {
        console.log(card.id)
    })
    /*
    for (let index = 0; index < players.length; index++) {
        
    
    
    fetch("api/players", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {
                name: pname,
                perception: 0,
                maxhp: 0,
                corruption: 0,
                copper: 0,
                silver: 0,
                gold: 0,
                platinum: 0,
                gnaw: 0
            }
        )
    })
}
*/
    
}

loadValue();
loadPlayers();
loadHistory();