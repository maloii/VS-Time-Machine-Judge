package com.vstimemachine.judge.component.event;


import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.dao.RoundRepository;
import com.vstimemachine.judge.dao.SportsmanRepository;
import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.model.Round;
import com.vstimemachine.judge.model.Sportsman;
import com.vstimemachine.judge.model.TypeGenerateRound;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterDelete;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Slf4j
@Component
@RepositoryEventHandler(Round.class)
public class RoundEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    private final RoundRepository roundRepository;
    private final GroupRepository groupRepository;
    private final SportsmanRepository sportsmanRepository;
    @Autowired
    public RoundEventHandler(SimpMessagingTemplate websocket,
                             EntityLinks entityLinks,
                             RoundRepository roundRepository,
                             SportsmanRepository sportsmanRepository,
                             GroupRepository groupRepository) {
        this.websocket = websocket;
        this.entityLinks = entityLinks;
        this.roundRepository = roundRepository;
        this.sportsmanRepository = sportsmanRepository;
        this.groupRepository = groupRepository;
    }

    @HandleAfterCreate
    public void newRound(Round round) {
        if(round.getTypeGenerateRound().equals(TypeGenerateRound.RANDOM)){
            List<Sportsman> sportsmen = sportsmanRepository.findAllRandamQuestions(round.getCompetition());
            if(sportsmen.size() > 0) {
                Group group = new Group("Group 1", 0, round);
                group.setSelected(true);
                groupRepository.save(group);
                log.info("Greate new group: {}", group.getName());
                for (int i = 0; i < sportsmen.size(); i++) {
                    if (i != 0 && i % round.getCountSportsmen() == 0) {
                        group = new Group("Group " + (group.getSort() + 2), (group.getSort() + 1), round);
                        groupRepository.save(group);
                        log.info("Greate new group: {}", group.getName());
                    }
                    Sportsman sportsman = sportsmen.get(i);
                    sportsman.addGroup(group);
                    group.addSportsman(sportsman);
                    sportsmanRepository.save(sportsman);
                    log.info("Greate new sportsman: {} {}", sportsman.getFirstName(), sportsman.getLastName());
                }
            }else{
                log.info("Error generate round! There are no sportsmen!");
            }

        }
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newRound", getPath(round));
    }

    @HandleAfterDelete
    public void deleteRound(Round round) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteRound", getPath(round));
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
