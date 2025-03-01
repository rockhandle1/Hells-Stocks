//Startup sequence variables
let gamespace = document.getElementById("gameSpace")
let gameloopExists = 0
let currentDay = 1
let successful_chance = null
let current_value = null

//Gameloop variables
let loop = false
let bankruptNum = 0
let newsGenerated = 0
let totalProfit = 0
let stockChB = 0
let MinChangeAmount = 1
let MaxChangeAmount = null
let currentGold = 100000
let successChanceMult = 0
let newsBody = ""
const endDayButton = document.getElementById("endDayButton")
const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

let stockDict = {
    candy: {
        name: "Free Candy",
        successful_chance: 60,
        current_value: 1000,
        boughtPrice: 0,
        bankrupt: 0,
        invested: 0,
        profit: 0,
        shares: 0,
        tag: "candy"
    },
    bsuit: {
        name: "Black Suit Games",
        successful_chance: 0,
        current_value: 1000000,
        boughtPrice: 0,
        bankrupt: 0,
        invested: 0,
        profit: 0,
        shares: 0,
        tag: "bsuit"
    }
}

let news = {
    0: {
        content: `Black Suit Games released a new game today! It was a success!<br><hr>`,
        chmod: 60,
        key: stockDict.bsuit
    },
    1: {
        content: `Black Suit Games released a new game today! It was a disaster!<br><hr>`,
        chmod: -25,
        key: stockDict.bsuit
    },
    2: {
        content: `Free Candy in trouble with the law, police say it's a front for drugs<br><hr>`,
        chmod: -20,
        key: stockDict.candy
    },
    3: {
        content: `Free Candy launches a large ad campaign<br><hr>`,
        chmod: 10,
        key: stockDict.candy
    }
}

//Misc Functions
function Round(input) 
{
    return input > Math.floor(input) + 0.4 ? Math.ceil(input) : Math.floor(input)
}

//Gameloop Functions
function iterateKeys(logic) {
    for(const key of Object.keys(stockDict)) {
        const currentKey = stockDict[key];
        logic(currentKey)
    }
}
function stockvalcalc(successful_chance = 50, current_value, MaxChangeAmount) {
    const rng = Round(Math.random() * 100)
    let stockvalchange = clamp((Round(Math.random() * MaxChangeAmount)), MinChangeAmount, 50000)
    if (rng > successful_chance + stockChB) {
        stockvalchange = stockvalchange * -1
    }
    return stockvalchange
}

function newsgenerator(regenerate = false) {
    let rng2 = regenerate ? 90 : Round(Math.random() * 100);
    let rng3 = Math.floor(Math.random() * Object.keys(news).length);
    //console.log(rng3);
    if(rng2 > 90){
        if (news[rng3].key.bankrupt == 1) {
            try{this(true)} catch(e){console.warn("Cannot regenerate news. " + e)};
            return
        }
        newsBody = `Day ${currentDay}: ` + news[rng3].content;
        successChanceMult = news[rng3].chmod;
        newsGenerated = 1
    }
}

function updateShares(){
    function updateSharesLogic(key) {
        if(Math.floor((document.getElementById(key.tag + "Invest").value / key.current_value)) > 0){
            document.getElementById(key.tag + "Shares").innerHTML = "You are buying " + Math.floor((document.getElementById(key.tag + "Invest").value / key.current_value)) + " shares"
        } else document.getElementById(key.tag + "Shares").innerHTML = ""
    }
    iterateKeys(updateSharesLogic);
}

function invest(clicked_id){
    function updateInvest (key) {
        if (clicked_id == key.tag + "Invest" && key.bankrupt == 0) {
            const sharesBought = Math.floor(document.getElementById(key.tag + "Invest").value / key.current_value);
            currentGold = Math.floor(currentGold - (key.current_value * sharesBought));
            key.boughtPrice = ((key.current_value * sharesBought) + (key.shares * key.boughtPrice)) / (key.shares + sharesBought);
            key.shares += sharesBought;
            console.log(key.boughtPrice);
        }
    }
    iterateKeys(updateInvest);
    GameLoop.updateStats()
}

