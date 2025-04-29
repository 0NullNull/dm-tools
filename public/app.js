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
    const maxPercent = 0.05;  // 5%
    const percent = minPercent + ((d20Roll - 1) / 19) * (maxPercent - minPercent);

    const increase = Math.random() < 0.5;
    const direction = increase ? 1 : -1;
    const newValue = currentPrice * (1 + direction * percent);

    document.getElementById("inflation-result").textContent = `${Math.round(percent * 10000) / 100}% ${increase ? "increase" : "decrease"} [new value: ${Math.ceil(Math.round(newValue * 100) / 100)}]`;
}

loadValue();
loadHistory();