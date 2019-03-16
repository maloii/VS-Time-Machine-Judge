'use strict';
import React from "react";
import Settings from "../../settings";
import {Button, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import {PrinterIcon, FilePdfIcon} from "mdi-react";
import client from "../../client";
import BestLapReport from "./best_lap_report";
import CountLapReport from "./count_lap_report";
import ReactToPrint from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReactDOM from "react-dom";

class ModalPrintReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            report:{},
            isPrint:false
        }

        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.generatePdf = this.generatePdf.bind(this);
    }

    toggle() {
        this.setState({
            modalReport: !this.state.modalReport
        });
    }
    toggleShow(report) {
        if (report != null) {
            client({
                method: 'GET',
                path: Settings.raceApiReport+'/'+report.id,
                headers: {'Content-Type': 'application/json',
                            "Accept":"application/json"}
            }).then(r => {
                this.setState({
                    report: r.entity,
                    modalReport: !this.state.modalReport
                });
            });
        }else{
            this.setState({
                modalReport: !this.state.modalReport
            });
        }

    }
    generatePdf(){
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
            pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin,canvas_image_width,canvas_image_height);


            for (var i = 1; i <= totalPDFPages; i++) {
                pdf.addPage(PDF_Width, PDF_Height);
                pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height*i)+top_left_margin,canvas_image_width,canvas_image_height);
            }

            pdf.save("best_lap_report.pdf");
        });
    }
    render(){
        let tableDate = [];
        let name = (this.state.report.report? this.state.report.report.name:'');
        if(this.state.report.report && this.state.report.report.typeReport === "BEST_LAP"){
            tableDate.push(<BestLapReport  report={this.state.report} key="best_lap" ref={el => (this.componentRef = el)} />);
        }else if(this.state.report.report && this.state.report.report.typeReport === "COUNT_LAPS"){
            tableDate.push(<CountLapReport  report={this.state.report} key="count_lap" ref={el => (this.componentRef = el)} />);
        }
        return(<Modal isOpen={this.state.modalReport} toggle={this.toggle}  className="modal-lg">
            <ModalHeader toggle={this.toggle}></ModalHeader>
            <ModalBody>
                <Container fluid>
                    <Row>
                        <Col>
                            {tableDate}
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
        </Modal>);
    }
}

export default ModalPrintReport;