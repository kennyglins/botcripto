const crypto = require("crypto");
const axios = require("axios");

const SYMBOL = "BTCUSDT";
const BUY_PRICE = 104000;
const SELL_PRICE = 105000;
const QUANTITY = "0.001";
const API_KEY = "HdA1lYAGMc9xxp0mGBpqnZZMv9pqjRwBLb3FmY81xZiOnCmnUOQ4BeMXRshqRu8m";
const SECRET_KEY = "BQZ9QAkfgKqR29kIC1li4RpId2upI9xusjUOoM8xtRb2ikefbSJlju3pFVWwAwtV"

const API_URL = "https://testnet.binance.vision";//https://api.binance.com

let is0pened = false;

function calcSMA(data) {
    const closes = data.map(candle => parseFloat(candle[4]));
    const sum = closes.reduce((a,b) => a + b);
    return sum / data.length;
}
async function start() {
    const { data } = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol=" + SYMBOL);
    const candle = data[data.length - 1];
    const price = parseFloat(candle[4]);

    console.clear();
    console.log("Price: " + price); 

    const sma = calcSMA(data);
    console.log("SMA: " + sma);
    console.log("Is 0pened? " + is0pened);

    if(price <= 110000 && is0pened === false) {
        is0pened = true;
        new0rder(SYMBOL, QUANTITY, "buy");
    }
    else if (price >= (sma * 1.1) && is0pened === true){
        is0pened = false;
        new0rder(SYMBOL, QUANTITY, "sell");
    }
    else
        console.log("aguardar");
}

async function new0rder(symbol, quantity, side) {
    const order = { symbol, quantity, side };
    order.type = "MARKET";
    order.timestamp = Date.now();

    const signature = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(new URLSearchParams(order).toString())
        .digest("hex");
    order.signature = signature;

    try { 
        const {data} = await axios.post(
            API_URL + "/api/v3/order",
            new URLSearchParams(order).toString(),
            { headers: { "x-MBX-APIKEY": API_KEY } }
        )

        console.log(data);
    }
    catch (err) {
        console.error(err.response.data);
    }
}

setInterval(start, 3000);

start();
