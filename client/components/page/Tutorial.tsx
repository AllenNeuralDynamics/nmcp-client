import * as React from "react";
import {Modal} from "semantic-ui-react";

const movie = require("file-loader!../../../assets/final_new.mp4");

type ITutorialProps = {
    show: boolean

    onHide(): void;
}

export const TutorialDialog = (props: ITutorialProps) => (
    <Modal open={props.show} onClose={props.onHide} size="fullscreen" dimmer="blurring" style={{backgroundColor: "transparent", boxShadow: "none"}}>
        <Modal.Content style={{textAlign: "center", backgroundColor: "transparent", boxShadow: "none"}}>
            <video id="tutorial" controls>
                <source
                    src={movie}
                    type="video/mp4"/>
            </video>
        </Modal.Content>
    </Modal>
);
