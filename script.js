const INITIAL_RATES = [
    {
        from: "RUB",
        to: "USD",
        rate: 0.0098,
        fee: 0.01,
    },
    {
        from: "USD",
        to: "RUB",
        rate: 102.49,
        fee: 0.02,
    }
]
const CURS2RATE = Object.assign({}, ...INITIAL_RATES.map((v) => {
    return { [`${v['from']}-${v['to']}`]: { rate: v['rate'], fee: v['fee'] } };
}));

function insertRate(rate) {
    console.log(rate);
    var rates = document.getElementById("rates");
    var row = document.createElement("div")
    row.innerHTML = `<label>${rate['from']} -> ${rate['to']}:</label>
    <input type="number" id="rate-${rate['rom']}-${rate['to']}" value="${rate['rate']}"> +
    <input type="number" id="fee-${rate['rom']}-${rate['to']}" placeholder="Fee %" value="${rate['fee'] * 100}">%<br>`
    rates.appendChild(row);
}

INITIAL_RATES.forEach(insertRate)

function calculateChainResult(curs2rate, chain, amount) {
    var res = amount;
    for (let i = 1; i < chain.length; i++) {
        curs = `${chain[i - 1]}-${chain[i]}`;
        if (!(curs in curs2rate)) {
            console.log(`${curs} not in curs2rate`);
            return null;
        }
        rate = curs2rate[curs];
        res = res * rate.rate * (1 - rate.fee);
    }
    return Math.round(res * 100) / 100;
}

function calculate() {
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const amount = parseFloat(document.getElementById("amount").value);

    const chain = [from, to];
    const res = calculateChainResult(CURS2RATE, chain, amount)

    const resId = "res";
    var node = document.getElementById(resId);
    if (node === null) {
        var node = document.createElement("div");
        node.setAttribute("id", resId);
        document.getElementById("output").appendChild(node);
    }
    node.innerHTML = `<span>${res}</span> <span>${to}</span>`
}