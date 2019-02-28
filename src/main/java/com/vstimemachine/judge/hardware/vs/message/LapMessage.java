package com.vstimemachine.judge.hardware.vs.message;

import com.vstimemachine.judge.dao.LapRepository;
import com.vstimemachine.judge.hardware.ConnectorService;
import com.vstimemachine.judge.hardware.HardwareException;
import com.vstimemachine.judge.race.RaceService;

public class LapMessage implements Message {

    private final String[] message;
    private final LapRepository lapRepository;
    private final RaceService raceService;
    private final ConnectorService connectorService;

    private final int NUMBER_PACKAGE    = 0;
    private final int BASE_STATION_ID   = 1;
    private final int TRANSPONDER_ID    = 2;
    private final int LAP_TIME          = 3;
    private final int START_NUMBER      = 4;

    public LapMessage(String[] message, LapRepository lapRepository, RaceService raceService, ConnectorService connectorService) {
        this.message = message;
        this.lapRepository = lapRepository;
        this.raceService = raceService;
        this.connectorService = connectorService;
    }


    @Override
    public void parse() {
        int numberPackage = Integer.parseInt(message[NUMBER_PACKAGE]);
        int gateNumber = Integer.parseInt(message[BASE_STATION_ID]);
        int transponder = Integer.parseInt(message[TRANSPONDER_ID]);
        long lapTime = Long.parseLong(message[LAP_TIME]);
        int startNumber = Integer.parseInt(message[START_NUMBER]);

        raceService.newLap(lapTime, transponder, numberPackage);

        try {
            connectorService.send(String.format("lapreceived:%d,%d", numberPackage, gateNumber));
        } catch (HardwareException e) {
            e.printStackTrace();
        }
    }
}