function sellAll(clicked_id) {
    function sellAllLogic(key) {
        //console.log(clicked_id);
        if (key.tag + "Sell" != clicked_id) return;
        key.shares = 0;
        currentGold = currentGold + key.profit;
        totalProfit -= key.profit;
        key.profit = 0;
    }
    iterateKeys(sellAllLogic);
    GameLoop.updateStats();
}
//Main javascript
function runGameLoop() {
    if (gameloopExists == 0) {
        gameloopExists = 1;
        GameLoop = new GameLoop();
        GameLoop.start();
        GameLoop.run();
        GameLoop.looper();
    } else {
        GameLoop.start();
        GameLoop.run();
        GameLoop.looper();
    }
}

document.onkeyup = event => {
    if(event.code == 'Numpad0') {
        GameLoop.endDay();
        endDayButton.style.removeProperty("transform");
    }
}
document.onkeydown = event => { if(event.code == 'Numpad0') endDayButton.style.transform = "translateY(1rem)" }

class GameLoop {
    constructor() {

    }
    updateStats() {
        document.getElementById("gold").innerHTML = `Gold: ${currentGold}`;
        document.getElementById("day").innerHTML = `Day: ${currentDay}`;
        document.getElementById("totalProfit").innerHTML = `Total Profit: ${totalProfit}`;
        function updateStockHTML(key) {
            document.getElementById(key.tag).innerHTML = `${key.name}: ${key.current_value}`;
            document.getElementById(key.tag + "Profit").innerHTML = `Profit: ${key.profit}`;
            document.getElementById(key.tag + "OwnedShares").innerHTML = `Owned Shares: ${key.shares}`;
        }
        iterateKeys(updateStockHTML);
        document.getElementById("totalProfit").innerHTML = `Total Profit: ${totalProfit}`;
        document.getElementById("stockChB").innerHTML = `Stock Chance Boost: ${stockChB}%`;
        if (newsGenerated == 1) { document.getElementById("newsBody").innerHTML = `${newsBody}` + document.getElementById("newsBody").innerHTML; newsGenerated = 0}
    }
    start() {
        console.log(`screen width: ${screen.width}, height: ${screen.height}`);
        this.updateStats();
    }
    looper() {
        function loop() {
            console.log("looping...");
            if(loop == true) requestAnimationFrame(loop);
        }
        if(loop == true) requestAnimationFrame(loop);
    }
    endDay() {
        totalProfit = 0;
        function endDayLogic(key) {
            bankruptNum = 0;
            if(key.bankrupt == 0){
                key.yesterday_value = key.current_value;
                key.successful_chance = clamp(key.successful_chance + successChanceMult, 0, 100);
                const stockvalchange = stockvalcalc(key.successful_chance, key.current_value, Math.min(key.current_value / 2, 50000));
                key.current_value = Math.max(key.current_value + stockvalchange, 0);
                if(key.shares > 0) {
                    key.profit = key.shares * (key.current_value - key.boughtPrice);
                    totalProfit = totalProfit + key.profit;
                }
                if(key.current_value == 0){
                    key.bankrupt = 1;
                    key.current_value = "BANKRUPT"
                }
            }
        }
        function bailOutCompanies(key) {
            if(key.bankrupt == 1) bankruptNum++;
            console.log(bankruptNum);
            if(bankruptNum == 2) {
                function allBankruptLogic(key) {
                    key.bankrupt = 0;
                    key.current_value = key.current_value > 0 ? key.current_value : 20000;
                }
                iterateKeys(allBankruptLogic);
                newsBody = `Day ${currentDay}: All companies are bankrupt! The government has bailed out companies to help the economy!<br><hr>`;
                newsGenerated = 1;
            }
        }
        iterateKeys(endDayLogic);
        iterateKeys(bailOutCompanies);
        currentDay = currentDay + 1;
        if(currentGold > 999999999){
            stockChB = 10;
        }
        newsgenerator();
        this.updateStats();
    }
    run() {

    }
    quit() {
        clearInterval(timer);
        console.log("Game Ended")
    }
}
