const users = []

const addUser = ({id,username,room})=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase();
    if(!username || !room){
        return {
            error:"Username or room not provided"
        }
    }
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    if(existingUser){
        return{
            error:"Username is in use!"
        }
    }
    const user = {id,username,room}
    users.push(user)
    return{user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)
    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

const getUsersInRoom = (room)=>{

    room = room.trim().toLowerCase()
    const usersInRoom = users.filter((user)=>user.room === room)
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}