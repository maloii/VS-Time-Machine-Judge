package com.vstimemachine.judge.race;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;
import static com.vstimemachine.judge.race.RaceStatus.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class RaceService implements Race {

    private final SimpMessagingTemplate websocket;

    private Long startTime;
    private RaceStatus raceStatus = STOP;

    @Override
    public void start() throws RaceException {
        if(raceStatus == STOP){
            startTime = System.currentTimeMillis();
            raceStatus = RUN;
            log.error("Start race at {}", startTime);
        }else{
            String errorMessage = String.format("You can not start a race because the race statute is not STOP. Current race status: %s", raceStatus.toString());
            log.error(errorMessage);
            throw new RaceException(errorMessage);
        }
    }

    @Override
    public void stop() {
        raceStatus = STOP;
        log.error("Stop race at {}", System.currentTimeMillis());
    }

    @Override
    public void search() throws RaceException {
        if(raceStatus == STOP){
            startTime = System.currentTimeMillis();
            raceStatus = SEARCH;
            log.error("Start search at {}", startTime);
        }else{
            String errorMessage = String.format("You can not start a search transponders because the race statute is not STOP. Current race status: %s", raceStatus.toString());
            log.error(errorMessage);
            throw new RaceException(errorMessage);
        }
    }

    @Override
    public RaceStatus status() {

        return raceStatus;
    }

    @Scheduled(fixedRate = 1000)
    private void reportTimeRace() {
        if(raceStatus == RUN && startTime != null){
            Long timeRace = (System.currentTimeMillis() - startTime)/1000L;
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/reportTimeRace", String.valueOf(timeRace));
        }
    }
}
