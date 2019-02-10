package com.vstimemachine.judge.hardware.vs.message;

public class LapMessage implements ApiMessage {

    private String[] message;

    public LapMessage(String[] message) {
        this.message = message;
    }


    @Override
    public void parse() {

        //System.out.println(String.join(",", message));
    }
}
