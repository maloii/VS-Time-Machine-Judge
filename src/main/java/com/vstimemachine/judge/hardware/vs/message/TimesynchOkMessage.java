package com.vstimemachine.judge.hardware.vs.message;

import com.vstimemachine.judge.hardware.ConnectorService;
import com.vstimemachine.judge.hardware.HardwareException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TimesynchOkMessage implements Message {
    private final String[] message;
    private final ConnectorService connectorService;


    public TimesynchOkMessage(String[] message, ConnectorService connectorService) {
        this.message = message;
        this.connectorService = connectorService;
    }

    private final int BASE_STATION_ID   = 0;
    private final int TIME              = 1;


    @Override
    public void parse() {
        int basestationNumber = Integer.parseInt(message[BASE_STATION_ID]);
        connectorService.syncTimeSuccess();
        try {
            connectorService.send(String.format("timesynchreceived:%d", basestationNumber));
        } catch (HardwareException e) {
            e.printStackTrace();
        }
    }
}
