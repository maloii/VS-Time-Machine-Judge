import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import {FilePdfIcon, PrinterIcon} from "mdi-react";
import ReactToPrint from "react-to-print";
import ReactDOM from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Global from "../../global";
import Settings from "../../settings";
import TableGroups from "./table_groups"

class ModalTableGroups extends Component {

    state = {
        modalTableGroups: false
    }

    toggleShow = () => {
        this.toggle();
    }

    toggle = () => {
        this.setState({
            modalTableGroups: !this.state.modalTableGroups
        });
    }

    generatePdf = () => {

        function toDataUrl(src, callback, outputFormat) {
            // Create an Image object
            var img = new Image();
            // Add CORS approval to prevent a tainted canvas
            img.crossOrigin = 'Anonymous';
            img.onload = function() {
                // Create an html canvas element
                var canvas = document.createElement('CANVAS');
                // Create a 2d context
                var ctx = canvas.getContext('2d');
                var dataURL;
                // Resize the canavas to the original image dimensions
                canvas.height = this.naturalHeight;
                canvas.width = this.naturalWidth;
                // Draw the image to a canvas
                ctx.drawImage(this, 0, 0);
                // Convert the canvas to a data url
                dataURL = canvas.toDataURL(outputFormat);
                // Return the data url via callback
                callback(dataURL);
                // Mark the canvas to be ready for garbage
                // collection
                canvas = null;
            };
            // Load the image
            img.src = src;
            // make sure the load event fires for cached images too
            if (img.complete || img.complete === undefined) {
                // Flush cache
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
                // Try again
                img.src = src;
            }
        }
        console.log(this.componentRef);

        var quotes = ReactDOM.findDOMNode(this.componentRef);
        var HTML_Width = quotes.getBoundingClientRect().width;
        var HTML_Height = quotes.getBoundingClientRect().height;
        var top_left_margin = 50;
        var PDF_Width = HTML_Width+(top_left_margin*2);
        var PDF_Height = (PDF_Width*1.5)+(top_left_margin*2);
        var canvas_image_width = HTML_Width;
        var canvas_image_height = HTML_Height;

        var totalPDFPages = Math.ceil(HTML_Height/PDF_Height)-1;


        html2canvas(quotes,{allowTaint:true}).then(function(canvas) {
            canvas.getContext('2d');

            console.log(canvas.height+"  "+canvas.width);


            var imgData = canvas.toDataURL("image/jpeg", 1.0);
            var pdf = new jsPDF('p', 'pt',  [PDF_Width, PDF_Height]);
            //pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin,canvas_image_width,canvas_image_height);
            pdf.addImage(imgData, 'JPG', top_left_margin, (top_left_margin+50),canvas_image_width,(canvas_image_height-30));

            toDataUrl('/images/horizontal.jpg', function(footerLogo) {
                if(totalPDFPages == 0) {
                    pdf.addImage(footerLogo, 'JPG', ((PDF_Width/2)-100), (PDF_Height - 50));
                }
                let srcLogo = Settings.defaultReportLogo;
                if(Global.competition.logo) srcLogo = Global.competition.logo;

                toDataUrl(srcLogo, function(topLogo) {

                    pdf.addImage(topLogo, 'JPG', top_left_margin, top_left_margin);
                    for (var i = 1; i <= totalPDFPages; i++) {
                        pdf.addPage(PDF_Width, PDF_Height);
                        pdf.addImage(imgData, 'JPG', top_left_margin, -((PDF_Height-70)*i)+(top_left_margin+50),canvas_image_width,(canvas_image_height-30));
                        if(totalPDFPages == i) {
                            pdf.addImage(footerLogo, 'JPG', ((PDF_Width / 2) - 100), (PDF_Height - 50));
                        }
                    }

                    pdf.save("best_lap_report.pdf");
                },'JPG');
            },'JPG');
        });
    }

    render() {
        const { round, groups } = this.props;
        return (
            <Modal isOpen={this.state.modalTableGroups} toggle={this.toggle} className="modal-lg" >
                <ModalHeader toggle={this.toggle}>Table groups</ModalHeader>
                <ModalBody>
                    <Container fluid>
                        <Row>
                            <Col>
                                <TableGroups round={round} groups={groups} ref={el => (this.componentRef = el)} />
                            </Col>
                        </Row>
                    </Container>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.generatePdf}>
                        <FilePdfIcon /> Pdf
                    </Button>
                    <ReactToPrint
                        trigger={() => <Button color="info"><PrinterIcon /> Print</Button>}
                        content={() => this.componentRef}
                        bodyClass="printComponent"
                    />
                    <Button color="secondary" onClick={this.toggle}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

ModalTableGroups.propTypes = {
    round: PropTypes.object.isRequired,
    groups: PropTypes.array.isRequired
}

export default ModalTableGroups;