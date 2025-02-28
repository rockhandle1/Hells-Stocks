//Startup sequence variables
let gamespace = document.getElementById("gameSpace")
let gameloopExists = 0
let timer = null
let currentDay = 1
let successful_chance = null
let current_value = null

//Gameloop variables
let newsGenerated = 0
let totalProfit = 0
let stockChB = 0
let MinChangeAmount = 1
let MaxChangeAmount = null
let startingGold = 100000
let currentGold = null
let successChanceMult = 0
let newsBody = ""
const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

let stockDict = {
    candy: {
        name: "Free Candy",
        successful_chance: 100,
        current_value: 1000,
        yesterday_value: undefined,
        bankrupt: 0,
        invested: 0,
        stockProfit: 0,
        shares: 0,
        tag: "candy"
    },
    bsuit: {
        name: "Black Suit Games",
        successful_chance: 10,
        current_value: 1000000,
        yesterday_value: undefined,
        bankrupt: 0,
        invested: 0,
        stockProfit: 0,
        shares: 0,
        tag: "bsuit"
    }
}

let news = {
    0: {
        content: `Black Suit Games released a new game today! It was a success!<br><hr>`,
        chmod: 60,
        tag: "bsuit"
    },
    1: {
        content: `Black Suit Games released a new game today! It was a disaster!<br><hr>`,
        chmod: -5,
        tag: "bsuit"
    },
    2: {
        content: `Free Candy in trouble with the law, police say it's a front for drugs<br><hr>`,
        chmod: -20,
        tag: "candy"
    },
    3: {
        content: `Free Candy launches a large ad campaign<br><hr>`,
        chmod: 10,
        tag: "candy"
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

function newsgenerator() {
    let rng2 = Round(Math.random() * 100);
    let rng3 = Math.floor(Math.random() * Object.keys(news).length);
    console.log(rng3);
    if(rng2 > 90){
        newsBody = `Day ${currentDay}: ` + news[rng3].content;
        successChanceMult = news[rng3].chmod;
        newsGenerated = 1
    } else newsGenerated = 0;
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
        if (clicked_id == key.tag + "Invest" && key.bankrupt == 0) currentGold = Math.floor(currentGold - (key.current_value * Math.floor((document.getElementById(key.tag + "Invest").value / key.current_value))))
    }
    iterateKeys(updateInvest);
    GameLoop.updateStats()
}
//Main javascript
function runGameLoop() {
    if (gameloopExists == 0) {
        gameloopExists = 1;
        GameLoop = new GameLoop();
        GameLoop.start();
        GameLoop.run();
    } else {
        GameLoop.start();
        GameLoop.run();
    }
    timer = setInterval(GameLoop.looper(), 100);
    timer
}
class GameLoop {
    constructor() {

    }
    updateStats() {
        document.getElementById("gold").innerHTML = `Gold: ${currentGold}`;
        document.getElementById("day").innerHTML = `Day: ${currentDay}`;
        document.getElementById("totalProfit").innerHTML = `Total Profit: ${totalProfit}`;
        function updateStockHTML(key) {
            document.getElementById(key.tag).innerHTML = `${key.name}: ${key.current_value}`
        }
        iterateKeys(updateStockHTML);
        document.getElementById("totalProfit").innerHTML = `Total Profit: ${totalProfit}`;
        document.getElementById("stockChB").innerHTML = `Stock Chance Boost: ${stockChB}%`;
        if (newsGenerated == 1) document.getElementById("newsBody").innerHTML = `${newsBody}` + document.getElementById("newsBody").innerHTML
    }
    start() {
        console.log(`screen width: ${screen.width}, height: ${screen.height}`);
        currentGold = startingGold;
        this.updateStats();
    }
    looper() {
        console.log("looping...");
    }
    endDay() {
        console.log("Day ended");
        function dayEnd(key) {
            if(key.bankrupt == 0){
                key.yesterday_value = key.current_value;
                key.successful_chance = clamp(key.successful_chance + successChanceMult, 0, 100);
                const stockvalchange = stockvalcalc(key.successful_chance, key.current_value, Math.min(key.current_value / 2, 50000));
                key.current_value = Math.max(key.current_value + stockvalchange, 0);
                if(key.invested == 1) {
                    key.stockProfit = key.stockProfit + stockvalchange;
                    totalProfit = totalProfit + key.current_value - key.yesterday_value;
                } else {
                    key.stockProfit = 0
                }
                if(key.current_value == 0){
                    key.bankrupt = 1;
                    key.current_value = "BANKRUPT"
                }
            }
        }
        iterateKeys(dayEnd);
        currentDay = currentDay + 1;
        if(currentGold > 999999999){
            stockChB = 10
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
