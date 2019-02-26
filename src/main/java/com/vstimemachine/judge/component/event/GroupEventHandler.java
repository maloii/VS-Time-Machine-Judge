package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.dao.SportsmanRepository;
import com.vstimemachine.judge.model.Group;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Slf4j
@Component
@RepositoryEventHandler(Group.class)
public class GroupEventHandler {
    
    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    private final GroupRepository groupRepository;

    private final SportsmanRepository sportsmanRepository;

    @Autowired
    public GroupEventHandler(SimpMessagingTemplate websocket,
                             EntityLinks entityLinks,
                             GroupRepository groupRepository,
                             SportsmanRepository sportsmanRepository) {
        this.websocket = websocket;
        this.entityLinks = entityLinks;
        this.groupRepository = groupRepository;
        this.sportsmanRepository = sportsmanRepository;
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

    @HandleBeforeDelete
    public void deleteGroupBefore(Group group) {
        group.getSportsmen().forEach(sportsman->{
            sportsman.getGroups().remove(group);
            log.info("Remove links between sportsmen:{} and group:{}", sportsman.getId(), group.getId());

        });
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
