const users = [];

//user, socketId we will be sending inside the params Ex: socketId=HelloWorld
async function addUser(userId, socketId){
    
    //first we will check if we have a user already connected with the userId
    const user = users.find(user => user.userId === userId)

    if(user && user.socketId === socketId){
        return users;
    }
    else{
        if(user && user.socketId !== socketId){ 
            //if socketId doesn`t match remove this user completely from users array
            await removeUser(user.socketId)
        }

        //create new user - es6 syntax
        const newUser = {userId, socketId}

        //pushthis new user inside users array
        users.push(newUser);
        return users;
    }
};

const removeUser = async(socketId)=>{

    //first find the index of the item to remove in the array
    const indexOf = users.map(user => user.socketId).indexOf(socketId)

    await users.splice(indexOf, 1)

};

const findConnectedUser = (userId)=>
    users.find(user => user.userId === userId)


module.exports = {addUser, removeUser, findConnectedUser};