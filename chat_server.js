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
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});


app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

const onlineUsers = {};
const gameRoomList = {};

const playerKills = {};
// Function to update player kills
function updatePlayerKills(playerId, kills) {
  playerKills[playerId] = kills;
}

const weaponList = {};
const weaponTypes = {
    pistol:  { range: 600, speed: 3, rate: 5, dmg: 20 },
    rifle:    { range: 1000, speed: 5, rate: 10, dmg: 40 },
    shotgun: { range: 400, speed: 2, rate: 1, dmg: 30 }
};
function initializeWeapons() {
    const spawnPositions = [
        { x: 100, y: 100 },
        { x: 900, y: 100 },
        { x: 100, y: 900 },
        { x: 900, y: 900 }
        // Add more spawn positions as needed
      ];
    
      // Randomly assign weapon types to spawn positions
      const randomizedWeaponTypes = Object.keys(weaponTypes).sort(() => 0.5 - Math.random());
      for (let i = 0; i < spawnPositions.length; i++) {
        const Pos = spawnPositions[i];
        const Type = randomizedWeaponTypes[i % randomizedWeaponTypes.length];
        const Stats = weaponTypes[Type];
        
        // Store the weapon type and spawn position in the weaponList object
        weaponList[i] = {
            Type,
            Pos,
            Stats
        };
      }
      
      // Output the initialized weapon list for verification
      console.log(weaponList);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, name, password } = req.body;

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
    users[username] = { name, password:hash}


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
    if(username in users){
        const psw = password
        const hashpsw = users[username].password
        if(bcrypt.compareSync(psw, hashpsw)){
            name = users[username].name
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
    req.session.user = {username,  name,  room: null}

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

// app.get("/checkInRoom", (req, res) => {

//     //
//     // B. Getting req.session.user
//     //
//     if(!req.session.user.room){
//         res.json({ status: "error", error: "Please login" });
//         return
//     }
    

//     //
//     // D. Sending a success response with the user account
//     //
//     res.json({ status: "success", user: req.session.user })
 

// });

app.post("/joinRoom", (req, res)  => {
        //
    // B. Getting req.session.user
    //
    const {room_name} = req.body

    if(!req.session.user){
        res.json({ status: "error", error: "Please login" });
        return
    }
    
    req.session.user.room = room_name

    //
    // D. Sending a success response with the user account
    //
    res.json({ status: "success", room: room_name })
 
})

app.post("/leaveRoom", (req, res)  => {
    //
    // B. Getting req.session.user
    //
    const {room_name} = req.body

    if(!req.session.user){
        res.json({ status: "error", error: "Please login" });
        return
    }

    if(room_name  !== req.session.user.room){
        res.json({ status: "error", error: `User is not in room ${room_name}` });
        return
    }

    req.session.user.room = room_name
    //
    // D. Sending a success response with the user account
    //
    res.json({ status: "success"})

})

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


const { createServer } = require("http")
const { Server } =  require("socket.io")
const httpServer = createServer(app)
const io = new Server(httpServer)

// Use the session in the Socket.IO server
io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});
//socket.request.session.user




