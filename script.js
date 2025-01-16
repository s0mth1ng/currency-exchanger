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
    },
    {
        from: "RUB",
        to: "EUR",
        rate: 0.0095,
        fee: 0.00,
    },
    {
        from: "EUR",
        to: "RUB",
        rate: 105.52,
        fee: 0.025,
    },
    {
        from: "USD",
        to: "EUR",
        rate: 0.97,
        fee: 0.0,
    },
    {
        from: "EUR",
        to: "USD",
        rate: 1.03,
        fee: 0.0,
    },
    {
        from: "RUB",
        to: "CYN",
        rate: 0.0718,
        fee: 0.3,
    },
    {
        from: "CYN",
        to: "EUR",
        rate: 0.1312,
        fee: 0.0,
    },
    {
        from: "EUR",
        to: "CYN",
        rate: 7.62,
        fee: 0.0,
    },
    {
        from: "CYN",
        to: "USD",
        rate: 0.1354,
        fee: 0.0,
    },
]
var CURS2RATE = Object.assign({}, ...INITIAL_RATES.map((v) => {
    return { [`${v['from']}-${v['to']}`]: { rate: v['rate'], fee: v['fee'] } };
}));
const CURRENCIES = [... new Set(INITIAL_RATES.flatMap(v => [v.from, v.to]))];

function insertRate(rate) {
    var rates = document.getElementById("rates");
    var row = document.createElement("div")
    row.innerHTML = `<label>${rate['from']} -> ${rate['to']}:</label>
    <input onchange="rateChange(this)" type="number" id="rate-${rate['from']}-${rate['to']}" value="${rate['rate']}"> +
    <input onchange="feeChange(this)" type="number" id="fee-${rate['from']}-${rate['to']}" placeholder="Fee %" value="${rate['fee'] * 100}">%<br>`
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

function rateChange(node) {
    const curs = node.id.slice(5);
    if (!(curs in CURS2RATE)) {
        return;
    }
    CURS2RATE[curs].rate = node.value;
}

function feeChange(node) {
    const curs = node.id.slice(4);
    if (!(curs in CURS2RATE)) {
        return;
    }
    CURS2RATE[curs].fee = node.value / 100;
}

// https://stackoverflow.com/a/20871714
const permutator = (inputArr) => {
    let result = [];

    const permute = (arr, m = []) => {
        if (arr.length === 0) {
            result.push(m)
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
    }
    permute(inputArr)
    return result;
}

function getSubsets(arr) {
    subsets = [];
    for (let mask = 0; mask < 1 << arr.length; mask++) {
        var v = mask;
        var res = [];
        for (let i = 0; i < arr.length; i++) {
            if (v & 1 === 1) {
                res.push(arr[i]);
            }
            v >>= 1;
        }
        permutator(res).forEach(s => subsets.push(s));
    }
    return subsets;
}

function prepareChains(from, to, currencies, limit) {
    const other = currencies.filter(v => ![from, to].includes(v));
    const subsets = getSubsets(other).sort(v => v.length);
    const chains = subsets.map(s => [from, ...s, to]);
    return chains.slice(0, limit);
}

function setResult(node, res, to) {
    if (res !== null) {
        node.innerHTML = `${res} ${to}`;
        node.style = "color:green";
    } else {
        node.innerHTML = "Not enough data (probably unknown currencies";
        node.style = "color:red";
    }
}

function handleDrag(e) {
    chain = Array.from(e.to.getElementsByClassName("chain-item")).map(v => v.textContent);
    const amount = parseFloat(document.getElementById("amount").value);
    res = calculateChainResult(CURS2RATE, chain, amount);
    setResult(e.to.parentElement.getElementsByClassName("chain-result")[0], res, chain.at(-1));
}

function calculate() {
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const amount = parseFloat(document.getElementById("amount").value);

    output = document.getElementById("output");
    output.innerHTML = "";
    const chains = prepareChains(from, to, CURRENCIES, 10);
    const chain2result = chains.map(chain => [chain, calculateChainResult(CURS2RATE, chain, amount)])
    chain2result.sort((a, b) => b[1] - a[1]);
    console.log(chain2result);
    chain2result.forEach(v => {
        const chain = v[0];
        const res = v[1];
        var chainNode = document.createElement("div");
        chainNode.className = "chain";
        var chainItems = document.createElement("div");
        chainItems.className = "chain-items";
        chain.forEach(cur => {
            var curSpan = document.createElement("div");
            curSpan.innerHTML = cur;
            curSpan.className = "chain-item";
            chainItems.appendChild(curSpan);
        });

        var node = document.createElement("div");
        node.className = "chain-result";
        if (res !== null) {
            node.innerHTML = `${res} ${to}`;
            node.style = "color:green";
        } else {
            node.innerHTML = "Not enough data (probably unknown currencies";
            node.style = "color:red";
        }
        chainNode.appendChild(chainItems);
        chainNode.appendChild(node);
        output.appendChild(chainNode);
        new Sortable(chainItems, {
            animation: 150,
            onEnd: (e) => handleDrag(e)
        });
    })
}
