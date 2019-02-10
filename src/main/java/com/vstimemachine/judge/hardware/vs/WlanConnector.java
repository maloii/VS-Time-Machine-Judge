package com.vstimemachine.judge.hardware.vs;

import com.vstimemachine.judge.hardware.ConnectHardwareException;
import com.vstimemachine.judge.hardware.Connector;

import java.util.Map;

public class WlanConnector extends Connector {

    @Override
    public boolean connection(Map<String, String> params) throws ConnectHardwareException {

        return true;
    }


    @Override
    public boolean disconnect() throws ConnectHardwareException{

        return true;
    }

    @Override
    public void send(String message) throws ConnectHardwareException {

    }
}
