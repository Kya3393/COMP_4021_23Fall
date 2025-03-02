const Authentication = (function() {
    // This stores the current signed-in user
    //{username, name, room}
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    const getRoom = function()  {
        return user.room
    }


    // This function sends a sign-in request to the server
    // * `username`  - The username for the sign-in
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signin = function(username, password, onSuccess, onError) {

        //
        // A. Preparing the user data
        //
        const json = JSON.stringify({username, password})
 
        //
        // B. Sending the AJAX request to the server
        //
        fetch("/signin", {
            method: 'post',
            headers: {"Content-type": "application/json"},
            body: json
        })
            .then((res) => res.json() )
            .then((json) => {
                console.log(json)
                if(json.status == "success"){
                    user = json.user
                    onSuccess()
                }else if(onError){
                    onError(json.error)
                }
                
            })
            .catch((err) => {
                console.log("Error!");
        });
        //
        // F. Processing any error returned by the server
        //

        //
        // H. Handling the success response from the server
        //


    };

    // This function sends a validate request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const validate = function(onSuccess, onError) {

        //
        // A. Sending the AJAX request to the server
        //
        fetch("/validate", {
            method: 'get',
            headers: {"Content-type": "application/json"},
        })
            .then((res) => res.json() )
            .then((json) => {
                if(json.status == "success"){

                    user = json.user
                    console.log(user)
                    onSuccess(json.success)
                }else if(onError){
                    onError(json.error)
                }
                
            })
            .catch((err) => {
                console.log(err);
        });

        //
        // C. Processing any error returned by the server
        //

        //
        // E. Handling the success response from the server
        //

        
    };

    // This function sends a sign-out request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signout = function(onSuccess, onError) {

        fetch('/signout')
        .then((res) => res.json())
        .then((json)=> {
            if(json.status == 'success'){
                user = null
                if(onSuccess) onSuccess()
            }else if (onError) onError()
        }).catch((err) => {
            console.log("Error!");
        })

    };

    const joinRoom = function(room_name, onSuccess, onError){

        const json = JSON.stringify({room_name})

        fetch("/joinRoom", {
            method: 'post',
            headers: {"Content-type": "application/json"},
            body: json
        })
            .then((res) => res.json() )
            .then((json) => {
                console.log(json)
                if(json.status == "success"){
                    room = json.room
                    onSuccess()
                }else if(onError){
                    onError(json.error)
                }
                
            })
            .catch((err) => {
                console.log(err);
        });
    }

    const leaveRoom = function(room_name, onSuccess, onError){


        const json = JSON.stringify( {room_name})

        fetch("/leaveRoom", {
            method: 'post',
            headers: {"Content-type": "application/json"},
            body: json
        })
            .then((res) => res.json() )
            .then((json) => {
                console.log(json)
                if(json.status == "success"){
                    room = null
                    onSuccess()
                }else if(onError){
                    onError(json.error)
                }
                
            })
            .catch((err) => {
                console.log("Error!");
        });
    }

    return { getUser, signin, validate, signout , joinRoom,  leaveRoom, getRoom};
})();
