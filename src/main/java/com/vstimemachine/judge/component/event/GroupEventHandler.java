package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.dao.GroupSportsmanRepository;
import com.vstimemachine.judge.dao.LapRepository;
import com.vstimemachine.judge.dao.RoundRepository;
import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.model.GroupSportsman;
import com.vstimemachine.judge.model.Round;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Iterator;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Slf4j
@Component
@RepositoryEventHandler(Group.class)
@RequiredArgsConstructor
public class GroupEventHandler {
    
    private final SimpMessagingTemplate websocket;
    private final EntityLinks entityLinks;
    private final GroupRepository groupRepository;
    private final GroupSportsmanRepository groupSportsmanRepository;

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
//        if(group.getRound() != null && group.getRound().getGroups() != null) group.getRound().getGroups().remove(this);
//        if(group.getCompetition() != null && group.getCompetition().getGroups() != null) group.getCompetition().getGroups().remove(this);
//        if(group.getLeague() != null && group.getLeague().getGroups() != null) group.getLeague().getGroups().remove(this);
        Iterator<GroupSportsman> iterator = group.getGroupSportsmen().iterator();
        while (iterator.hasNext()) {
            GroupSportsman groupSportsman = iterator.next();
            groupSportsman.getLaps().forEach(lap -> lap.setRound(null));
            groupSportsman.setGroup(null);
            groupSportsman.getSportsman().getGroupSportsmen().remove(groupSportsman);
            groupSportsmanRepository.delete(groupSportsman);
        }
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
