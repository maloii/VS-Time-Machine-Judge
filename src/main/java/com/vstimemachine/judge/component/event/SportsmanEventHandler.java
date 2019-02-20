package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.model.Sportsman;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterDelete;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
@RepositoryEventHandler(Sportsman.class)
public class SportsmanEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @Autowired
    public SportsmanEventHandler(SimpMessagingTemplate websocket, EntityLinks entityLinks) {
        this.websocket = websocket;
        this.entityLinks = entityLinks;
    }

    @HandleAfterCreate
    public void newSportsman(Sportsman sportsman) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newSportsman", getPath(sportsman));
    }

    @HandleAfterDelete
    public void deleteSportsman(Sportsman sportsman) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteSportsman", getPath(sportsman));
    }

    @HandleAfterSave
    public void updateSportsman(Sportsman sportsman) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateSportsman", getPath(sportsman));
    }

    /**
     * Take an {@link Sportsman} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param sportsman
     */
    private String getPath(Sportsman sportsman) {
        return this.entityLinks.linkForSingleResource(sportsman.getClass(),
                sportsman.getId()).toUri().getPath();
    }

}