package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.model.Transponder;
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
@RepositoryEventHandler(Transponder.class)
@RequiredArgsConstructor
public class TransponderEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @HandleAfterCreate
    public void newTransponder(Transponder transponder) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newTransponder", getPath(transponder));
    }

    @HandleAfterDelete
    public void deleteTransponder(Transponder transponder) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteTransponder", getPath(transponder));
    }

    /**
     * Take an {@link Transponder} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param transponder
     */
    private String getPath(Transponder transponder) {
        return this.entityLinks.linkForSingleResource(transponder.getClass(),
                transponder.getId()).toUri().getPath();
    }
}