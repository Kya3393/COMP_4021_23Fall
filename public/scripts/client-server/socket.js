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

            RoomPanel.update(name, users)
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
            socket.emit("join room", room)
            UI.roomPanel(room)

            socket.on("user in room", (users) => {
                users = JSON.parse(users)
    
                RoomPanel.update(users)
            })
    
            socket.on("add user in room", (users) => {
                users = JSON.parse(users)
    
                RoomPanel.addUser(users)
            })

            socket.on("remove user in room", (users) => {
                users = JSON.parse(users)
    
                RoomPanel.removeUser(users)
            })
        }
    }

    const leaveRoom = function(room){
        if(socket && socket.connected) {
            socket.emit("leave room", JSON.stringify(room))

            socket.removeListener("user in room", (users) => {
                users = JSON.parse(users)
    
                RoomPanel.update(users)
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


    return { getSocket, connect, disconnect, joinRoom, leaveRoom, createRoom};
})();
