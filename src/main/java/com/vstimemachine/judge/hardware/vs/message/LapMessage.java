package com.vstimemachine.judge.hardware.vs.message;

import com.vstimemachine.judge.dao.LapRepository;
import com.vstimemachine.judge.hardware.ConnectHardwareException;
import com.vstimemachine.judge.hardware.Connector;
import com.vstimemachine.judge.race.RaceService;

public class LapMessage implements Message {

    private final String[] message;
    private final LapRepository lapRepository;
    private final RaceService raceService;

    private Connector connector;

    private final int NUMBER_PACKAGE    = 0;
    private final int BASE_STATION_ID   = 1;
    private final int TRANSPONDER_ID    = 2;
    private final int LAP_TIME          = 3;
    private final int START_NUMBER      = 4;

    public LapMessage(String[] message, LapRepository lapRepository, RaceService raceService, Connector connector) {
        this.message = message;
        this.lapRepository = lapRepository;
        this.raceService = raceService;
        this.connector = connector;
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
            connector.send(String.format("lapreceived:%d,%d", numberPackage, gateNumber));
        } catch (ConnectHardwareException e) {
            e.printStackTrace();
        }
    }
}
