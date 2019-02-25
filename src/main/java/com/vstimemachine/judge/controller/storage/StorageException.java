package com.vstimemachine.judge.controller.storage;


import lombok.extern.slf4j.Slf4j;

@Slf4j
public class StorageException extends RuntimeException {

    public StorageException(String message) {
        super(message);
        log.info(message);
    }

    public StorageException(String message, Throwable cause) {
        super(message, cause);
        log.info(message);
    }
}