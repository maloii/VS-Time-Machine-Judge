package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.dao.*;
import com.vstimemachine.judge.model.*;
import com.vstimemachine.judge.race.RaceException;
import com.vstimemachine.judge.report.ReportData;
import com.vstimemachine.judge.report.ReportDataInterface;
import com.vstimemachine.judge.report.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;
import static com.vstimemachine.judge.model.TypeParentEntity.REPORT;
import static com.vstimemachine.judge.model.TypeRaceElimination.SINGLE_ELIMINATION;
import static com.vstimemachine.judge.model.TypeRound.*;
import static com.vstimemachine.judge.model.TypeRound.FINAL;
import static java.util.stream.Collectors.toSet;
import static org.springframework.transaction.annotation.Propagation.MANDATORY;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventHandler {

    private final RoundRepository roundRepository;
    private final GroupRepository groupRepository;
    private final SportsmanRepository sportsmanRepository;
    private final GroupSportsmanRepository groupSportsmanRepository;
    private final ReportService reportService;

    public static final int[] SORT_GROUP_2 = {1, 2};
    public static final int[] SORT_GROUP_4 = {1, 4, 3, 2};
    public static final int[] SORT_GROUP_8 = {1, 8, 6, 4, 3, 5, 7, 2};
    public static final int[] SORT_GROUP_16= {1, 16, 8, 14, 4, 12, 6, 10, 9, 5, 11, 3, 13, 7, 15, 2};

    @EventListener
    @Transactional(propagation = MANDATORY) // optional
    public void handleExtraActionEvent (RoundExtraActionEvent e) {
        Round round = e.getModel();
        String path = e.getPath();
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

    private void generateRaceFromBeforeRound(Round round) {
        if(round.getTypeRaceElimination() == SINGLE_ELIMINATION){
            roundRepository.findById(round.getParentEntityId()).ifPresent(parentRound -> {
                int countGroups = parentRound.getGroups().size();
                if (countGroups != 2 && countGroups != 4 && countGroups != 8 && countGroups != 16) {
                    String errorMessage = "The number of groups must be 2, 4, 8 or 16";
                    log.error(errorMessage);
                    throw new RaceException(errorMessage);
                }
                List<Group> groups =  new ArrayList(parentRound.getGroups());
                int r = 0;
                for (int i = 0; i < countGroups; i = i + 2) {
                    Group group = new Group("Group " + (r++), r, round, round.getCompetition());
                    if (r == 0) group.setSelected(true);
                    groupRepository.save(group);
                    Group group1 = groups.get(i);
                    Group group2 = groups.get(i+1);
                    if(group1.getGroupSportsmen().size() < round.getCountNextGo()
                            || group1.getGroupSportsmen().size() < round.getCountNextGo()){
                        String errorMessage = "There are fewer sportsmen in the group than the number who passes on.";
                        log.error(errorMessage);
                        throw new RaceException(errorMessage);
                    }
                    int[] idx = { 0 };
                    group1.getGroupSportsmen().stream()
                            .sorted(Comparator.comparing(GroupSportsman::getPosition))
                            .limit(round.getCountNextGo())
                            .collect(Collectors.toCollection(() ->
                                        group2.getGroupSportsmen().stream()
                                                .sorted(Comparator.comparing(GroupSportsman::getPosition))
                                                .limit(round.getCountNextGo())
                                                .collect(toSet())))
                            .forEach(groupSportsman -> {
                                newGroupSportsman(group, groupSportsman.getSportsman(), idx[0]++);
                            });



                }
            });
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
}
