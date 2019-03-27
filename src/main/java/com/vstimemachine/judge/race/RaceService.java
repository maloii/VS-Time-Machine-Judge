package com.vstimemachine.judge.race;

import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.dao.GroupSportsmanRepository;
import com.vstimemachine.judge.dao.LapRepository;
import com.vstimemachine.judge.dao.SportsmanRepository;
import com.vstimemachine.judge.model.*;
import com.vstimemachine.judge.race.speech.SpeechService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.sound.sampled.*;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;
import static com.vstimemachine.judge.race.RaceStatus.*;
import static com.vstimemachine.judge.race.speech.SpeechService.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class RaceService {

    private final SimpMessagingTemplate websocket;
    private final SpeechService speechService;
    private final SportsmanRepository sportsmanRepository;
    private final GroupRepository groupRepository;
    private final GroupSportsmanRepository groupSportsmanRepository;
    private final LapRepository lapRepository;
    final private ApplicationContext context;

    private Long startTime;
    private RaceStatus raceStatus = STOP;
    private Group selectedGroup;

    private Set<Integer> numberPackages = new HashSet<>();
    private HashMap<Long, Long> lastTimeLap = new HashMap<>();

    private SearchTransponders searchTransponders;

    private ScheduledExecutorService scheduler1;
    private ScheduledExecutorService scheduler2;
    private ScheduledExecutorService scheduler3;

    public void start(Group group) throws RaceException {
        if(raceStatus == STOP){
            lapRepository.deleteAllByGroupId(group.getId());
            group.getGroupSportsmen().forEach(groupSportsman -> {
                groupSportsman.setPosition(0);
                groupSportsmanRepository.save(groupSportsman);
            });
//            Hibernate.initialize(group.getSportsmen());

            selectedGroup = group;
            speechService.say(FOCUS_ON_START);
            numberPackages.clear();
            raceStatus = READY;
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/updateStatusRace", READY.toString());
            startTime = System.currentTimeMillis();

            scheduler1 = Executors.newSingleThreadScheduledExecutor();
            scheduler1.schedule(this::beep, new Random().nextInt(4001)+4000, TimeUnit.MILLISECONDS);
            scheduler1.shutdown();
        }else{
            String errorMessage = String.format("You can not start a race because the race statute is not STOP. Current race status: %s", raceStatus.toString());
            log.error(errorMessage);
            throw new RaceException(errorMessage);
        }
    }

    public void stop() {
        if(raceStatus == SEARCH){
            searchTransponders.interrupt();
        }else if(raceStatus == RUN || raceStatus == READY) {
            try {if (scheduler1 != null) scheduler1.shutdownNow();} catch (Exception e) {}
            try {if (scheduler2 != null) scheduler2.shutdownNow();} catch (Exception e) {}
            try {if (scheduler3 != null) scheduler3.shutdownNow();} catch (Exception e) {}
            speechService.say(RACE_IS_OVER);
        }
        raceStatus = STOP;

        this.websocket.convertAndSend(MESSAGE_PREFIX + "/updateStatusRace", STOP.toString());
        log.error("Stop race at {}", System.currentTimeMillis());

    }

    public void search(Group group) throws RaceException {
        if(raceStatus == STOP){
            Hibernate.initialize(group.getGroupSportsmen());
            group.getGroupSportsmen().stream().forEach(groupSportsman -> {
                Hibernate.initialize(groupSportsman.getSportsman().getTransponders());
            });
            Hibernate.initialize(group.getCompetition());
            startTime = System.currentTimeMillis();
            group.getGroupSportsmen()
                    .stream()
                    .forEach(groupSportsman -> {
                        groupSportsman.setSearchTransponder(false);
                        groupSportsmanRepository.save(groupSportsman);

                        this.websocket.convertAndSend(MESSAGE_PREFIX + "/updateGroupSportsman", "");
                    });
            selectedGroup = group;
            raceStatus = SEARCH;
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/updateStatusRace", SEARCH.toString());
            searchTransponders = new SearchTransponders(this, context);
            searchTransponders.start();
            log.error("Start search at {}", startTime);
        }else{
            String errorMessage = String.format("You can not start a search transponders because the race statute is not STOP. Current race status: %s", raceStatus.toString());
            log.error(errorMessage);
            throw new RaceException(errorMessage);
        }
    }

    public void selectGroupForBroadcast(Group group){
        groupRepository.findById(group.getId()).ifPresent(g->{
            groupRepository.clearAllSelectedBroadcast(g.getCompetition().getId());
            groupRepository.setSelectedBroadcast(g.getId());
            this.websocket.convertAndSend(
                    MESSAGE_PREFIX + "/updateGroup", "");
        });
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
                                    selectedGroup.getGroupSportsmen()
                                            .stream()
                                            .filter(groupSportsmen->groupSportsmen.getSportsman().equals(sportsman))
                                            .findFirst().ifPresent(groupSportsmen->{
                                            Round round  = selectedGroup.getRound();
                                            long timeLap = milliseconds - lastTimeLap.get(sportsman.getId());
                                            long gateDalay = gate.getDelay()*1000L;
                                            TypeLap typeLap = ((gateDalay>0
                                                    && gateDalay < timeLap)
                                                    || gateDalay == 0)? TypeLap.OK:TypeLap.HIDDEN;
                                            if(round.getMaxTimeRace() != null
                                                    && round.getMaxTimeRace().longValue() > 0){
                                                long maxTimeRace = round.getMaxTimeRace().longValue() * 1000L;
                                                if(round.getTypeRace() == TypeRace.FIXED_COUNT_LAPS
                                                        || round.getTypeRace() == TypeRace.FIXED_TIME) {
                                                    if ((milliseconds - selectedGroup.getStartMillisecond()) >= maxTimeRace)
                                                        typeLap = TypeLap.HIDDEN;
                                                }else if(round.getTypeRace() == TypeRace.FIXED_TIME_AND_ONE_LAP_AFTER){
                                                    System.out.println(lastTimeLap.get(sportsman.getId()) - selectedGroup.getStartMillisecond());
                                                    System.out.println(maxTimeRace);
                                                    if ((lastTimeLap.get(sportsman.getId()) - selectedGroup.getStartMillisecond()) >= maxTimeRace)
                                                        typeLap = TypeLap.HIDDEN;

                                                }
                                            }
                                            List<Lap> laps = lapRepository.findByGroupSportsmanId(groupSportsmen.getId());
                                            System.out.println(laps.size());
                                            if(round.getTypeRace() == TypeRace.FIXED_COUNT_LAPS && typeLap != TypeLap.HIDDEN && round.getCountLap() != null &&
                                                    round.getCountLap() > 0){
                                                if(laps
                                                        .stream()
                                                        .filter(lap -> lap.getTypeLap() == TypeLap.OK)
                                                        .count()>=round.getCountLap()) typeLap = TypeLap.HIDDEN;
                                            }
                                            if(selectedGroup.getCompetition().getSkipFirstGate() && laps.size() == 0){
                                                typeLap = TypeLap.START;
                                            }
                                            if(typeLap == TypeLap.OK || typeLap == TypeLap.START){
                                                lastTimeLap.put(sportsman.getId(), milliseconds);
                                            }
                                            Lap lap = new Lap();
                                            lap.setTypeLap(typeLap);
                                            lap.setMillisecond(milliseconds);
                                            lap.setSportsman(sportsman);
                                            lap.setGate(gate);
                                            lap.setGroup(selectedGroup);
                                            lap.setRound(round);

                                                lap.setGroupSportsman(groupSportsmen);
                                                lapRepository.save(lap);
                                                log.info("New lap created for sportsmen: [{}] in round: [{}] in group: [{}] with time: [{}] type: [{}]",
                                                        sportsman.getLastName(),
                                                        selectedGroup.getRound().getName(),
                                                        selectedGroup.getName(),
                                                        milliseconds,
                                                        typeLap);

                                        this.websocket.convertAndSend(
                                                MESSAGE_PREFIX + "/newLap", "");

                                        try {
                                            AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(new BufferedInputStream(new ClassPathResource("/media/short_beep.wav").getInputStream()));
                                            Clip clip = AudioSystem.getClip();
                                            clip.open(audioInputStream);
                                            clip.start();
                                        }catch (Exception e){e.printStackTrace();}
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
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/updateStatusRace", RUN.toString());
            startTime = System.currentTimeMillis();
            selectedGroup.setStartMillisecond(System.currentTimeMillis());
            groupRepository.save(selectedGroup);
            selectedGroup.getGroupSportsmen().stream().forEach(groupSportsman -> {
                lastTimeLap.put(groupSportsman.getSportsman().getId(), startTime);
            });
            log.error("Start race at {}", startTime);


            if (selectedGroup.getRound().getMaxTimeRace() > 0){
                scheduler2 = Executors.newSingleThreadScheduledExecutor();
                scheduler2.schedule(this::beep2, selectedGroup.getRound().getMaxTimeRace()*1000L, TimeUnit.MILLISECONDS);
                scheduler2.shutdown();


                if(selectedGroup.getRound().getMaxTimeRace() > 15) {
                    scheduler3 = Executors.newSingleThreadScheduledExecutor();
                    scheduler3.schedule(this::sec15, (selectedGroup.getRound().getMaxTimeRace()-15)*1000L, TimeUnit.MILLISECONDS);
                    scheduler3.shutdown();
                }
            }
            AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(new BufferedInputStream(new ClassPathResource("/media/beep.wav").getInputStream()));
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

    private void sec15(){
        speechService.say(SECONDS_15);
    }
    private void beep2() {
        try {
            AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(new BufferedInputStream(new ClassPathResource("/media/beep.wav").getInputStream()));
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

    public void transponderHasBeenFound(int transponder) {
        if(raceStatus == SEARCH){
            selectedGroup.getGroupSportsmen()
                    .stream()
                    .filter(groupSportsman -> {
                        return  groupSportsman.getSportsman().getTransponders()
                                .stream()
                                .filter(trs->trs.getNumber().equals(transponder)).count()>0;
                    }).findFirst()
                    .ifPresent(groupSportsman -> {
                        groupSportsman.setSearchTransponder(true);
                        groupSportsmanRepository.searchOk(groupSportsman.getId());
                        this.websocket.convertAndSend(MESSAGE_PREFIX + "/updateGroupSportsman", "");
                    });
        }
    }

    public void updatePositions(List<GroupSportsman> groupSportsmen) {
        groupSportsmen.forEach(groupSportsman -> {
            groupSportsmanRepository.findById(groupSportsman.getId()).ifPresent(gs->{
                gs.setPosition(groupSportsman.getPosition());
                groupSportsmanRepository.save(gs);
            });
        });
    }
}
