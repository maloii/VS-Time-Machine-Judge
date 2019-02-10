package com.vstimemachine.judge.controller;


import com.vstimemachine.judge.hardware.*;
import com.vstimemachine.judge.hardware.vs.ComPortUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.vstimemachine.judge.controller.ResponseMessage.STATUS_ERROR;
import static com.vstimemachine.judge.controller.ResponseMessage.STATUS_OK;


@RestController()
@RequestMapping(value = "/api/hardware")
public class HardwareController {

    @Autowired
    private ConnectorService connector;

    @RequestMapping("/list_com_ports")
    public String[] listComPorts(){
        return ComPortUtils.readComPorts();
    }

    @RequestMapping(value="/connect", method= RequestMethod.POST)
    public ResponseEntity<ResponseMessage> connect(@RequestBody Map<String, String> body){
        try {
            if(connector.connect(TypeConnect.valueOf(body.get("type")), body)) {
                return new ResponseEntity<>(new ResponseMessage(STATUS_OK, "Com port is connected"), HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(new ResponseMessage(STATUS_ERROR, e.getMessage()), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(new ResponseMessage(STATUS_ERROR, "Wrong connection type specified!"), HttpStatus.BAD_REQUEST);
    }

    @RequestMapping(value="/disconnect", method= RequestMethod.POST)
    public ResponseEntity<ResponseMessage> disconnect(){
        try {

            if(connector.disconnect()) {
                return new ResponseEntity<>(new ResponseMessage(STATUS_OK, "Com port is disconnected"), HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(new ResponseMessage(STATUS_ERROR, e.getMessage()), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(new ResponseMessage(STATUS_ERROR, "Wrong disconnected type specified!"), HttpStatus.BAD_REQUEST);
    }
}
