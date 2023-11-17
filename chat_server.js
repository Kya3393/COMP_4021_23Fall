const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const gameSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});


app.use(gameSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync('data/users.json'))

    //
    // E. Checking for the user data correctness
    //
    if(username == '' || name == '' || password == ''){
        res.json({status: 'error', error: "Fields cannot be empty!"})
        return
    }
    if(!containWordCharsOnly(username)){
        res.json({status: 'error', error: "Invalid username"})
        return
    }
    if(username in users){
        res.json({status: 'error', error: "Username already in use"})
        return
    }

    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password,10)
    users[username] = {avatar, name, password:hash}


    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("data/users.json", JSON.stringify(users))
    

    //
    // I. Sending a success response to the browser
    //
    res.json({status: 'success'})


});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync('data/users.json'))

    //
    // E. Checking for username/password
    //
    var name = ''
    var avatar = ''
    if(username in users){
        const psw = password
        const hashpsw = users[username].password
        if(bcrypt.compareSync(psw, hashpsw)){
            name = users[username].name
            avatar = users[username].avatar
        }else{
            res.json({status: 'error', error: 'Incorrect username/password'})
            return
        }
    }else {
        res.json({status: 'error', error: 'Incorrect username/password'})
        return
    }

    //
    // G. Sending a success response with the user account
    //
    req.session.user = {username, avatar, name}

    res.json({status: 'success', user: req.session.user})
 

});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    if(!req.session.user){
        res.json({ status: "error", error: "Please login" });
        return
    }
    

    //
    // D. Sending a success response with the user account
    //
    res.json({ status: "success", user: req.session.user })
 

});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    if(req.session.user){
        delete req.session.user
    }


    //
    // Sending a success response
    //
    res.json({ status: "success"})
 
});


//
// ***** Please insert your Lab 6 code here *****
//


const { createServer } = require("http")
const { Server } =  require("socket.io")
const httpServer = createServer(app)
const io = new Server(httpServer)

// Use the session in the Socket.IO server
io.use((socket, next) => {
    gameSession(socket.request, {}, next);
});
//socket.request.session.user

const onlineUsers = {};


io.on("connection", (socket) => {
    if(socket.request.session.user){
        onlineUsers[socket.request.session.user.username] = {avatar: socket.request.session.user.avatar, name: socket.request.session.user.name}
        io.emit("add user", JSON.stringify(socket.request.session.user))
        socket.on("disconnect", ()=>{
            if(socket.request.session.user){
                delete onlineUsers[socket.request.session.user.username]
                io.emit("remove user", JSON.stringify(socket.request.session.user))
                console.log(onlineUsers)
            }
        })
        socket.on("get users", ()=>{
            socket.emit("users",JSON.stringify(onlineUsers))
        })
        socket.on("get messages", ()=>{
            // const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json"))
            // const messages = JSON.stringify(chatroom)
            const messages = fs.readFileSync("data/chatroom.json", "utf-8")
    
            socket.emit("messages", messages)
        })
        socket.on("post message", (content)=>{
            const message = {
                user: {username: socket.request.session.user.username, avatar: socket.request.session.user.avatar, name: socket.request.session.user.name},
                datetime: new Date(),
                content: content
            }
            const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json"))
            chatroom.push(message)

            fs.writeFileSync("data/chatroom.json", JSON.stringify(chatroom))
            io.emit("add message", JSON.stringify(message))
        })
        socket.on("broadcast add typer", ()=>{
            socket.broadcast.emit("add typer", JSON.stringify(socket.request.session.user))
        })
        socket.on("broadcast delete typer", ()=>{
            socket.broadcast.emit("remove typer", JSON.stringify(socket.request.session.user))
        })
    }
})

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});
