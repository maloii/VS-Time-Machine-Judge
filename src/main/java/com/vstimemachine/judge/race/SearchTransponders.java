package com.vstimemachine.judge.race;

import com.vstimemachine.judge.hardware.ConnectorService;
import com.vstimemachine.judge.model.Color;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;

import static com.vstimemachine.judge.race.RaceStatus.SEARCH;

@Slf4j
public class SearchTransponders extends Thread {

    final private RaceService raceService;
    final private ApplicationContext context;

    public SearchTransponders(RaceService raceService, ApplicationContext context) {
        this.raceService = raceService;
        this.context = context;
    }

    @Override
    public void run() {
        if(raceService.group() != null && raceService.group().getGroupSportsmen() != null){
            while (raceService.status() == SEARCH && raceService.group().getGroupSportsmen()
                    .stream()
                    .filter(groupSportsman -> groupSportsman.getSearchTransponder() == false).count() > 0) {
                int[] idx = { 0 };
                raceService.group().getGroupSportsmen()
                        .stream()
                        .sorted((gs1, gs2)-> gs1.getSort().compareTo(gs2.getSort()))
                        .forEach(groupSportsman -> {
                            idx[0]++;
                            groupSportsman.getSportsman().getTransponders().forEach(transponder -> {
                                Color color = raceService.group().getCompetition().colorPosition(idx[0]);

                                int colorVsCode = color.getVsCode();
                                //flashInGate
                                colorVsCode |= ( 1 << 6 );
                                //hybridMode off
                                //colorVsCode |= ( 1 << 7 );
                                ConnectorService connectorService = context.getBean(ConnectorService.class);
                                connectorService.send(String.format("searchtrans:%d,%d", transponder.getNumber(), colorVsCode));
                                log.error(String.format("Send message searchtrans:%d,%d, %s", transponder.getNumber(), colorVsCode, color));
                            });
                        });
                try {sleep(1000L); } catch (InterruptedException e) { }
            }
            raceService.stop();
        }
    }
}
