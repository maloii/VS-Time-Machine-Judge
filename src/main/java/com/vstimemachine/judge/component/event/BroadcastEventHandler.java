package com.vstimemachine.judge.component.event;


import com.vstimemachine.judge.dao.CompetitionRepository;
import com.vstimemachine.judge.model.Broadcast;
import com.vstimemachine.judge.model.Competition;
import lombok.RequiredArgsConstructor;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
@RepositoryEventHandler(Broadcast.class)
@RequiredArgsConstructor
public class BroadcastEventHandler {
    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;
    private final CompetitionRepository competitionRepository;

    @HandleAfterCreate
    public void newBroadcast(Broadcast broadcast) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newBroadcast", getPath(broadcast));
    }

    @HandleAfterDelete
    public void deleteBroadcast(Broadcast broadcast) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteBroadcast", getPath(broadcast));
    }

    @HandleBeforeDelete
    public void deleteBeforeBroadcast(Broadcast broadcast) {
        Competition competition  = broadcast.getCompetition();
        competition.setMainScreenBroadcast(null);
        competitionRepository.save(competition);
    }

    @HandleAfterSave
    public void updateBroadcast(Broadcast broadcast) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateBroadcast", getPath(broadcast));
    }

    /**
     * Take an {@link Broadcast} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param broadcast
     */
    private String getPath(Broadcast broadcast) {
        return this.entityLinks.linkForSingleResource(broadcast.getClass(),
                broadcast.getId()).toUri().getPath();
    }
}
