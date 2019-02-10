package com.vstimemachine.judge.hardware;

import com.vstimemachine.judge.hardware.vs.message.MessageService;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Map;

public abstract class Connector {

    protected SimpMessagingTemplate websocket;

    protected MessageService messageService;

    public void setWebsocket(SimpMessagingTemplate websocket) {
        this.websocket = websocket;
    }

    public void setMessageService(MessageService messageService) {
        this.messageService = messageService;
    }

    public abstract boolean connection(Map<String, String>  params) throws ConnectHardwareException;
    public abstract boolean disconnect() throws ConnectHardwareException;
    public abstract void send(String message) throws ConnectHardwareException;


    public void scheduler(){

    }
}
