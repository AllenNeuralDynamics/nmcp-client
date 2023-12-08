import * as React from "react";
import {Message} from "semantic-ui-react";

type AppErrorBoundaryState = {
    hasError: boolean;
}

export class AppErrorBoundary extends React.Component<{}, AppErrorBoundaryState> {
    constructor(props) {
        super(props);

        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        console.log("getDerivedStateFromError");
        console.log(error);
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // You can also log the error to an error reporting service
        console.log("componentDidCatch");
        console.log(error);
        console.log(info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{padding: "20px"}}>
                    <Message negative icon="exclamation triangle" header="Service not responding"
                             content="System data could not be loaded.  Will attempt again shortly."/>
                </div>
            );
        }

        return this.props.children;
    }
}
