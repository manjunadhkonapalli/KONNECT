import React from 'react'
import {Form, Segment, Image, Icon, Header} from "semantic-ui-react"
import {useRouter} from "next/router"

//like destructing our props object
function ImageDropDiv({
    setMedia,
    mediaPreview, 
    setMediaPreview,
    highlighted, 
    setHighlighted, 
    inputRef,
    handleChange,
    profilePicUrl
}) {

    const router = useRouter()
    const signupRoute = router.pathname === "/signup"

  return (
    <>
        <Form.Field >
            <Segment basic placeholder secondary>
                <input 
                    name="media" 
                    style={{display:"none"}} 
                    type="file" 
                    accept="image/" 
                    onChange={handleChange} 
                    ref={inputRef}  /*Bcz this input`s display is none, we are going to use this inoutRef to open it */
                />
                <div onDragOver={(e)=>{
                        e.preventDefault()  //Browser actually starts downloading/opening in a new tab the image. This is the default behaviour
                        setHighlighted(true)
                    }} 

                    onDragLeave={e=>{
                        e.preventDefault()
                        setHighlighted(false)
                    }}

                    onDrop={e=>{
                        e.preventDefault()
                        setHighlighted(true)
                        //format only browser recognises. cant use it in a code.
                        //So first we convery that file into an array amd then extract that image from array
                        //file-->array-->image(extract at index 0)
                        //console.log(e.dataTransfer.files)
                        const droppedFile =Array.from(e.dataTransfer.files) //this will convert that file into an array
                        setMedia(droppedFile[0])
                        setMediaPreview(URL.createObjectURL(droppedFile[0]))
                    }}

                
                >
                    {mediaPreview===null ?(<>
                        <Segment {...highlighted && {color:"green"}} placeholder basic >
                            {/* For showing header on signup page, && showing current profile pi on update page */}
                            {signupRoute ? 
                            <Header icon>
                                <Icon 
                                    name="file image outline" 
                                    style={{cursor:"pointer"}} /* mouse cursor changes to pointer(hand) ->So that users can know that this is clickable */
                                    onClick={()=>inputRef.current.click()} 
                                />
                                Drag n Drop or Click To Upload Image
                            </Header>
                            : 
                            <span style={{textAlign: "center"}}>
                                <Image 
                                src={profilePicUrl} 
                                style={{cursor:"pointer"}}
                                onClick={()=>inputRef.current.click()}  
                                size="medium"
                                centered
                                />
                            </span>
                            }
                        </Segment>
                    </>
                    ):(
                    <>
                        <Segment color="green" placeholder basic>
                            <Image 
                                src={mediaPreview} 
                                size="medium" 
                                centered 
                                style={{cursor:"pointer"}} 
                                onClick={()=>inputRef.current.click()} />

                        </Segment>
                    </>
                    )}
                </div>
            </Segment>
        </Form.Field>
    </>
  )
}

export default ImageDropDiv