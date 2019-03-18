package com.vstimemachine.judge.component.event;


import com.vstimemachine.judge.dao.*;
import com.vstimemachine.judge.model.*;
import com.vstimemachine.judge.race.RaceException;
import com.vstimemachine.judge.report.ReportData;
import com.vstimemachine.judge.report.ReportDataInterface;
import com.vstimemachine.judge.report.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;
import static com.vstimemachine.judge.model.TypeParentEntity.REPORT;
import static com.vstimemachine.judge.model.TypeReport.BEST_LAP;
import static com.vstimemachine.judge.model.TypeRound.*;
import static org.springframework.transaction.annotation.Propagation.MANDATORY;

@Slf4j
@Component
@RepositoryEventHandler(Round.class)
@RequiredArgsConstructor
public class RoundEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    private final RoundRepository roundRepository;
    private final GroupRepository groupRepository;

    @HandleBeforeCreate
    @HandleBeforeSave
    public void newRoundBefore(Round round) {
        if(round.getSelected()){
            roundRepository.clearAllSelected(round.getCompetition().getId());
            log.info("Selected round:{}", round.getName());
        }
        round.initExtraAction(getPath(round));
    }

    @HandleAfterCreate
    public void newRound(Round round) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newRound", getPath(round));
    }

    @HandleBeforeDelete
    public void deleteRoundBefore(Round round) {
        round.getGroups().forEach(group->{
            group.setRound(null);
            groupRepository.findById(group.getId()).ifPresent(groupRepository::delete);
        });
    }

    @HandleAfterDelete
    public void deleteRound(Round round) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteRound", getPath(round));
    }


    @HandleAfterSave
    public void updateRound(Round round) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateRound", getPath(round));
    }
    /**
     * Take an {@link Round} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param round
     */
    private String getPath(Round round) {
        return this.entityLinks.linkForSingleResource(round.getClass(),
                round.getId()).toUri().getPath();
    }
}
