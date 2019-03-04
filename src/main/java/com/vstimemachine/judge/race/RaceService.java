package com.vstimemachine.judge.race;

import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.dao.GroupSportsmanRepository;
import com.vstimemachine.judge.dao.LapRepository;
import com.vstimemachine.judge.dao.SportsmanRepository;
import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.model.Lap;
import com.vstimemachine.judge.model.TypeLap;
import com.vstimemachine.judge.race.speech.SpeechService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.sound.sampled.*;
import java.io.IOException;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;
import static com.vstimemachine.judge.race.RaceStatus.*;
import static com.vstimemachine.judge.race.speech.SpeechService.FOCUS_ON_START;
import static com.vstimemachine.judge.race.speech.SpeechService.RACE_IS_OVER;

@Slf4j
@Service
@RequiredArgsConstructor
public class RaceService {

    private final SimpMessagingTemplate websocket;
    private final SpeechService speechService;
    private final SportsmanRepository sportsmanRepository;
    private final GroupRepository groupRepository;
    private final LapRepository lapRepository;
    private final GroupSportsmanRepository groupSportsmanRepository;

    private Long startTime;
    private RaceStatus raceStatus = STOP;
    private Group selectedGroup;

    private Set<Integer> numberPackages = new HashSet<>();


    public void start(Group group) throws RaceException {
        if(raceStatus == STOP){
            lapRepository.deleteAllByGroup(group);
            group.setStartMillisecond(System.currentTimeMillis());
            groupRepository.save(group);
//            Hibernate.initialize(group.getSportsmen());
//            Hibernate.initialize(group.getCompetition());
//            Hibernate.initialize(group.getCompetition().getGates());
//            Hibernate.initialize(group.getRound());
            selectedGroup = group;
            speechService.say(FOCUS_ON_START);
            numberPackages.clear();
            raceStatus = READY;
            startTime = System.currentTimeMillis();

            ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
            scheduler.schedule(this::beep, new Random().nextInt(4001)+4000, TimeUnit.MILLISECONDS);
            scheduler.shutdown();
        }else{
            String errorMessage = String.format("You can not start a race because the race statute is not STOP. Current race status: %s", raceStatus.toString());
            log.error(errorMessage);
            throw new RaceException(errorMessage);
        }
    }

    public void stop() {
        raceStatus = STOP;
        speechService.say(RACE_IS_OVER);
        log.error("Stop race at {}", System.currentTimeMillis());
    }

    public void search() throws RaceException {
        if(raceStatus == STOP){
            startTime = System.currentTimeMillis();
            raceStatus = SEARCH;
            log.error("Start search at {}", startTime);
        }else{
            String errorMessage = String.format("You can not start a search transponders because the race statute is not STOP. Current race status: %s", raceStatus.toString());
            log.error(errorMessage);
            throw new RaceException(errorMessage);
        }
    }

    public void newLap(long milliseconds, int transponder, final int numberPackage){
        if(raceStatus == RUN && !numberPackages.contains(numberPackage)){
            sportsmanRepository
                    .findByTranspondersNumberAndCompetition(transponder, selectedGroup.getCompetition())
                    .ifPresent(sportsman -> {
                        selectedGroup.getCompetition()
                                .getGates()
                                .stream()
                                .filter(gate -> gate.getNumber()==0).findFirst()
                                .ifPresent(gate -> {
                                    long timeLap = milliseconds-startTime;
                                    TypeLap typeLap = ((selectedGroup.getRound().getMinTimeLap()>0
                                                        && selectedGroup.getRound().getMinTimeLap() < timeLap)
                                                        || selectedGroup.getRound().getMinTimeLap() == 0)? TypeLap.OK:TypeLap.HIDDEN;
                                    Lap lap = new Lap();
                                    lap.setTypeLap(typeLap);
                                    lap.setMillisecond(milliseconds);
                                    lap.setSportsman(sportsman);
                                    lap.setGate(gate);
                                    lap.setGroup(selectedGroup);
                                    lap.setRound(selectedGroup.getRound());
                                    selectedGroup.getGroupSportsmen()
                                            .stream()
                                            .filter(groupSportsmen->groupSportsmen.getSportsman().equals(sportsman))
                                            .findFirst().ifPresent(groupSportsmen->{
                                                lap.setGroupSportsman(groupSportsmen);
                                                lapRepository.save(lap);
                                        log.info("New lap created for sportsmen: [{}] in round: [{}] in group: [{}] with time: [{}] type: [{}]",
                                                sportsman.getLastName(),
                                                selectedGroup.getRound().getName(),
                                                selectedGroup.getName(),
                                                milliseconds,
                                                typeLap);
                                    });
                                    numberPackages.add(numberPackage);
                                });
                    });
        }

    }

    public RaceStatus status() {

        return raceStatus;
    }

    @Scheduled(fixedRate = 1000)
    public void reportTimeRace() {
        if(raceStatus == RUN && startTime != null){
            Long timeRace = (System.currentTimeMillis() - startTime)/1000L;
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/reportTimeRace", String.valueOf(timeRace));
        }
    }

    private void beep() {
        try {
            raceStatus = RUN;
            startTime = System.currentTimeMillis();
            log.error("Start race at {}", startTime);

            AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(new ClassPathResource("/media/beep.wav").getFile().getAbsoluteFile());
            Clip clip = AudioSystem.getClip();
            clip.open(audioInputStream);
            clip.start();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (UnsupportedAudioFileException e) {
            e.printStackTrace();
        } catch (LineUnavailableException e) {
            e.printStackTrace();
        }
    }

    public Group group() {
        return selectedGroup;
    }
}
