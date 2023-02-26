const users = [];

//user, socketId we will be sending inside the params Ex: socketId=HelloWorld
async function addUser(userId, socketId){
    
    //first we will check if we have a user already connected with the userId
    const user = users.find(user => user.userId === userId)

    //If there is already a user with the userId, & socketId return users
    if(user && user.socketId === socketId){
        return users;
    }
    else{
        //This case is  when the same user A on same device refreshes the browser, then new socket connection is made with userId, but with different socket Id, then it removes/deletes the previous entry of this user, by comparing the socketId`s to avoid duplicates in the array
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