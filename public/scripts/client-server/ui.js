// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        
        // Hide it
        $("#menu-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide()
                    $("#front-page").hide()
                    MainMenu.show()
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();

                    Socket.connect();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        $("#menu-overlay").show();
        $("#front-page").show()
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#front-page").hide()
    };

    return { initialize, show, hide };
})();

const UserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    UI.frontPage()
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#user-panel .user-name").text(user.name);
        }
        else {
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const MainMenu = (function(){
    // initialize
    const initialize = function(){
        $("#main-menu-panel").hide()

        $("#new-room").on("click", () => {
            $("#main-menu-panel").hide()
            $("#user-panel").hide()
            CreateRoom.show()
        })
    }

    // This function updates the game room panel
    const update = function(roomList) {
        const roomListArea = $("#room-list-panel");

        // Clear the game room area
        roomListArea.empty();

        console.log(roomList)

        // Add the user one-by-one
        for (const room in roomList) {
            roomListArea.append(
                $("<div id='room-name-" + room + "' style='width: 100%;'></div>")
                    .append(UI.getRoomDisplay(room, roomList[room]))
            );

            $("#room-name-" + room).on("click", () => {
                console.log("join room btn clicked")
                Socket.joinRoom(room)
            })
        }
        
    };

    // This function adds a user in the panel
	const addRoom = function(room) {
        const roomListArea = $("#room-list-panel");


		
        console.log(room)
		// Find the room
		const roomDiv = roomListArea.find("#room-name-" + room);
		
		// Add the room
		if (roomDiv.length == 0) {
			roomListArea.append(
				$("<div id='room-name-" + room + "' style='width: 100%;'></div>")
					.append(UI.getRoomDisplay(room))
			);

            $("#room-name-" + room).on("click", () => {
                console.log("join room btn clicked")
                Socket.joinRoom(room)
            })
		}
	};

    // This function removes a user from the panel
	const removeRoom = function(room) {
        const roomListArea = $("#room-list-panel");
		
        console.log(room)
		// Find the room
		const roomDiv = roomListArea.find("#room-name-" + room);

		
		// Remove the user
		if (roomDiv.length > 0) roomDiv.remove();
	};

    // This function shows the form with the user
    const show = function() {
        $("#menu-overlay").show()
        $("#main-menu-panel").show();
        $("#game-menu").show()
    };

    // This function hides the form
    const hide = function() {
        $("#main-menu-panel").hide();
        $("#game-menu").hide()
    };

    return { initialize, update, addRoom, removeRoom, show, hide };
})();

const StartingScreen = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Click event for the signout button
        $("#game-start").on("click", () => {
            $("#game-start").hide();
            $("#game-start-countdown").hide();
            $("#menu-overlay").show()
            $("#front-page").show()
        });
    };

    // This function shows the form with the user
    const show = function() {
        $("#menu-overlay").hide()
        $("#game-start").show();
    };

    // This function hides the form
    const hide = function() {
        $("#game-start").hide();
    };



    return { initialize, show, hide };
})();

const  CreateRoom = (function() {
    // This function initializes the UI
    const initialize = function() {
        
        $("#create-room-panel").hide()

        //exit to game menu
        $("#exit-create-room-button").on("click", () => {
            //show game menu
            UI.mainMenu();
        })

        //submit create room form
        $("#create-room-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const roomName = $("#create-room-name").val().trim();

            // Send a signin request
            const roomDiv = $("#room-list-panel").find("#room-name-" + roomName)
            if(containWordCharsOnly(roomName)){
                if(roomDiv.length == 0){
                    $("#register-form").get(0).reset();
                    Socket.createRoom(roomName)
                    Socket.joinRoom(roomName)
                }else{
                    $("#create-form-message").text("Room name is already in use!");
                }
            }else{
                $("#create-form-message").text("Invalid room name!");
            }
        });
    };

    // This function shows the create room interface
    const show = function() {
        $("#create-room-panel").show()
    };

    // This function hides the create room interface
    const hide = function() {
        $("#create-room-panel").hide()
    };



    return { initialize, show, hide };
})();


