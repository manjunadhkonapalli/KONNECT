const UserModel = require("../models/UserModel")
const NotificationModel = require("../models/NotificationModel")

//userId --> whoever the cause for that notification to arise --> if a user comments, likes or follows someone, the notification has to be passed from this loggedUser(userId) to another guy (userToNotifyId)
//So cause of notification --> loggedUser(userId) is saved in the notification schema user
//userToNotifyId ---> to whom we have to notify --> if its a like, comment, notify to the owner of that post. If its a follow --> notify to followed guy

//-------------Working on newLike notification--------------------------

 async function setNotificationToUnread(userId){
//setnotification to unread is related to user--> so used UserModel below
    try {
        //first look for the user
        const user = await UserModel.findById(userId)

        //if unread notificaton is false, set it to true
        if(!user.unreadNotification){
            user.unreadNotification = true;
            await user.save()
        }
        return;

    } catch (error) {
        console.error(error);
    }

}


//------setting the like notification -------
//userId=loggeduserId, postId=post that was liked, userToNotifyId=user whom we are going to notify that his post has been liked
async function newLikeNotification(userId, postId, userToNotifyId){    
//we have 3 types of notifications in enum 
//NEWLIKE notification is related to notofication model--> so used Notofication Model below
    try {
        //first find the user whom we are going to notify
        const userToNotify = await NotificationModel.findOne({user: userToNotifyId})

        //add the notification inside the ntfct array
        const newNotification = {
            type : "newLike",
            user : userId,
            post : postId,
            date : Date.now()
        };

        await userToNotify.notifications.unshift(newNotification)
        await userToNotify.save()

        //call the set notification to unread func
        await setNotificationToUnread(userToNotifyId)
        return;

    } catch (error) {
        console.error(error);
    }
}

//------removing the like notification -------
async function removeLikeNotification(userId, postId, userToNotifyId){

    try {
        //first look for the user To be notified, exists or not
        const user = await NotificationModel.findOne({user: userToNotifyId})
        
        //then find the notification from notification model using above user
        //looking for the notification whose type is "newline", whose postId, userId matches with we are passing
        const notificationToRemove = user.notifications.find(
            notification => 
            notification.type === "newLike" && 
            notification.post.toString() === postId && 
            notification.user.toString() === userId)

        //above returns the notification --> return its index
        const indexOf = user.notifications
            .map(notification => notification._id
            .toString()).indexOf(notificationToRemove._id.toString())

        //above returns the index --> now splice it out -->basically we are removing the notification from the notification array by finding its index
        await user.notifications.splice(indexOf, 1)     //start from indexOf, remove 1 item
        await user.save();

        // // Here we are simply using $pull operator to remove the notification from notifications array.
        // // Notice we are finding the particular notification inside Notifications array by adding its type, userId & postId
        // await NotificationModel.findOneAndUpdate({ user: userToNotifyId },
        //     {
        //       $pull: {
        //         notifications: {
        //           type: "newLike",
        //           user: userId,
        //           post: postId
        //         }
        //       }
        //     }
        //   );
       
          return;
    } catch (error) {
        console.error(error)
    }
}

//------setting the comment notification -------
async function newCommentNotification(postId, commentId, userId, userToNotifyId, text){

    try {
        //firstfind the user
        const userToNotify = await NotificationModel.findOne({user: userToNotifyId})

        //add notification inside the notificaton array --> so first create it
        const newNotification = {
            type : "newComment",
            user : userId,
            post : postId,
            commentId,      //using ES6 syntax
            text,
            date : Date.now()
        };
        //now add it to array
        await userToNotify.notifications.unshift(newNotification)
        await userToNotify.save();

        await setNotificationToUnread(userToNotifyId);
        return;

    } catch (error) {
        console.error(error);
    }
}

//------removing the comment notification -------
async function removeCommentNotification(postId, commentId, userId, userToNotifyId){

    try {
        //first find the user
        const user = await NotificationModel.findOne({user: userToNotifyId})

        //find for that notification
        const notificationToRemove = await user.notifications.find(notification => 
            notification.type === "newComment" && 
            notification.user.toString() === userId &&
            notification.post.toString() === postId &&
            notification.commentId === commentId
        );

        const indexOf = await user.notifications
        .map(notification => notification._id.toString())
        .indexOf(notificationToRemove._id.toString())

        await user.notifications.splice(indexOf, 1);
        await user.save();

        // // Here we are simply using $pull operator to remove the notification from notifications array.
        // // Notice we are finding the particular notification inside Notifications array by adding its type, userId, postId & commentId
        // await NotificationModel.findOneAndUpdate({user: userToNotifyId}, 
        //     {
        //         $pull : {
        //             notifications : {
        //                 type: "newComment",
        //                 user: userId,
        //                 post: postId,
        //                 commentId: commentId
        //             }
        //         }
        //     });
        return;

    } catch (error) {
        console.error(error)
    }
}

//------setting the follower notification -------
async function newFollowerNotification(userId, userToNotifyId){

    try {
        //find for the user
        const user = await NotificationModel.findOne({user: userToNotifyId})
        
        //add the notification inside the notification array
        const newNotification = {
            type : "newFollower",
            user : userId,           //just need userId in followers case
            date : Date.now()
        }

        //add it inside the notifications
        await user.notifications.unshift(newNotification);
        await user.save();
        
        await setNotificationToUnread(userToNotifyId)
        return;
    } catch (error) {
        console.error(error);
    }
}

//------removing the follower notification -------
async function removeFollowerNotification(userId, userToNotifyId){

    try {
        //first find the user
        const user = await NotificationModel.findOne({user: userToNotifyId});

        //once user exists, find for that notification
        const notificationToRemove = await user.notifications.find(notification => 
            notification.type === "newFollower" &&
            notification.user.toString() === userId
        );

        const indexOf = await user.notifications
            .map(notification => notification._id.toString())
            .indexOf(notificationToRemove._id.toString());

        await user.notifications.splice(indexOf, 1)
        await user.save();

        // // Here we are simply using $pull operator to remove the notification from notifications array.
        // // Notice we are finding the particular notification inside Notifications array by adding its type & userId
        // await NotificationModel.findOneAndUpdate({user : userToNotifyId}, 
        //     {
        //         $pull : {
        //             notifications : {
        //                 type : "newFollower",
        //                 user : userId
        //             }
        //         }
        //     });
            return;

    } catch (error) {
        console.error(error)
    }
}


module.exports = {
    newLikeNotification,
    removeLikeNotification,
    newCommentNotification,
    removeCommentNotification,
    newFollowerNotification,
    removeFollowerNotification
};