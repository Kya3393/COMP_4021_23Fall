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
                    GameMenu.show()
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

const GameMenu = (function(){
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

        // Add the user one-by-one
        for (const room in roomList) {
            roomListArea.append(
                $("<div id='room-id-" + room + "'></div>")
                    .append(UI.getRoomDisplay(roomList[room]))
            );
        }
    };

    // This function adds a user in the panel
	const addRoom = function(room) {
        const roomListArea = $("#room-list-panel");
		
		// Find the room
		const roomDiv = roomListArea.find("#room-id-" + room.id);
		
		// Add the room
		if (roomDiv.length == 0) {
			roomListArea.append(
				$("<div id='room-id-" + room.id + "'></div>")
					.append(UI.getRoomDisplay(room))
			);
		}
	};

    // This function removes a user from the panel
	const removeRoom = function(room) {
        const roomListArea = $("#room-list-panel");
		
		// Find the room
		const roomDiv = roomListArea.find("#room-id-" + room.id);
		
		// Remove the user
		if (roomDiv.length > 0) roomDiv.remove();
	};

    // This function shows the form with the user
    const show = function() {
        $("#menu-overlay").show()
        $("#game-menu").show();
        $("#main-menu-panel").show();

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

        $("#exit-room-button").on("click", () => {
            //user removed from listening the socket room


            //show game menu
            UI.gameMenu();
        })
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

const RoomUserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {};

    // This function updates the online users panel
    const update = function(Users) {
        const RoomUserList = $("#room-user-list");

        // Clear the online users area
        RoomUserList.empty();

        // Add the user one-by-one
        for (const username in Users) {
            RoomUserList.append(
                $("<div id='username-" + username + "'></div>")
                    .append(UI.getUserDisplay(onlineUsers[username]))
            );
        }
    };

    // This function adds a user in the panel
	const addUser = function(user) {
        const RoomUserList = $("#room-user-list");
		
		// Find the user
		const userDiv = RoomUserList.find("#username-" + user.username);
		
		// Add the user
		if (userDiv.length == 0) {
			RoomUserList.append(
				$("<div id='username-" + user.username + "'></div>")
					.append(UI.getUserDisplay(user))
			);
		}
	};

    // This function removes a user from the panel
	const removeUser = function(user) {
        const RoomUserList = $("#room-user-list");
		
		// Find the user
		const userDiv = RoomUserList.find("#username-" + user.username);
		
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

    return { initialize, update, addUser, removeUser };
})();

const RoomPanel= (function() {
    // This function initializes the UI
    const initialize = function() {
        $("#room-panel").hide()
    };

    // This function shows the create room interface
    const show = function() {
        $("#room-panel").show()
    };

    // This function hides the create room interface
    const hide = function() {
        $("#room-panel").hide()
    };



    return { initialize, show, hide };
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    const getRoomDisplay = function(room){
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='room-id'>" + room.id + "</span>"));
    }

    // The components of the UI are put here, but only under the menu overlay: not including the game session
    const components = [SignInForm, UserPanel, GameMenu, StartingScreen, CreateRoom, RoomPanel ];

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
    const gameMenu = function(){
        for (const component of components) {
            component.hide();
        }
        GameMenu.show()
        UserPanel.update(Authentication.getUser());
        UserPanel.show();
        console.log("displaying game menu")
    }

    // This function switches the UI to the create room interface
    const createRoom = function(){
        for (const component of components) {
            component.hide();
        }

        CreateRoom.show()
        console.log("displaying create room panel")
    }
{

}
    return { getUserDisplay, getRoomDisplay, initialize , startingScreen, frontPage,  gameMenu, createRoom};
})();
