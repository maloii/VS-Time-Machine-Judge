package com.vstimemachine.judge.component.event;


import com.vstimemachine.judge.dao.*;
import com.vstimemachine.judge.model.*;
import com.vstimemachine.judge.race.RaceException;
import com.vstimemachine.judge.report.ReportData;
import com.vstimemachine.judge.report.ReportDataInterface;
import com.vstimemachine.judge.report.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;
import static com.vstimemachine.judge.model.TypeParentEntity.REPORT;
import static com.vstimemachine.judge.model.TypeReport.BEST_LAP;
import static com.vstimemachine.judge.model.TypeRound.*;
import static org.springframework.transaction.annotation.Propagation.MANDATORY;

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
    private final ReportRepository reportRepository;
    private final ReportService reportService;

    public static final int[] SORT_GROUP_2 = {1, 2};
    public static final int[] SORT_GROUP_4 = {1, 4, 3, 2};
    public static final int[] SORT_GROUP_8 = {1, 8, 6, 4, 3, 5, 7, 2};
    public static final int[] SORT_GROUP_16= {1, 16, 8, 14, 4, 12, 6, 10, 9, 5, 11, 3, 13, 7, 15, 2};

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

        if(round.getTypeRound().equals(PRACTICE) || round.getTypeRound().equals(QUALIFICATION)) {

            if (round.getTypeGenerateRound().equals(TypeGenerateRound.RANDOM)) {
                generateRandomGroups(round);
            } else if (round.getTypeGenerateRound().equals(TypeGenerateRound.COPY_BEFORE_ROUND)) {
                generateGroupsFromBeforeRound(round);
            }
        }else if(round.getTypeRound().equals(RACE) || round.getTypeRound().equals(FINAL)) {
            if(round.getTypeParentEntity().equals(REPORT)){
                generateRaceFromReport(round);
            }else{
                generateRaceFromBeforeRound(round);
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


    private void generateRandomGroups(Round round){
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
                newGroupSportsman(group, sportsmen.get(i), i);
            }
        }else{
            log.info("Error generate round! There are no sportsmen!");
        }
    }

    private void generateGroupsFromBeforeRound(Round round){
        roundRepository.findById(round.getFromRoundCopy()).ifPresent(roundCopy -> {
            roundCopy.getGroups().forEach(groupCopy -> {
                final Group group = new Group(groupCopy.getName(), groupCopy.getSort(), round, round.getCompetition());
                group.setSelected(groupCopy.getSort() == 0);
                groupRepository.save(group);
                log.info("Greate new group: {}", group.getName());
                groupCopy.getGroupSportsmen().forEach(groupSportsmanCopy -> {
                    newGroupSportsman(group, groupSportsmanCopy.getSportsman(), groupSportsmanCopy.getSort());
//                    GroupSportsman groupSportsman = new GroupSportsman();
//                    groupSportsmanCopy.getSportsman().addGroupSportsman(groupSportsman);
//                    groupSportsman.setSportsman(groupSportsmanCopy.getSportsman());
//                    groupSportsman.setGroup(group);
//                    groupSportsman.setSort(groupSportsmanCopy.getSort());
//                    group.addGroupSportsmen(groupSportsman);
//                    groupSportsmanRepository.save(groupSportsman);
//                    log.info("Add sportsman: {} {} to group: {}",
//                            groupSportsmanCopy.getSportsman().getFirstName(),
//                            groupSportsmanCopy.getSportsman().getLastName(),
//                            group.getName());
                });
            });

        });
    }

    private void generateRaceFromReport(Round round){
        if(round.getParentEntityId() != null){
            ReportData reportData = reportService.report(round.getParentEntityId());
            List<ReportDataInterface> data = reportData.getData();
            int countRounds = round.getTopLimit()/round.getCountSportsmen();
            if(data.size() < round.getTopLimit() || !(countRounds == 2 || countRounds == 4 || countRounds == 8 || countRounds == 16) ){
                this.websocket.convertAndSend(
                        MESSAGE_PREFIX + "/newRound", getPath(round));
                String errorMessage = "The number of pilots in the report is less than is required to form groups";
                log.error(errorMessage);
                throw new RaceException(errorMessage);
            }
            int [] sortGroups = {};
            if(countRounds == 2){
                sortGroups = SORT_GROUP_2;
            }else if(countRounds == 4){
                sortGroups = SORT_GROUP_4;
            }else if(countRounds == 8){
                sortGroups = SORT_GROUP_8;
            }else if(countRounds == 16){
                sortGroups = SORT_GROUP_16;
            }
            int firstSportsman = 0;
            for(int r = 0; r < countRounds; r++ ){
                firstSportsman = sortGroups[r]-1;
                Group group = new Group("Group "+(r+1), r, round, round.getCompetition());
                if(r == 0)group.setSelected(true);
                groupRepository.save(group);
                log.info("Greate new group: {}", group.getName());
                int sort = 0;
                int p = 0;
                for(int s = firstSportsman; s < round.getTopLimit(); s = s+round.getCountSportsmen() ){
                    if(p < round.getCountSportsmen()) {
                        ReportDataInterface reportDataI = data.get(s);
                        newGroupSportsman(group, reportDataI.getSportsman(), sort++);
                    }
                    p++;
                }
            }


        }
    }

    private void newGroupSportsman(Group group, Sportsman sportsman, int sort){
        GroupSportsman groupSportsman = new GroupSportsman();
        sportsman.addGroupSportsman(groupSportsman);
        groupSportsman.setSportsman(sportsman);
        groupSportsman.setGroup(group);
        groupSportsman.setSort(sort);
        group.addGroupSportsmen(groupSportsman);
        groupSportsmanRepository.save(groupSportsman);
        log.info("Add sportsman: {} {} to group: {}", sportsman.getFirstName(), sportsman.getLastName(), group.getName());

    }
    private void generateRaceFromBeforeRound(Round round) {

    }
}
