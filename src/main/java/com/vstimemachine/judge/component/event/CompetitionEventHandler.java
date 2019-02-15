package com.vstimemachine.judge.component.event;


import com.vstimemachine.judge.dao.CompetitionRepository;
import com.vstimemachine.judge.model.Competition;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
@RepositoryEventHandler(Competition.class)
public class CompetitionEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    private CompetitionRepository competitionRepository;

    @Autowired
    public CompetitionEventHandler(SimpMessagingTemplate websocket, EntityLinks entityLinks, CompetitionRepository competitionRepository) {
        this.websocket = websocket;
        this.entityLinks = entityLinks;
        this.competitionRepository = competitionRepository;
    }

    @HandleBeforeCreate
    @HandleBeforeSave
    public void newCompetitionBefore(Competition competition) {
        if(competition.getSelected()){
            competitionRepository.clearAllSelected();
        }
    }

    @HandleAfterCreate
    public void newCompetition(Competition competition) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newCompetition", getPath(competition));
    }

    @HandleAfterDelete
    public void deleteCompetition(Competition competition) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteCompetition", getPath(competition));
    }

    @HandleAfterSave
    public void updateCompetition(Competition competition) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateCompetition", getPath(competition));
    }

    /**
     * Take an {@link Competition} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param competition
     */
    private String getPath(Competition competition) {
        return this.entityLinks.linkForSingleResource(competition.getClass(),
                competition.getId()).toUri().getPath();
    }
}
