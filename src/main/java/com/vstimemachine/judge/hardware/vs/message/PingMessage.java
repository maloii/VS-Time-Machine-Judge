package com.vstimemachine.judge.hardware.vs.message;

public class PingMessage implements ApiMessage {

    private String[] message;

    public PingMessage(String[] message) {
        this.message = message;
    }

    @Override
    public void parse() {

        //System.out.println(String.join(",", message));
    }
}
