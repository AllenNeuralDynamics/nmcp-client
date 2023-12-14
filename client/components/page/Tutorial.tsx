import * as React from "react";
import {Modal} from "semantic-ui-react";

type ITutorialProps = {
    show: boolean

    onHide(): void;
}

export const TutorialDialog = (props: ITutorialProps) => (
    <Modal open={props.show} onClose={props.onHide} size="fullscreen" dimmer="blurring" style={{backgroundColor: "transparent", boxShadow: "none"}}>
        <Modal.Content style={{textAlign: "center", backgroundColor: "transparent", boxShadow: "none"}}>
            <video id="tutorial" controls>
                <source
                    type="video/mp4"/>
            </video>
        </Modal.Content>
    </Modal>
);
