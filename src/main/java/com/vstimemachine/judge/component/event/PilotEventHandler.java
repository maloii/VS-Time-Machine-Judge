package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.model.Pilot;
import lombok.RequiredArgsConstructor;
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
@RepositoryEventHandler(Pilot.class)
@RequiredArgsConstructor
public class PilotEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @HandleAfterCreate
    public void newPilot(Pilot pilot) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newPilot", getPath(pilot));
    }

    @HandleAfterDelete
    public void deletePilot(Pilot pilot) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deletePilot", getPath(pilot));
    }

    @HandleAfterSave
    public void updatePilot(Pilot pilot) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updatePilot", getPath(pilot));
    }

    /**
     * Take an {@link Pilot} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param pilot
     */
    private String getPath(Pilot pilot) {
        return this.entityLinks.linkForSingleResource(pilot.getClass(),
                pilot.getId()).toUri().getPath();
    }

}
