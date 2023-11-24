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
        socket = io();

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
            console.log("join room socket emit")

            socket.emit("join room", room)
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
                GAME.gamePageInit(users)//<< working
            })

            socket.on("new player info", (x, y, player_id) => {
                GAME.updateOtherPlayers(x, y, player_id)//<< working
            })

            socket.on("new bullet info", (x, y, mouse_x, mouse_y, id) => {
                GAME.addOtherBullets(x, y, mouse_x, mouse_y, id)//<< working
            })

            socket.on("new hp info", (player_id, hp) => {
                GAME.updateOtherHp(player_id, hp)
            })

            socket.on("new kills info", (player_id) => {
                GAME.updateOtherKills(player_id)
            })
        }
    }

    const leaveRoom = function(room){
        if(socket && socket.connected) {
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
        }
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
    const add_new_bullet = function (x, y, mouse_x, mouse_y, id){
        socket.emit("broadcast new bullet", x, y, mouse_x, mouse_y, id, socket_room)
    }

    const update_player_hp = function (player_id, hp){
        socket.emit("broadcast player hp", player_id, hp, socket_room)
    }
    const update_player_kills = function (player_id){
        socket.emit("broadcast player kills", player_id, socket_room)
    }


    return { getSocket, connect, disconnect, joinRoom, leaveRoom, createRoom, inRoom,  requestStartGame, update_player_pos, add_new_bullet, update_player_hp, update_player_kills};
})();
