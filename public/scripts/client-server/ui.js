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
            var user_count = 0
            for(user in roomList[room]){
                user_count++
            }
            roomListArea.append(
                $("<div id='room-name-" + room + "' style='width: 100%;'></div>")
                    .append(UI.getRoomDisplay(room, user_count))
            );


            $("#room-name-" + room).on("click", () => {
                console.log("join room btn clicked")
                if(user_count < 4){
                    Socket.joinRoom(room)
                }else{
                    $("#join-room-message").text("room is full!")
                }
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
    
    const update = function(){
        const room_name = Authentication.getRoom()
        console.log("current room :  ")
        console.log(room_name)
        Socket.getRoomInfo(room_name)
    }

    // This function shows the create room interface
    const show = function() {
        $("#menu-overlay").show()
        $("#room-panel").show()
        $("#game-menu").show()
    };

    // This function hides the create room interface
    const hide = function() {
        $("#room-panel").hide()
        $("#game-menu").hide()
    };


    return { initialize, show, hide, updateRoomName, updateRoomUsers, addUser, removeUser, update };
})();

const EndingScreen = (function( ) {
    // This function initializes the UI
    const initialize = function() {
        // Click event for the signout button
        $("#game-over").on("click", () => {
            $("#game-over").hide();
            $("#menu-overlay").show()
            $("#room-panel").show()
        });
    };

    // This function shows the form with the user
    const show = function() {
        $("#game-over").show();
        $("#menu-overlay").hide()
    };

    // This function hides the form
    const hide = function() {
        $("#game-over").hide();
        $("#menu-overlay").show()
    };



        return { initialize, show, hide };
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(username) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-name'> Player Name: " + username + "</span>" + "<div class='spacer-grow'></div>"))
    };

    const getRoomDisplay = function(room, user_count =  0){
        if(user_count === 0){
            return $("<div class='field-content row shadow'></div>")
                .append($("<span class='room-name'>" + room + "</span>" + "<div class='spacer-grow'></div>" + "<button id='button-id-"+ room + "' class='join-room-button'><span class='join-room-text'>Join</span></button"))
        }else{
            return $("<div class='field-content row shadow'></div>")
            .append($("<span class='room-name'>" + room + "</span>" + "<div class='spacer-grow'></div>" + "<span style='color: var(--button-color);'> " + user_count + "/4 </span>" + "<button id='button-id-"+ room + "' class='join-room-button'><span class='join-room-text'>Join</span></button"))
        }


    }

    // The components of the UI are put here, but only under the menu overlay: not including the game session
    const components = [SignInForm, UserPanel, MainMenu, StartingScreen, CreateRoom, RoomPanel ,  EndingScreen];

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

        console.log("updating room info")
        RoomPanel.update()

        console.log("displaying room panel")
        RoomPanel.show(room)
    }

    const toGame = function(){
        $("#menu-overlay").hide();
        $("#game-over").hide()
        $("#counter").show();
    }

    const toMenu = function(){
        $("#menu-overlay").show()
        $("#counter").hide();
    }

    const toEndPage = function(playerScores, room){
        $("#counter").hide();
        console.log(playerScores);
        console.log(room)
        $("#final-kills").text(playerScores[room][Authentication.getUser().username])

        const endPage =  $("#game-over")
        // Convert the playerKills object into an array of [playerId, kills] pairs
        const playerKillsArray = Object.entries(playerScores[room]);

        // Sort the array based on kills in descending order
        playerKillsArray.sort((a, b) => b[1] - a[1]);

        // Clear the existing content of the ranking list



        // let rankings = ""
        $('.temp').remove()
        
        let rank = 1

        // Iterate over the sorted array and update the ranking list
        for (const player in playerKillsArray) {

            let  text = document.createElementNS('http://www.w3.org/2000/svg', 'text')

            let  rank_record = document.createTextNode(`Rank ${rank}: Player ${playerKillsArray[player][0]} - Kills: ${playerKillsArray[player][1]}`)
            text.appendChild(rank_record)
            endPage.append(text)

            text.setAttribute('x', '50%');
            text.setAttribute('y', `${rank*10 + 35}%`);
            text.setAttribute('class', 'temp');
            // rankings += `Rank ${rank}: Player ${playerId} - Kills: ${kills}`;

            // Append the list item to the ranking list
            // rankingList.append( $("<li>" + textContent + "</li>") );

            rank++
        }
        // rankingList.text(rankings)
        $("#game-over").show();
    }


    return { getUserDisplay, getRoomDisplay, initialize , startingScreen, frontPage,  mainMenu, createRoom, roomPanel, toGame, toMenu, toEndPage};
})();