io.on("connection", (socket) => {
    if(socket.request.session.user){
        console.log(socket.request.session)
        onlineUsers[socket.request.session.user.username] = { name: socket.request.session.user.name}
        io.emit("add user", JSON.stringify(socket.request.session.user))
        socket.on("disconnect", ()=>{
            if(socket.request.session.user){
                delete onlineUsers[socket.request.session.user.username]
                io.emit("remove user", JSON.stringify(socket.request.session.user))
            }
        })
        socket.on("get users", ()=>{
            socket.emit("users",JSON.stringify(onlineUsers))
        })
        // socket.on("get messages", ()=>{
        //     // const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json"))
        //     // const messages = JSON.stringify(chatroom)
        //     const messages = fs.readFileSync("data/chatroom.json", "utf-8")
    
        //     socket.emit("messages", messages)
        // })
        // socket.on("post message", (content)=>{
        //     const message = {
        //         user: {username: socket.request.session.user.username, name: socket.request.session.user.name},
        //         datetime: new Date(),
        //         content: content
        //     }
        //     const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json"))
        //     chatroom.push(message)

        //     fs.writeFileSync("data/chatroom.json", JSON.stringify(chatroom))
        //     io.emit("add message", JSON.stringify(message))
        // })
        socket.on("get room info", (roomName )=> {
            console.log("retriving room info :")
            console.log(roomName)   

            if(roomName && roomName in gameRoomList){
                socket.emit("room info", {name: JSON.stringify(roomName), users: JSON.stringify(gameRoomList[roomName])})
            }
        })

        socket.on("get gameroom list", () => {
            socket.emit("room list", JSON.stringify(gameRoomList))
        })

        socket.on("create room", (roomName) => {
            gameRoomList[roomName] = {}
            io.emit("room list", JSON.stringify(gameRoomList))
        })

        socket.on("resume room session", (roomName) => {
            socket.join(roomName)
        })

        socket.on("join room", (roomName) => {  

            if(roomName in gameRoomList){
                //listen to roomName channel
                socket.join(roomName)

                
                //add user to the room info in server

                const  username = socket.request.session.user.username

                if(username in gameRoomList[roomName]){
                    gameRoomList[roomName][username]  = socket.request.session.user.name
                }else{
                    gameRoomList[roomName][username]  = socket.request.session.user.name
                    //tell everyone 
                    console.log("emit add user in room")
                    socket.to(roomName).emit("add user in room", JSON.stringify(socket.request.session.user))
                }

                
                //update the room info in ui
                console.log("gathering room info :")
                console.log(roomName)
                socket.emit("room info", {name: JSON.stringify(roomName), users: JSON.stringify(gameRoomList[roomName])})
                
                //set requesting user room to room name
                socket.request.session.user.room  = roomName

                
                io.emit("room list", JSON.stringify(gameRoomList))
            }else{
                console.log("room does not exist")
            }
        })


        socket.on("leave room", (roomName) => {
            if(socket.request.session.user.username in gameRoomList[roomName]){
                //stop listening
                socket.leave(roomName)

                //tell other user in room u r gone
                socket.to(roomName).emit("remove user in room", JSON.stringify(socket.request.session.user.username))

                //delete user name in room list
                delete gameRoomList[roomName][socket.request.session.user.username]

                //set requesting user room to null
                socket.request.session.user.room  = null

                //check if need to delete room (0ppl in room)
                if(Object.keys(gameRoomList[roomName]).length == 0){
                    delete gameRoomList[roomName]
                }else{
                    //change host
                    // socket.to(roomName).emit("update host")
                }

                socket.emit("leave room")
                io.emit("room list", JSON.stringify(gameRoomList))
            }else{
                console.log("user not in any room")
            }
        })

        socket.on("request start game", (room) => {
            // console.log("==========")
            // console.log(room)
            // console.log(gameRoomList[room])
            // console.log(gameRoomList[room][0])
            // console.log("==========")

            

            io.to(room).emit("start game", JSON.stringify(gameRoomList[room]))

            for(player in gameRoomList[room]){
                playerKills[room][player] = 0
            }

            initializeWeapons()
        })

        socket.on("broadcast player pos", (x, y, player_id, room) => {
            // console.log("broadcast player pos")
            // console.log(x)
            // console.log(y)
            // console.log(player_id)
            // console.log(room)
            // console.log(gameRoomList[room])

            io.to(room).emit("new player pos", x, y, player_id)
        })

        socket.on("broadcast player dir", (direction, player_id, room) => {
            io.to(room).emit("new player dir", direction, player_id)
        })

        socket.on("broadcast player stop", (direction, player_id, room) => {
            io.to(room).emit("new player stop", direction, player_id)
        })

        socket.on("broadcast new bullet", (x, y, mouse_x, mouse_y, id, stats, room) => {
            io.to(room).emit("new bullet info", x, y, mouse_x, mouse_y, id, stats)
        })

        socket.on("broadcast player hp", (player_id, hp, room) => {
            io.to(room).emit("new hp info", player_id, hp)
        })

        socket.on("broadcast player kills", (player_id, kills, room) => {
            updatePlayerKills(player_id, kills)
            io.to(room).emit("new kills info", player_id)
        })
        
        socket.on("end game", (room) => {
            io.to(room).emit("show end page", JSON.stringify(playerKills, room))
        })

        socket.on("spawn weapon", (room) => {
            io.to(room).emit("draw weapon", JSON.stringify(weaponList))
        })

        socket.on("broadcast weapon owner", (weapon_id, player_id, room) => {
            io.to(room).emit("new weapon owner", weapon_id, player_id)
        })

        socket.on("broadcast mouse angle", (weapon_id, angle, room) => {
            io.to(room).emit("set others mouse angle", weapon_id, angle)
        })
    }
})

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The game server has started...");
});
