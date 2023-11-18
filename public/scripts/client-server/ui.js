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
                    hide();
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
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-form").hide();
        $("#register-form").hide();
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

                    hide();
                    SignInForm.show();
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
        $("#game-menu").hide()
    }

    // This function updates the game room panel
    const update = function(roomList) {
        const roomListArea = $("#game-room-panel");

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
        const roomListArea = $("#game-room-panel");
		
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
        const roomListArea = $("#game-room-panel");
		
		// Find the room
		const roomDiv = roomListArea.find("#room-id-" + room.id);
		
		// Remove the user
		if (roomDiv.length > 0) roomDiv.remove();
	};

    // This function shows the form with the user
    const show = function() {
        $("#menu-overlay").show()
        $("#game-menu").show();
    };

    // This function hides the form
    const hide = function() {
        $("#menu-overlay").show()
        $("#game-menu").hide();
    };

    return { initialize, update, addRoom, removeRoom, show, hide };
})();



const startingScreen = (function() {
    // This function initializes the UI
    const initialize = function() {


        // Click event for the signout button
        $("#game-start").on("click", () => {
            $("#game-start").hide();
            $("#menu-overlay").show()
        });
    };

    // This function shows the form with the user
    const show = function() {
        $("#game-start").show();
    };

    // This function hides the form
    const hide = function() {
        $("#game-start").hide();
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
            .append($("<span class='room-name'>" + room.name + "</span>"));
    }

    // The components of the UI are put here
    const components = [SignInForm, UserPanel, GameMenu, startingScreen];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, getRoomDisplay, initialize };
})();
