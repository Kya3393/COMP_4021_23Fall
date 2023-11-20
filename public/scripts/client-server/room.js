const Room = (function(){
    let room = null

    const getRoom = function(){
        return room
    }


    const joinRoom = function(room_name, onSuccess, onError){

        const json = JSON.stringify({username: Authentication.getUser().username, room_name})

        fetch("/joinRoom", {
            method: 'post',
            headers: {"Content-type": "application/json"},
            body: json
        })
            .then((res) => res.json() )
            .then((json) => {
                console.log(json)
                if(json.status == "success"){
                    room = json.user.room
                    onSuccess()
                }else if(onError){
                    onError(json.error)
                }
                
            })
            .catch((err) => {
                console.log("Error!");
        });
    }

    const leaveRoom = function(room_name, onSuccess, onError){


        const json = JSON.stringify({username: Authentication.getUser().username, room_name})

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

    const createRoom = function(onSuccess, onError){

        const json = JSON.stringify({username: Authentication.getUser().username, room})

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

    const checkInRoom = function(onSuccess, onError){
        fetch("/leaveRoom", {
            method: 'get',
            headers: {"Content-type": "application/json"},
        })
            .then((res) => res.json() )
            .then((json) => {
                if(json.status == "success"){
                    room = json.user.room
                    onSuccess()
                }else if(onError){
                    onError(json.error)
                }
                
            })
            .catch((err) => {
                console.log("Error!");
        });
    }

    return {getRoom,  joinRoom, leaveRoom, createRoom, checkInRoom}
})();