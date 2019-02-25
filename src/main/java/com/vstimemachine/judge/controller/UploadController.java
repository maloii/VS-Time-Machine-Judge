package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.controller.storage.StorageException;
import com.vstimemachine.judge.controller.storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static com.vstimemachine.judge.controller.ResponseMessage.STATUS_ERROR;
import static com.vstimemachine.judge.controller.ResponseMessage.STATUS_OK;

@RestController()
@RequestMapping(value = "/api/upload")
public class UploadController {


    @Autowired
    private StorageService storageService;

    @RequestMapping(value = "/img", method = RequestMethod.POST, consumes = "multipart/form-data")
    public ResponseEntity<ResponseMessage> handleFileUpload(@RequestParam("file") MultipartFile file) {

        try {
            String fileName = storageService.store(file);
            return new ResponseEntity<>(new ResponseMessage(STATUS_OK, fileName), HttpStatus.OK);
        }catch (StorageException e){
            return new ResponseEntity<>(new ResponseMessage(STATUS_ERROR, e.getMessage()), HttpStatus.BAD_REQUEST);
        }

    }
}
