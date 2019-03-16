'use strict';
import React from "react";
import {
    Button,
    Col,
    Container,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import client from "../../client";
import Settings from "../../settings";
import follow from "../../follow";
import ReactDOM from "react-dom";

class ModalSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            langSpech: {}
        }

        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.save = this.save.bind(this);
    }
    save(){
        var copyLangSpech = Object.assign({}, this.state.langSpech);
        copyLangSpech.value = ReactDOM.findDOMNode(this.refs['LANG_SPEECH']).value.trim();
        client({
            method: 'PUT',
            path: copyLangSpech._links.self.href,
            entity: copyLangSpech,
            headers: {'Content-Type': 'application/json'}
        }).done(response=>this.toggle())
    }

    toggle() {
        this.setState({
            modalReport: !this.state.modalReport
        });
    }
    toggleShow() {
        follow(client, Settings.root, ['settingses']).then(settings => {
            let langSpech = settings.entity._embedded.settingses.filter(settings=>settings.typeSettings==='LANG_SPEECH');
            if(langSpech.length > 0) {
                this.setState({
                    langSpech:langSpech[0],
                    modalReport: !this.state.modalReport
                });
            }
        });

    }
    render(){
        return(<Modal isOpen={this.state.modalReport} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}></ModalHeader>
            <ModalBody>
                <Container fluid>
                    <Row>
                        <Col>
                            <FormGroup row>
                                <Label for="NOT_COUNTED_ROUNDS" sm={4}>Lang speech</Label>
                                <Col sm={8}>
                                    <Input type="select"
                                           name="LANG_SPEECH"
                                           id="LANG_SPEECH"
                                           ref="LANG_SPEECH"
                                           defaultValue={this.state.langSpech.value}>
                                        <option value="en">English</option>
                                        <option value="ru">Russian</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={this.toggle}>
                    Close
                </Button>
                <Button color="primary" onClick={this.save}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>);
    }
}


export default ModalSettings;