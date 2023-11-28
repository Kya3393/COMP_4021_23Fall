const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;
    let socket_room = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        if(!socket){
            socket = io();
        }else{
            socket.socket.connect()
        }

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            // socket.emit("get users");

            // Get the chatroom messages
            // socket.emit("get messages");
            
            // Get the gameroom list
            socket.emit("get gameroom list");
        });

        socket.on("room list", (roomList) => {
            roomList = JSON.parse(roomList)

            MainMenu.update(roomList)
        })

        socket.on("add room", (room) => {
            room = JSON.parse(room)

            MainMenu.addRoom(room)
        })
        
        socket.on("remove room", (room) => {
            room = JSON.parse(room)

            MainMenu.removeRoom(room)
        })

        socket.on("room info", ({name, users}) =>{


            name = JSON.parse(name)
            users = JSON.parse(users)

            RoomPanel.updateRoomName(name)
            RoomPanel.updateRoomUsers(users)
        })

        socket.on("leave room", () => {
            UI.mainMenu()
        })

        socket.on("user in room", (users) => {
            users = JSON.parse(users)

            RoomPanel.updateRoomUsers(users)
        })

        socket.on("add user in room", (users) => {
            users = JSON.parse(users)

            RoomPanel.addUser(users)
        })

        socket.on("remove user in room", (users) => {
            users = JSON.parse(users)

            RoomPanel.removeUser(users)
        })
        // // Set up the users event
        // socket.on("users", (onlineUsers) => {
        //     onlineUsers = JSON.parse(onlineUsers);

        //     // Show the online users
        //     OnlineUsersPanel.update(onlineUsers);
        // });

        // // Set up the add user event
        // socket.on("add user", (user) => {
        //     user = JSON.parse(user);

        //     // Add the online user
        //     OnlineUsersPanel.addUser(user);
        // });

        // // Set up the remove user event
        // socket.on("remove user", (user) => {
        //     user = JSON.parse(user);

        //     // Remove the online user
        //     OnlineUsersPanel.removeUser(user);
        // });

        // // Set up the messages event
        // socket.on("messages", (chatroom) => {
        //     chatroom = JSON.parse(chatroom);

        //     // Show the chatroom messages
        //     ChatPanel.update(chatroom);
        // });

        // // Set up the add message event
        // socket.on("add message", (message) => {
        //     message = JSON.parse(message);

        //     // Add the message to the chatroom
        //     ChatPanel.addMessage(message);
        // });

    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
        socket_room = null
    };

    const getRoomInfo =  function(room){
        console.log(`getting room ${room} info`)
        socket.emit("get room info", room)
    }


    // This function sends a post message event to the server
    // const postMessage = function(content) {
    //     if (socket && socket.connected) {
    //         socket.emit("post message", content);
    //     }
    // };

    const createRoom  = function(room){
        if(socket && socket.connected){
            socket.emit("create room", room)
        }
    }

    const joinRoom = function(room){
        if(socket && socket.connected) {
            console.log("joining room")
            Authentication.joinRoom(room, ()=> {
                console.log("emiting join room")
                socket.emit("join room", room)
                console.log("changing ui")
                UI.roomPanel(room)
                socket_room = room

                socket.on("user in room", (users) => {
                    users = JSON.parse(users)
        
                    RoomPanel.updateRoomUsers(users)
                })
        
                socket.on("add user in room", (users) => {
                    users = JSON.parse(users)
        
                    RoomPanel.addUser(users)
                })

                socket.on("remove user in room", (users) => {
                    users = JSON.parse(users)
        
                    RoomPanel.removeUser(users)
                })

                socket.on("start game", (users) => {
                    console.log("start game")
                    UI.toGame()
                    users = JSON.parse(users)
                    console.log("users:")
                    console.log(users)
                    console.log("gamePageInit")
                    GAME.gamePageInit(users)
                })

                socket.on("new player pos", (x, y, player_id) => {
                    GAME.updateOtherPlayers_pos(x, y, player_id)
                })

                socket.on("new player dir", (direction, player_id) => {
                    GAME.updateOtherPlayers_dir(direction, player_id)
                })

                socket.on("new player stop", (direction, player_id) => {
                    GAME.updateOtherPlayers_stop(direction, player_id)
                })

                socket.on("new bullet info", (x, y, mouse_x, mouse_y, id, stats) => {
                    GAME.addOtherBullets(x, y, mouse_x, mouse_y, id, stats)
                })

                socket.on("new hp info", (player_id, hp) => {
                    GAME.updateOtherHp(player_id, hp)
                })

                socket.on("new kills info", (player_id) => {
                    GAME.updateOtherKills(player_id)
                })

                socket.on("show end page", (playerScores, room) => {
                    playerScores = JSON.parse(playerScores)
                    room = JSON.parse(room)
                    console.log(playerScores)
                    GAME.otherforceEnd()
                    UI.toEndPage(playerScores)
                })

                socket.on("draw weapon", (initialWeaponInfo) => {
                    let weapons = JSON.parse(initialWeaponInfo)
                    console.log(weapons)
                    GAME.drawSpawnedWeapons(weapons);
                })

                socket.on("new weapon owner", (weapon_id, player_id) => {
                    GAME.addWeaponsOwner(weapon_id, player_id)
                })

                socket.on("set others mouse angle", (weapon_id, angle) => {
                    GAME.setWeaponsAngle(weapon_id, angle)
                })

            },  ()=>{
                console.log("join room fail")
            })
        }else{
            console.log(socket)
            console.log(socket.connected)
        }
    }

    const leaveRoom = function(room){
        if(socket && socket.connected) {

            console.log("leaving room")

            Authentication.leaveRoom(room,  ()=>{

                socket.emit("leave room", room)
                socket_room = null
                
                socket.removeListener("user in room", (users) => {
                    users = JSON.parse(users)
                    
                    RoomPanel.updateRoomUsers(users)
                })
                
                socket.removeListener("add user in room", (users) => {
                    users = JSON.parse(users)
                    
                    RoomPanel.addUser(users)
                })
                
                socket.removeListener("remove user in room", (users) => {
                    users = JSON.parse(users)
                    
                    RoomPanel.removeUser(users)
                })
            },  ()=>{
                console.log("leave room fail")
            })
        }
    }

    const returnToRoom =  function  ()  {

        const room = Authentication.getRoom()
        socket.emit("resume room session", room)
    }

    const inRoom = function(){
        console.log(socket_room)
        if(socket_room  !==  null){
            return  true
        }else return false
    }

    const requestStartGame =  function(room){
        socket.emit("request start game", room)
    }

    const update_player_pos = function (x, y, player_id){
        socket.emit("broadcast player pos", x, y, player_id, socket_room)
    }
    const update_player_dir = function (direction, player_id){
        socket.emit("broadcast player dir", direction, player_id, socket_room)
    }
    const update_player_stop = function (direction, player_id){
        socket.emit("broadcast player stop", direction, player_id, socket_room)
    }

    const add_new_bullet = function (x, y, mouse_x, mouse_y, id, stats){
        //stats = JSON.stringify(stats)
        socket.emit("broadcast new bullet", x, y, mouse_x, mouse_y, id, stats, socket_room)
    }

    const update_player_hp = function (player_id, hp){
        socket.emit("broadcast player hp", player_id, hp, socket_room)
    }
    const update_player_kills = function (player_id, kills){
        socket.emit("broadcast player kills", player_id, kills, socket_room)
    }

    const endGame =  function(){
        socket.emit("end game", socket_room)
    }

    const spawnWeapon =  function(){
        socket.emit("spawn weapon", socket_room)
    }
    const update_weapon_owner = function ( weapon_id, player_id){
        socket.emit("broadcast weapon owner", weapon_id, player_id, socket_room)
    }

    const broadcastMouseAngle = function ( weapon_id, angle ){
        socket.emit("broadcast mouse angle",weapon_id, angle, socket_room)
    }
    return { 
        getSocket, connect, disconnect, joinRoom, leaveRoom, createRoom, inRoom,  requestStartGame,
        update_player_pos, update_player_dir, update_player_stop, add_new_bullet, update_player_hp, update_player_kills,
        endGame, getRoomInfo, returnToRoom,
        spawnWeapon, update_weapon_owner, broadcastMouseAngle};
})();
