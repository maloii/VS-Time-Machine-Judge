package com.vstimemachine.judge.controller;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ResponseMessage {

    public final static String STATUS_OK = "STATUS_OK";
    public final static String STATUS_ERROR = "STATUS_ERROR";

    private String status;
    private String message;
    private Map<String, Object> params;
    private List<Object> list;

    public ResponseMessage(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public ResponseMessage(String status, String message, Map<String, Object> params) {
        this.status = status;
        this.message = message;
        this.params = params;
    }

    public ResponseMessage(String status, List<Object> list) {
        this.status = status;
        this.list = list;
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
        if (this.params == null)
            this.params = new HashMap<>();

        this.params.put(key, value);
    }

    public List<Object> getList() {
        return list;
    }

    public void setList(List<Object> list) {
        this.list = list;
    }

    public void addList(Object item) {
        if (this.list == null)
            this.list = new ArrayList<>();
        this.list.add(item);
    }
}
