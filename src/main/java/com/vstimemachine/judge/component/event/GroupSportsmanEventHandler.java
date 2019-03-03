package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.model.GroupSportsman;
import com.vstimemachine.judge.model.GroupSportsman;
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
@RepositoryEventHandler(GroupSportsman.class)
@RequiredArgsConstructor
public class GroupSportsmanEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @HandleAfterCreate
    public void newGroupSportsman(GroupSportsman groupSportsman) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newGroupSportsman", getPath(groupSportsman));
    }

    @HandleAfterDelete
    public void deleteGroupSportsman(GroupSportsman groupSportsman) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteGroupSportsman", getPath(groupSportsman));
    }

    @HandleAfterSave
    public void updateGroupSportsman(GroupSportsman groupSportsman) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateGroupSportsman", getPath(groupSportsman));
    }

    /**
     * Take an {@link GroupSportsman} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param groupSportsman
     */
    private String getPath(GroupSportsman groupSportsman) {
        return this.entityLinks.linkForSingleResource(groupSportsman.getClass(),
                groupSportsman.getId()).toUri().getPath();
    }
}
