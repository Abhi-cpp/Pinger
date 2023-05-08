const app = require('express')()

let Url = "https://code-editor-backend-o1fg.onrender.com"
let port = process.env.PORT || 3000

// store the time when the server starts
let time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
let calls = 0;
app.get('/', (req, res) => {
    let msg = "server is running from " + time + " to " + new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) + ". It is running on port " + port + ".\n It has made " + calls + " calls to the backend server."
    res.send(msg)
})

// call this function every 5 mins to keep the server alive
setInterval(() => {
    fetch(Url)
        .then(res => res.text())
        .then(body => { console.log(body); ++calls; })
        .catch(err => console.log(err))
}, 3000)

app.listen(port, () => {
    console.log("server running on port " + port)
})


