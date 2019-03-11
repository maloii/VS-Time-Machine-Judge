package com.vstimemachine.judge.component.event;


import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.dao.GroupSportsmanRepository;
import com.vstimemachine.judge.dao.RoundRepository;
import com.vstimemachine.judge.dao.SportsmanRepository;
import com.vstimemachine.judge.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.IntStream;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Slf4j
@Component
@RepositoryEventHandler(Round.class)
@RequiredArgsConstructor
public class RoundEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    private final RoundRepository roundRepository;
    private final GroupRepository groupRepository;
    private final SportsmanRepository sportsmanRepository;
    private final GroupSportsmanRepository groupSportsmanRepository;

    @HandleBeforeCreate
    @HandleBeforeSave
    public void newRoundBefore(Round round) {
        if(round.getSelected()){
            roundRepository.clearAllSelected(round.getCompetition().getId());
            log.info("Selected round:{}", round.getName());
        }
    }

    @HandleAfterCreate
    public void newRound(Round round) {
        if(round.getTypeGenerateRound().equals(TypeGenerateRound.RANDOM)){
            List<Sportsman> sportsmen = sportsmanRepository.findAllRandamQuestions(round.getCompetition());
            if(sportsmen.size() > 0) {
                Group group = new Group("Group 1", 0, round, round.getCompetition());
                group.setSelected(true);
                groupRepository.save(group);
                log.info("Greate new group: {}", group.getName());
                for (int i = 0; i < sportsmen.size(); i++) {
                    if (i != 0 && i % round.getCountSportsmen() == 0) {
                        group = new Group("Group " + (group.getSort() + 2), (group.getSort() + 1), round, round.getCompetition());
                        groupRepository.save(group);
                        log.info("Greate new group: {}", group.getName());
                    }
                    GroupSportsman groupSportsman = new GroupSportsman();
                    Sportsman sportsman = sportsmen.get(i);
                    sportsman.addGroupSportsman(groupSportsman);
                    groupSportsman.setSportsman(sportsman);
                    groupSportsman.setGroup(group);
                    groupSportsman.setSort(i);
//                    sportsman.addGroup(group);
//                    group.addSportsman(sportsman);
                    group.addGroupSportsmen(groupSportsman);
//                    sportsmanRepository.save(sportsman);
                    groupSportsmanRepository.save(groupSportsman);
                    log.info("Add sportsman: {} {} to group: {}", sportsman.getFirstName(), sportsman.getLastName(), group.getName());
                }
            }else{
                log.info("Error generate round! There are no sportsmen!");
            }

        }
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newRound", getPath(round));
    }

    @HandleBeforeDelete
    public void deleteRoundBefore(Round round) {
        round.getGroups().forEach(group->{
            group.setRound(null);
            groupRepository.findById(group.getId()).ifPresent(groupRepository::delete);
        });
    }

    @HandleAfterDelete
    public void deleteRound(Round round) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteRound", getPath(round));
    }


    @HandleAfterSave
    public void updateRound(Round round) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateRound", getPath(round));
    }
    /**
     * Take an {@link Round} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param round
     */
    private String getPath(Round round) {
        return this.entityLinks.linkForSingleResource(round.getClass(),
                round.getId()).toUri().getPath();
    }
}
