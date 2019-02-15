package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.controller.storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static com.vstimemachine.judge.controller.ResponseMessage.STATUS_OK;

@RestController()
@RequestMapping(value = "/api/upload")
public class UploadController {


    private final StorageService storageService;

    @Autowired
    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @RequestMapping(value = "/img", method = RequestMethod.POST, consumes = "multipart/form-data")
    public ResponseEntity<ResponseMessage> handleFileUpload(@RequestParam("file") MultipartFile file) {

        storageService.store(file);

        return new ResponseEntity<>(new ResponseMessage(STATUS_OK, "saved"), HttpStatus.OK);
    }
}
