package com.vstimemachine.judge.component.event;


import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.dao.RoundRepository;
import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.model.GroupSportsman;
import com.vstimemachine.judge.model.Round;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.SessionFactory;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import javax.persistence.EntityManagerFactory;

import java.util.Iterator;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

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
            if(round != null && round.getGroups() != null) round.getGroups().remove(this);
            if(group.getCompetition() != null && group.getCompetition().getGroups() != null) group.getCompetition().getGroups().remove(this);
            if(group.getLeague() != null && group.getLeague().getGroups() != null) group.getLeague().getGroups().remove(this);
            Iterator<GroupSportsman> iterator = group.getGroupSportsmen().iterator();
            while (iterator.hasNext()) {
                GroupSportsman groupSportsman = iterator.next();
                groupSportsman.getLaps().forEach(lap -> lap.setRound(null));
                groupSportsman.getSportsman().getGroupSportsmen().remove(groupSportsman);
            }
//            round.getGroups().remove(round);
//            group.setRound(null);
//            groupRepository.findById(group.getId()).ifPresent(groupRepository::delete);
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
