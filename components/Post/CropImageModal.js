import React, {useState, useEffect} from 'react'
import {Modal, Header, Button, Grid, Icon} from "semantic-ui-react"
import Cropper from "react-cropper"

function CropImageModal({mediaPreview, setMedia, setMediaPreview, showModal, setShowModal}) {
  
  const [cropper, setCropper] = useState();

  const getCropData = ()=>{

    //If we have cropper (cropped image), then cropper has a method on it by default
    if(cropper){
      setMedia(cropper.getCroppedCanvas().toDataURL())
      setMediaPreview(cropper.getCroppedCanvas().toDataURL())     //This is to preview the cropped img in the create post compnt. Otherwise, the uncropped img is only shown in this preview --> below location, above post
      cropper.destroy()   //release the cropper from the memory
    }

    //Then the modal will close authomatically when the media is updated & cropper is destroyed
    setShowModal(false)
  };


  useEffect(()=>{

    window.addEventListener("keydown", ({key})=>{
      //console.log(e)
      if(cropper){
        if(key === 'm') cropper.setDragMode("move")
        if(key === 'c') cropper.setDragMode("crop")
        if(key === 'r') cropper.reset()
      }
    })

  }, [cropper]) //dependency=cropper --> when the cropper state will change, we re gonna add event listeners


  return (
    <>
      <Modal 
        closeOnDimmerClick={false} 
        size="large" 
        onClose={()=> setShowModal(false)}
        open={showModal}
        >
          <Modal.Header content="Crop image before upload" />
          <Grid columns={2}>

            <Grid.Column>
              <Modal.Content image>
                <Cropper 
                  style={{height:"400px", width:"100%"}}
                  cropBoxResizable
                  zoomable
                  highlight
                  responsive
                  guides
                  dragMode="move"
                  initialAspectRatio={1}
                  preview=".img-preview"
                  src={mediaPreview}  
                  viewMode={1}
                  minCropBoxHeight={10}
                  minCropBoxWidth={10} 
                  background={false} 
                  autoCropArea={1}
                  checkOrientation={false}
                  onInitialized={(cropper)=> setCropper(cropper)}
                />
                {/* src--> The cropper can only generate preview from only URL string. Not from any object. 
                    files is an obj/array, we are taking its first element and converting it into URL string.
                              setMediaPreview(URL.createObjectURL(files[0]));
                */}
              </Modal.Content>
            </Grid.Column>

            <Grid.Column>
                <Modal.Content>
                  <div>
                    <Header as="h2">
                        <Icon name="file image outline" />
                        <Header.Content content="Final" />
                    </Header>

                    <div>
{/* The className of below div is matching with preview prop of above column which links them together*/}
                      <div style={{
                            width: "100%",
                            height: "300px",
                            display: "inline-block",
                            padding: "10px",
                            overflow: "hidden",
                            boxSizing: "border-box"
                            }}
                            className='img-preview'
                      />
                    </div>
                  </div>
                </Modal.Content>
            </Grid.Column>
          </Grid>
          
          <Modal.Actions>
            <Button title="Reset (R)" icon="redo" circular onClick={() => cropper && cropper.reset()}/>

            <Button title="Move Canvas (M)" icon="move" circular onClick={() => cropper && cropper.setDragMode("move")}/>

            <Button title="New Cropbox (C)" icon="crop" circular onClick={() => cropper && cropper.setDragMode("crop")}/>

            <Button negative content="Cancel" icon="cancel" onClick={() => setShowModal(false)}/>

            <Button content="Crop Image" icon="checkmark" positive onClick={getCropData}/>
          </Modal.Actions>

      </Modal>
    </>
  )
}

export default CropImageModal