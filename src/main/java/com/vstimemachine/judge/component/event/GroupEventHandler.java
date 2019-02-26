package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.model.Group;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
@RepositoryEventHandler(Group.class)
public class GroupEventHandler {
    
    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    private final GroupRepository groupRepository;

    @Autowired
    public GroupEventHandler(SimpMessagingTemplate websocket,
                             EntityLinks entityLinks,
                             GroupRepository groupRepository) {
        this.websocket = websocket;
        this.entityLinks = entityLinks;
        this.groupRepository = groupRepository;
    }

    @HandleBeforeCreate
    @HandleBeforeSave
    public void newGroupBefore(Group group) {
        if(group.getSelected()){
            groupRepository.clearAllSelected(group.getRound().getId());
        }
    }
    @HandleAfterCreate
    public void newGroup(Group group) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newGroup", getPath(group));
    }

    @HandleAfterDelete
    public void deleteGroup(Group group) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteGroup", getPath(group));
    }

    @HandleAfterSave
    public void updateGroup(Group group) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateGroup", getPath(group));
    }

    /**
     * Take an {@link Group} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param group
     */
    private String getPath(Group group) {
        return this.entityLinks.linkForSingleResource(group.getClass(),
                group.getId()).toUri().getPath();
    }
}
