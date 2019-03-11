'use strict';
import React from "react";
import client from "../../client";
import ReactDOM from "react-dom";
import Global from "../../global";
import follow from "../../follow";
import Settings from "../../settings";
import {
    Button,
    Card,
    CardBody,
    CardImg,
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
import {WithContext as ReactTags} from "../react_tags/ReactTags";

const KeyCodes = {
    comma: 188,
    enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];


class ModalSportsman extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sportsman: {},
            url: null,
            tags: [],
            srcPhoto: null
        }

        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.toggleEditShow = this.toggleEditShow.bind(this);
        this.handleUDelete = this.handleUDelete.bind(this);
        this.handleDeleteTransponder = this.handleDeleteTransponder.bind(this);
        this.handleAdditionTransponder = this.handleAdditionTransponder.bind(this);
        this.refreshListTags = this.refreshListTags.bind(this);
        this.handleUpload = this.handleUpload.bind(this);

    }

    toggle() {
        this.setState({
            modalSportsman: !this.state.modalSportsman
        });
    }

    toggleShow() {
        this.setState({
            modalSportsman: !this.state.modalSportsman,
            sportsman: {},
            url: null,
            srcPhoto: null,
            tags: []
        });
    }

    toggleEditShow(url) {
        this.setState({tags: []});
        client({method: 'GET', path: url}).then(response => {
            client({
                method: 'GET',
                path: response.entity._links.transponders.href
            }).then(transponders => {
                transponders.entity._embedded.transponders.map(t => {
                    this.setState({
                        tags: [...this.state.tags, {id: t._links.self.href, text: t.number}]
                    });
                });
            });
            this.setState({
                modalSportsman: !this.state.modalSportsman,
                sportsman: response.entity,
                srcPhoto: response.entity.photo,
                url: response.entity._links.self.href
            });
        });

    }

    handleSave() {
        const newSportsman = {
            firstName: ReactDOM.findDOMNode(this.refs['firstName']).value.trim(),
            lastName: ReactDOM.findDOMNode(this.refs['lastName']).value.trim(),
            middleName: ReactDOM.findDOMNode(this.refs['middleName']).value.trim(),
            nick: ReactDOM.findDOMNode(this.refs['nick']).value.trim(),
            city: ReactDOM.findDOMNode(this.refs['city']).value.trim(),
            age: ReactDOM.findDOMNode(this.refs['age']).value.trim(),
            team: ReactDOM.findDOMNode(this.refs['team']).value.trim(),
            phone: ReactDOM.findDOMNode(this.refs['phone']).value.trim(),
            email: ReactDOM.findDOMNode(this.refs['email']).value.trim(),
            country: ReactDOM.findDOMNode(this.refs['country']).value.trim(),
            photo: this.state.srcPhoto,
            selected: false,
            competition: Global.competition._links.competition.href
        };
        follow(client, Settings.root, ['sportsmen']).then(response => {
            return client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newSportsman,
                headers: {'Content-Type': 'application/json'}
            })
        }).then(responseSportsman => {
            this.sportsmanHref = responseSportsman.entity._links.self.href
            this.state.tags.map(tag => {

                client({
                    method: 'POST',
                    path: Settings.root + '/transponders',
                    entity: {
                        number: tag.text,
                        sportsman: this.sportsmanHref,
                        competition: Global.competition._links.competition.href
                    },
                    headers: {'Content-Type': 'application/json'}
                });

            });
        });
        this.toggle();
    }

    handleUpdate() {

        const updateSportsman = {
            ...this.state.sportsman, ...{
                firstName: ReactDOM.findDOMNode(this.refs['firstName']).value.trim(),
                lastName: ReactDOM.findDOMNode(this.refs['lastName']).value.trim(),
                middleName: ReactDOM.findDOMNode(this.refs['middleName']).value.trim(),
                nick: ReactDOM.findDOMNode(this.refs['nick']).value.trim(),
                city: ReactDOM.findDOMNode(this.refs['city']).value.trim(),
                age: ReactDOM.findDOMNode(this.refs['age']).value.trim(),
                team: ReactDOM.findDOMNode(this.refs['team']).value.trim(),
                phone: ReactDOM.findDOMNode(this.refs['phone']).value.trim(),
                email: ReactDOM.findDOMNode(this.refs['email']).value.trim(),
                country: ReactDOM.findDOMNode(this.refs['country']).value.trim(),
                photo: this.state.srcPhoto,
            }
        };

        client({
            method: 'PUT',
            path: this.state.url,
            entity: updateSportsman,
            headers: {'Content-Type': 'application/json'}
        }).done(() => {
            this.toggle()
        });
    }

    handleUDelete() {
        if (confirm('Do you really want to delete the record?')) {
            client({method: 'DELETE', path: this.state.url}
            ).done();
            this.toggle();
        }
    }

    handleDeleteTransponder(i) {

        if (this.state.url !== null) {
            client({method: 'DELETE', path: this.state.tags[i].id}
            ).done(() => {
                const {tags} = this.state;
                this.setState({
                    tags: tags.filter((tag, index) => index !== i),
                });
            });
        } else {
            const {tags} = this.state;
            this.setState({
                tags: tags.filter((tag, index) => index !== i),
            });
        }
    }

    refreshListTags() {
        client({method: 'GET', path: this.state.url}).then(response => {
            client({
                method: 'GET',
                path: response.entity._links.transponders.href
            }).then(transponders => {
                this.setState({tags: []});
                transponders.entity._embedded.transponders.map(t => {
                    this.setState({
                        tags: [...this.state.tags, {id: t._links.self.href, text: t.number}]
                    });
                });
            });

        });
    }

    handleAdditionTransponder(tag) {
        if (this.state.url !== null) {
            client({
                method: 'POST',
                path: Settings.root + '/transponders',
                entity: {
                    number: tag.text,
                    sportsman: this.state.url,
                    competition: Global.competition._links.competition.href
                },
                headers: {'Content-Type': 'application/json'}
            }).then((transponder) => {
                this.refreshListTags();
            }, response => {
                if (response.status.code === 409) {
                    alert('A transponder with this number is already registered! ');
                }
            });
        } else {
            client({method: 'GET', path: Global.competition._links.transponders.href}).then(response => {
                const transponderInDb = response.entity._embedded.transponders.filter(t => {
                    return t.number === parseInt(tag.text);
                });
                if (transponderInDb.length === 0) {
                    this.setState(state => ({tags: [...state.tags, tag]}));
                } else {
                    alert('A transponder with this number is already registered! ');
                }
            });
        }
    }

    handleUpload(e) {
        let files = e.target.files || e.dataTransfer.files;
        document.getElementById(e.target.name).style.display = 'none';
        this.setState({
            loaded: 0
        })

        const data = new FormData()
        data.append('file', files[0], files[0].name);

        client({
            method: 'POST',
            path: '/api/upload/img',
            entity: data,
            headers: {'Content-Type': 'multipart/form-data'}

        }).then(res => {
            this.setState({
                srcPhoto: '/upload/' + res.entity.message
            });
        }, error => {
            alert(error.entity.message);
        })
    }

    render() {
        const {tags, suggestions} = this.state;
        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let deleteButton = '';
        let header = 'New sportsman';
        if (this.state.url !== null) {
            submit = <Button color="primary" onClick={this.handleUpdate}>
                Update
            </Button>
            deleteButton = <Button color="danger" onClick={this.handleUDelete} className="mr-auto">
                Delete
            </Button>
            header = 'Edit sportsman';

        }
        let imgUrl = '/images/silhouette.png';
        if (this.state.srcPhoto !== null) imgUrl = this.state.srcPhoto;
        return (<Modal isOpen={this.state.modalSportsman} toggle={this.toggle} className="modal-lg">
            <ModalHeader toggle={this.toggleShow}>{header}</ModalHeader>
            <ModalBody>
                <Container fluid>
                    <Row>
                        <Col xs="8">
                            <FormGroup row>
                                <Label for="name" sm={4}>Transponders</Label>
                                <Col sm={8}>
                                    <ReactTags
                                        tags={tags}
                                        handleDelete={this.handleDeleteTransponder}
                                        handleAddition={this.handleAdditionTransponder}
                                        delimiters={delimiters}
                                        allowDragDrop={false}
                                        placeholder="Transponder"
                                        classNames={{
                                            tagInputField: 'form-control ReactTags__suggestions_input'
                                        }}/>
                                </Col>

                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>First Name</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="firstName"
                                        id="firstName"
                                        ref="firstName"
                                        defaultValue={this.state.sportsman.firstName}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Last Name</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="lastName"
                                        id="lastName"
                                        ref="lastName"
                                        defaultValue={this.state.sportsman.lastName}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Middle Name</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="middleName"
                                        id="middleName"
                                        ref="middleName"
                                        defaultValue={this.state.sportsman.middleName}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Nick</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="nick"
                                        id="nick"
                                        ref="nick"
                                        defaultValue={this.state.sportsman.nick}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Country</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="country"
                                        id="country"
                                        ref="country"
                                        defaultValue={this.state.sportsman.country}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>City</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="city"
                                        id="city"
                                        ref="city"
                                        defaultValue={this.state.sportsman.city}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Age</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        name="age"
                                        id="age"
                                        ref="age"
                                        defaultValue={this.state.sportsman.age}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Email</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="email"
                                        id="email"
                                        ref="email"
                                        defaultValue={this.state.sportsman.email}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Phone</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        ref="phone"
                                        defaultValue={this.state.sportsman.phone}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Team</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="team"
                                        id="team"
                                        ref="team"
                                        defaultValue={this.state.sportsman.team}/>
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col xs="4">
                            <Card>
                                <CardImg top
                                         width="100%"
                                         src={imgUrl}
                                         alt="Card image cap"/>
                                <CardBody className="text-center">
                                    <Input type="file" name="photo" id="photo" onChange={this.handleUpload} hidden/>
                                    <Button color="info" onClick={event => document.getElementById('photo').click()}>Select
                                        photo</Button>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </ModalBody>
            <ModalFooter>
                {deleteButton}
                <Button color="secondary" onClick={this.toggle}>
                    Close
                </Button>
                {submit}
            </ModalFooter>
        </Modal>);
    }
}

export default ModalSportsman;