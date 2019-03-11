package com.vstimemachine.judge.hardware.vs.message;

import com.vstimemachine.judge.dao.LapRepository;
import com.vstimemachine.judge.hardware.ConnectorService;
import com.vstimemachine.judge.race.RaceService;

public class EchoTransMessage implements Message {

    private final String[] message;
    private final RaceService raceService;
    private final ConnectorService connectorService;

    private final int TRANSPONDER_ID    = 0;

    public EchoTransMessage(String[] message, RaceService raceService, ConnectorService connectorService) {
        this.message = message;
        this.raceService = raceService;
        this.connectorService = connectorService;
    }

    @Override
    public void parse() {
        int transponder = Integer.parseInt(message[TRANSPONDER_ID]);

        raceService.transponderHasBeenFound(transponder);
        connectorService.send(String.format("echook:%d", transponder));
    }
}
