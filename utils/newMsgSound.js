// This msg is called on the event newMsgRecieved

const newMsgSound = senderName=>{
    const sound = new Audio("/light.mp3")   //it is in public folder

    sound && sound.play();

    if(senderName){
        document.title = `New message from ${senderName}`

        // If the documnet is open, no other user is active on the other tab
        if(document.visibilityState === "visible"){
            setTimeout(()=>{
                document.title = "Messages";
            }, 5000);
        }
    }
};

export default newMsgSound;