const RoomPanel= (function() {
    // This function initializes the UI

    const initialize = function() {
        $("#room-panel").hide()

        $("#exit-room-button").on("click", () => {
            if($("#room-title").text() != ""){
                Socket.leaveRoom($("#room-title").text())
                console.log("room left successfully!")
            }else{
                console.log("error on leaving room")
            }

            $("#room-user-list").empty()
            $("#ready-check").text("ready")
        })

        $("#request-start-game").on("click",() => {
            if($("#room-title").text() !== ""){
                Socket.requestStartGame($("#room-title").text())
            }
        })
    };

    // This function updates the room name
    const updateRoomName = function(roomName) {

        const RoomTitle = $("#room-title")


        RoomTitle.text(roomName)
    };

    const updateRoomUsers = function(Users){
        const RoomUserList = $("#room-user-list");

        // Clear the online users area
        RoomUserList.empty();

        console.log(Users)

        // Add the user one-by-one
        for (const username in Users) {
            RoomUserList.append(
                $("<div id='username-" + username + "' style='width: 100%;'></div>")
                    .append(UI.getUserDisplay(Users[username]))
            );
        }
    }

    // This function adds a user in the panel
    const addUser = function(user) {
        const RoomUserList = $("#room-user-list");
        
        console.log(user)

        // Find the user
        const userDiv = RoomUserList.find("#username-" + user.name);
        
        // Add the user
        if (userDiv.length == 0) {
            RoomUserList.append(
                $("<div id='username-" + user.name + "' style='width: 100%;'></div>")
                    .append(UI.getUserDisplay(user.name))
            );
        }
    };

    // This function removes a user from the panel
    const removeUser = function(user) {
        const RoomUserList = $("#room-user-list");

        console.log("removing : " + user)
        
        // Find the user
        const userDiv = RoomUserList.find("#username-" + user);
        
        // Remove the user
        if (userDiv.length > 0) userDiv.remove();
    };
    

    // This function shows the create room interface
    const show = function() {
        $("#room-panel").show()
        $("#game-menu").show()
    };

    // This function hides the create room interface
    const hide = function() {
        $("#room-panel").hide()
        $("#game-menu").hide()
    };


    return { initialize, show, hide, updateRoomName, updateRoomUsers, addUser, removeUser };
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(username) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-name'> Player Name: " + username + "</span>" + "<div class='spacer-grow'></div>"))
    };

    const getRoomDisplay = function(room, users =  null){
        if(!users){
            return $("<div class='field-content row shadow'></div>")
                .append($("<span class='room-name'>" + room + "</span>" + "<div class='spacer-grow'></div>" + "<button id='button-id-"+ room + "' class='join-room-button'><span class='join-room-text'>Join</span></button"))
        }else{
            var user_count = 0
            for(user in users){
                user_count++
            }
            return $("<div class='field-content row shadow'></div>")
            .append($("<span class='room-name'>" + room + "</span>" + "<div class='spacer-grow'></div>" + "<span style='color: var(--button-color);'> " + user_count + "/4 </span>" + "<button id='button-id-"+ room + "' class='join-room-button'><span class='join-room-text'>Join</span></button"))
        }

    }

    // The components of the UI are put here, but only under the menu overlay: not including the game session
    const components = [SignInForm, UserPanel, MainMenu, StartingScreen, CreateRoom, RoomPanel ];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    // This function switches the UI to Starting screen
    const startingScreen = function() {
        for (const component of components) {
            component.hide();
        }
        StartingScreen.show()
        console.log("displaying starting screen")
    }

    // This function switches the UI to front login/register page
    const frontPage = function(){
        for (const component of components) {
            component.hide();
        }
        SignInForm.show()
        console.log("displaying signin/register")
    }

    // This function switches the UI to game menu with list of game room
    const mainMenu = function(){
        for (const component of components) {
            component.hide();
        }
        MainMenu.show()
        UserPanel.update(Authentication.getUser());
        UserPanel.show();
        console.log("displaying main menu")
    }

    // This function switches the UI to the create room interface
    const createRoom = function(){
        for (const component of components) {
            component.hide();
        }

        CreateRoom.show()
        console.log("displaying create room panel")
    }

    const roomPanel = function(room){
        for (const component of components) {
            component.hide();
        }

        RoomPanel.show(room)
        console.log("displaying room panel")
    }

    const toGame = function(){
        $("#menu-overlay").hide();
        $("#counter").show();
    }

    const toMenu = function(){
        $("#menu-overlay").show()
        $("#counter").hide();
    }

    const toEndPage = function(){
        $("#counter").hide();
        $("#game-over").show();
    }


    return { getUserDisplay, getRoomDisplay, initialize , startingScreen, frontPage,  mainMenu, createRoom, roomPanel, toGame, toMenu, toEndPage};
})();
