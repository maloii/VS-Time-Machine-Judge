package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.model.Settings;
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
@RepositoryEventHandler(Settings.class)
@RequiredArgsConstructor
public class SettingsEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @HandleAfterCreate
    public void newSettings(Settings settings) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newSettings", getPath(settings));
    }

    @HandleAfterDelete
    public void deleteSettings(Settings settings) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteSettings", getPath(settings));
    }

    @HandleAfterSave
    public void updateSettings(Settings settings) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateSettings", getPath(settings));
    }

    /**
     * Take an {@link Settings} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param settings
     */
    private String getPath(Settings settings) {
        return this.entityLinks.linkForSingleResource(settings.getClass(),
                settings.getId()).toUri().getPath();
    }
}
