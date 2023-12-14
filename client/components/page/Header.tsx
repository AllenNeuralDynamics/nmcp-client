import * as React from "react";
import {Dropdown, Icon, Image, Menu, MenuItem, Modal, Popup} from "semantic-ui-react";

import {PreferencesManager} from "../../util/preferencesManager";
import {ExampleDefinition, examples} from "../../examples";
import {TutorialDialog} from "./Tutorial";
import {SearchScope} from "../../models/uiQueryPredicate";
import {observer} from "mobx-react-lite";
import {useViewModel} from "../app/App";

// const logo = require("file-loader!../../../assets/mouseLight_NB_color.svg");
// const hhmiImage = require("file-loader!../../../assets/hhmi_logo.png");
const logo = require("../../../assets/nmcp_logo.png");

interface IHeadingProps {
    searchScope: SearchScope;

    onApplyExampleQuery(filterData: ExampleDefinition): void;
}

interface IHeadingState {
    showShortcuts?: boolean;
    showTutorial?: boolean;
}

export class PageHeader extends React.Component<IHeadingProps, IHeadingState> {
    public constructor(props: IHeadingProps) {
        super(props);

        this.state = {
            showShortcuts: false,
            showTutorial: false
        }
    }

    private onSelectExampleQuery(example: ExampleDefinition) {
        this.props.onApplyExampleQuery(example);
    }

    private onShowShortcuts() {
        this.setState({showShortcuts: true});
    }

    private onHideShortcuts() {
        this.setState({showShortcuts: false});
    }

    private onHideTutorial() {
        this.setState({showTutorial: false});
    }

    public render() {
        const exampleMenuItems = examples.map(s => {
            return (<Dropdown.Item key={s.name} onClick={() => this.onSelectExampleQuery(s)}>{s.name}</Dropdown.Item>);
        });

        let message = null;

        const helpItems = [
            <Dropdown.Item key={"2"} onClick={() => this.onShowShortcuts()}>
                Shortcuts
            </Dropdown.Item>
        ];

        switch (this.props.searchScope) {
            case SearchScope.Private:
            case SearchScope.Team:
                message = <Popup trigger={<span>TEAM INSTANCE (NON-PUBLIC/NON-INTERNAL CONTENTS)</span>}
                                 flowing={true}
                                 content="This instance set includes all uploaded tracings.  New tracings are available immediately after the transform completes."/>;
                break;
            case SearchScope.Division:
            case SearchScope.Internal:
            case SearchScope.Moderated:
                message =
                    <Popup trigger={<span>INTERNAL INSTANCE (MAY INCLUDE NON-PUBLIC CONTENTS)</span>}
                           flowing={true}
                           content="This instance set includes any tracing marked public or internal that have been transitioned to this optimized search instance. This may not include recently transformed tracings."/>;
                break;
        }

        return (
            <Menu inverted stackable borderless={true}
                  style={{margin: 0, borderRadius: 0, height: "79px"}}>
                {this.state.showTutorial ? <TutorialDialog show={this.state.showTutorial}
                                                           onHide={() => this.onHideTutorial()}/> : null}
                <Modal open={this.state.showShortcuts} onClose={() => this.onHideShortcuts()}>
                    <Modal.Header content="Viewer Shortcuts"/>
                    <Modal.Content>
                        <ul>
                            <li>ctrl-click: snap to position</li>
                            <li>shift-click: add neuron to selection</li>
                            <li>alt/option-click: toggle neuron on/off</li>
                        </ul>
                    </Modal.Content>
                </Modal>

                <Menu.Item fitted="horizontally" as="a" style={{maxWidth: "214px"}}
                           href="https://alleninstitute.org/division/neural-dynamics/">
                    <Image size="medium" src={logo}/>
                </Menu.Item>

                <Menu.Item fitted="horizontally" style={{margin: "0 40px"}}>
                    {message}
                </Menu.Item>

                <Menu.Menu position="right" style={{height: "79px"}}>
                    <Dropdown item text="Help">
                        <Dropdown.Menu>
                            {helpItems}
                        </Dropdown.Menu>
                    </Dropdown>

                    {PreferencesManager.HavePreferences ?  <PreferencesMenuItem/> : null}
                </Menu.Menu>
            </Menu>
        );
    }
}

const PreferencesMenuItem = observer(() => {
    const viewModel = useViewModel();

    return <MenuItem onClick={() => viewModel.Settings.openSettingsDialog()}>
        <Icon name="cog"/>
    </MenuItem>;
});
