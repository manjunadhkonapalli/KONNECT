const ChatModel = require("../models/ChatModel")
const UserModel = require("../models/UserModel")

async function loadMessages(userId, messagesWith){

    try {
        //first look for the user
        const user = await ChatModel.findOne({user:userId}).populate("chats.messagesWith")
        
        //look for the chat we have
        const chat = user.chats.find(chat => chat.messagesWith._id.toString()===messagesWith)

        //if not chat is there 
        if(!chat){
            return {error: "No chat found"}
        }

        return {chat};

    } catch (error) {
        console.log(error)
        return {error}
    }

};

//for sending data from client to server through MessageInputField
async function sendMsg(userId, msgSendToUserId, msg){

    try {
        //look for LOGGEDIN USER - SENDER
        const user = await ChatModel.findOne({user:userId})

        //look for the RECEIVER if exists or not
        const msgSendToUser = await ChatModel.findOne({user:msgSendToUserId})

        //create new msg object - gonna push into msgs array
        const newMsg = {
            sender : userId,
            receiver : msgSendToUserId,
            msg,                         //ES6 syntax
            date : Date.now()
        }

//--------------------UPDATING at SENDERS DATABASE---------------------
        //check if user has previous chats with receiver
        const previousChat = user.chats.find(chat => chat.messagesWith.toString()===msgSendToUserId)

        //if prevChat exist, append the new chat to the end of array of prev chat
        if(previousChat){
            previousChat.messages.push(newMsg)
            await user.save()
        }
        //Else create the whole object
        else{
            const newChat = {
                messagesWith : msgSendToUserId,
                messages : [newMsg]
        }
        user.chats.unshift(newChat);     //unshift adds elemts to start of the array - whatsapp chat comes onto top when new msg comes
        await user.save();
    }

//--------------------NOW UPDATING at RECEIVERS DATABASE---------------------
        //check if receiver has previous chats with sender
        const previousChatForReceiver = msgSendToUser.chats.find(chat => chat.messagesWith.toString()===userId)

        //if prevChat exist, append the new chat to the end of array of prev chat
        if(previousChatForReceiver){
            previousChatForReceiver.messages.push(newMsg)
            await msgSendToUser.save()
        }
        //Else create the whole object
        else{
            const newChat = {
                messagesWith : userId,
                messages : [newMsg]
        }
        msgSendToUser.chats.unshift(newChat);     //unshift adds elemts to start of the array - whatsapp chat comes onto top when new msg comes
        await msgSendToUser.save();
    }

    return {newMsg};

    } catch (error) {
        console.log(error)
        return {error}
    }
};


async function setMsgtoUnread(userId){

    try {
        //First find for the user
        const user = await UserModel.findById(userId)

        if(!user.unreadMessage){
            user.unreadMessage = true;
            await user.save()
        }
        return;
        
    } catch (error) {
        console.log(error)
    }
};

const deleteMsg = async(userId, messagesWith, messageId)=>{
    try {
        //Look for the user
        const user = await ChatModel.findOne({user: userId})

        //Now Look for the chat with the messageWithId
        const chat = user.chats.find(chat=>chat.messagesWith.toString() === messagesWith)
        
        if(!chat){  //if not chat found with that user, simply return
            return;
        }

        //If chat found, then search for the message with messageId ---> Looking for the msg object inside the chats array
        const messageToDelete = chat.messages.find(message => message._id.toString() === messageId)

        //If msgToDlt not found
        if(!messageToDelete)return;

        //If msg found, but the one who is trying to dlt the msg is not the sender of this msg
        if(messageToDelete.sender.toString() !== userId) return;

        //If we loggedUser is the sender of that msg, --> look for the index of tht msg
        const indexOf = chat.messages
            .map(message => message._id.toString())
            .indexOf(messageToDelete._id.toString());

        //Once found the index, delete that msg through index
        await chat.messages.splice(indexOf, 1);

        await user.save();
        return {success : true};

    } catch (error) {
        console.log(error)
    }
}

module.exports = {loadMessages, sendMsg, setMsgtoUnread, deleteMsg}