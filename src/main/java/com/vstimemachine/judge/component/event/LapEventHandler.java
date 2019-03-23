package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.model.Lap;
import lombok.RequiredArgsConstructor;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterDelete;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
@RepositoryEventHandler(Lap.class)
@RequiredArgsConstructor
public class LapEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @HandleAfterCreate
    public void newLap(Lap lap) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newLap", getPath(lap));
    }

    @HandleAfterDelete
    public void deleteLap(Lap lap) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteLap", getPath(lap));
    }

    @HandleAfterSave
    public void updateLap(Lap lap) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateLap", getPath(lap));
    }

    /**
     * Take an {@link Lap} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param lap
     */
    private String getPath(Lap lap) {
        return this.entityLinks.linkForSingleResource(lap.getClass(),
                lap.getId()).toUri().getPath();
    }
}
