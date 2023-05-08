const app = require('express')()
const axios = require('axios')
require('dotenv').config()
let Url = "https://code-editor-backend-o1fg.onrender.com/"
let port = process.env.PORT || 3000

// list of urls to keep the server alive
let urls = [
    "https://code-editor-backend-o1fg.onrender.com/",
    process.env.OTHER
]

console.log(urls);

// store the time when the server starts
let time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
let calls = 0;
app.get('/', (req, res) => {
    let msg = "server is running from " + time + " to " + new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) + ". It is running on port " + port + ".\n It has made " + calls + " calls to the backend server."
    res.send(msg)
})

// call this function every 5 mins to keep the server alive
setInterval(() => {
    urls.forEach(url => {
        axios.get(url)
            .then(res => {
                console.log("pinged " + url)
                ++calls
            })
            .catch(err => {
                console.log("error pinging " + url)
            })
    })
}, 300000)
// every 5 mins

app.listen(port, () => {
    console.log("server running on port " + port)
})


