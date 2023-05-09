const Ping = require('./DB/schema/ping')
const axios = require('axios')
const Router = require('express').Router
const router = new Router()
// get the ping data function
async function fetchPingData() {
    try {
        const pingList = [];
        const pings = await Ping.find({});
        pings.forEach((element) => {
            if (element.active)
                pingList.push({ _id: element._id, url: element.url, delay: element.delay });
        });
        return pingList;
    } catch (e) {
        console.log(e);
        return [];
    }
}

let pinglist = fetchPingData().then((pingList) => pinglist = pingList);


// update ping data at some interval (15 mins)
setInterval(() => {
    fetchPingData().then((pingList) => {
        pinglist = (pingList);
        console.log(pinglist);
    });
}, 900000);


// ping the urls at their respective delays


// create a queue data structure
let queue = [];

pinglist.then((resolvedPinglist) => {
    console.log(resolvedPinglist);
    resolvedPinglist.forEach((element) => {
        setInterval(() => {
            let tmp = {};
            tmp.timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            tmp.responseTime = new Date().getTime();
            tmp.id = element._id;
            axios.get(element.url).then((response) => {
                tmp.status = true;
                tmp.responseTime = new Date().getTime() - tmp.responseTime;
                tmp.output = response.data;
                tmp.statusCode = response.status;
                queue.push(tmp);
                // console.log(tmp)
                ++calls;
            }
            ).catch((e) => {
                tmp.status = false;
                tmp.output = e.message;
                tmp.responseTime = new Date().getTime() - tmp.responseTime;
                tmp.statusCode = e.status;
                queue.push(tmp);
                // console.log(tmp)
                ++calls;
            }
            )

        }, element.delay)
    });
});

// after every 5 mins, store the queue in the database
setInterval(() => {
    let tmp = queue;
    queue = [];
    tmp.forEach((element) => {
        Ping.findById(element.id).then((ping) => {
            console.log(element);
            if (element.output.length > 1000)
                element.output = "output too large to store";
            ping.pingData.push(element);
            ping.save();
        }).catch((e) => {
            console.log(e);
        })
    });
}, 300000);


// public access routes

// router to get list of all site beging pinged with their respective delays
router.get('/pinglist', async (req, res) => {
    try {
        // data should have url and delay
        const data = pinglist.map((element) => {
            return { url: element.url, delay: element.delay }
        })
        // return html talble of the data
        const html = "<table><tr><th>URL</th><th>Delay(ms)</th></tr>" + data.map((element) => {
            return "<tr><td>" + element.url + "</td><td>" + element.delay + "</td></tr>"
        }).join("") + "</table>"
        res.status(200).send(html);
    } catch (e) {
        res.status(500).send();
    }
})

let time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
let calls = 0;
const port = process.env.PORT || 3000;

router.get('/', (req, res) => {
    let msg = "server is running from " + time + " to " + new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) + ". It is running on port " + port + ".\n It has made " + calls + " calls to the backend server."
    res.send(msg)
})

router.get('/status', (req, res) => {
    res.send("pong")
})

module.exports = router;

// self loop to keep awake it's self
// every 5 mins
const other = process.env.OTHER
setInterval(() => {
    axios.get(other).then((response) => {
        console.log("pinged " + other)
    }).catch((e) => {
        console.log(e.message)
    })
},300000);