package com.vstimemachine.judge.controller;


import lombok.Data;

import java.util.HashMap;
import java.util.Map;

public class ResponseMessage {

    public final static String STATUS_OK = "STATUS_OK";
    public final static String STATUS_ERROR = "STATUS_ERROR";

    private String status;
    private String message;
    private Map<String, Object> params;

    public ResponseMessage(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public ResponseMessage(String status, String message, Map<String, Object> params) {
        this.status = status;
        this.message = message;
        this.params = params;
    }

    public static String getStatusOk() {
        return STATUS_OK;
    }

    public static String getStatusError() {
        return STATUS_ERROR;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, Object> getParams() {
        return params;
    }

    public void setParams(Map<String, Object> params) {
        this.params = params;
    }

    public void addParams(String key, Object value) {
        if(this.params == null)
            this.params = new HashMap<>();

        this.params.put(key, value);
    }
}
