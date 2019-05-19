package com.vstimemachine.judge.report;

import com.vstimemachine.judge.dao.LapRepository;
import com.vstimemachine.judge.dao.ReportRepository;
import com.vstimemachine.judge.dao.SportsmanRepository;
import com.vstimemachine.judge.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import static com.vstimemachine.judge.model.TypeLap.OK;
import static com.vstimemachine.judge.model.TypeReport.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    final static String PARAMETR_TYPE_ROUND = "TYPE_ROUND";
    final static String PARAMETR_COUNT_LAP = "COUNT_LAP";
    final static String PARAMETR_SUM_ROUNDS = "SUM_ROUNDS";
    final static String PARAMETR_NOT_COUNTED_ROUNDS = "NOT_COUNTED_ROUNDS";

    final static Long MAX_VALUE_TIME_LAP = 999999999L;

    final private ReportRepository reportRepository;
    final private LapRepository lapRepository;
    final private SportsmanRepository sportsmanRepository;

    public ReportData report(Long reportId){
        Optional<Report> optionalReport = reportRepository.findById(reportId);
        if(optionalReport.isPresent()){
            return make(optionalReport.get());
        }else{
            return new ReportData();
        }
    }

    private ReportData make(Report report){
        if(report.getTypeReport() == BEST_LAP){
            return makeBestSomeLap(report);
        }else if(report.getTypeReport() == COUNT_LAPS){
            return makeCountLap(report);
        }else if(report.getTypeReport() == POSITION_SPORTSMEN){
            return makePositionSportsmen(report);
        }
        return new ReportData();
    }

    private ReportData<Sportsman> makePositionSportsmen(Report report){
        List<Sportsman> list = sportsmanRepository.findAllByCompetition(report.getCompetition())
                .stream().map(sportsman -> new Sportsman(sportsman))
                .filter(sportsman -> sportsman.getSelected())
                .sorted(comparatorPosition())
                .collect(Collectors.toList());
        return new ReportData<Sportsman> (new Report(report), list);
    }
    private ReportData<BestLapReport> makeBestSomeLap(Report report){
        List<BestLapReport> bestLapReportDatas = new ArrayList<BestLapReport>();
        try {
            int countLap = Integer.parseInt(report.getParametrs().get("COUNT_LAP"));
            int sumRound = 1;
            try {
                sumRound = Integer.parseInt(report.getParametrs().get("SUM_ROUNDS"));
            }catch (Exception e){}

            Map<Round, Map<Sportsman, Long>> someLapsRound = new HashMap<>();
            Map<Sportsman, Long> resultLaps = report.getCompetition()
                    .getSportsmen()
                    .stream()
                    .filter(sportsman -> sportsman.getSelected())
                    .collect(Collectors.toMap(
                            sportsman -> sportsman,
                            sportsman -> MAX_VALUE_TIME_LAP)
                    );

            if(report.getCompetition().getRounds() != null) {
                report.getCompetition().getRounds().stream()
                        .filter(round -> {
                            return (round.getTypeRound()
                                    .equals(TypeRound.valueOf(report.getParametrs().get(PARAMETR_TYPE_ROUND)))
                                    || report.getParametrs().get(PARAMETR_TYPE_ROUND).equals("ALL"));
                        }).forEach(round -> {
                    Map<Sportsman, Long> someLaps = report.getCompetition()
                            .getSportsmen()
                            .stream()
                            .filter(sportsman -> sportsman.getSelected())
                            .collect(Collectors.toMap(
                                    sportsman -> sportsman,
                                    sportsman -> MAX_VALUE_TIME_LAP)
                            );
                    if (round.getGroups() != null) {
                        round.getGroups().forEach(group -> {
                            group.getGroupSportsmen().forEach(groupSportsman -> {
                                Lap[] laps = groupSportsman.getLaps().stream().filter(lap -> lap.getTypeLap().equals(OK))
                                        .filter(lap -> lap.getTimeLap() != null)
                                        .filter(lap -> {
                                            return (lap.getRound().getTypeRound()
                                                    .equals(TypeRound.valueOf(report.getParametrs().get(PARAMETR_TYPE_ROUND)))
                                                    || report.getParametrs().get(PARAMETR_TYPE_ROUND).equals("ALL"));
                                        }).sorted(Comparator.comparing(Lap::getId)).toArray(Lap[]::new);

                                if (laps.length >= countLap) {
                                    for (int i = countLap - 1; i < laps.length; i++) {
                                        Long oldTime = someLaps.get(groupSportsman.getSportsman());
                                        Long sumTime = 0L;
                                        for (int t = 0; t < countLap; t++) {
                                            sumTime += laps[i - t].getTimeLap();
                                        }
                                        if (sumTime < oldTime) someLaps.put(groupSportsman.getSportsman(), sumTime);
                                    }
                                }
                            });
                        });
                    }
                    someLapsRound.put(round, someLaps);
                });
            }


            for(Sportsman sportsman : resultLaps.keySet()){
                List<Long> bestLapsSportsmen = new ArrayList<>();
                for(Map<Sportsman, Long> mapSportsman : someLapsRound.values()) {
                    bestLapsSportsmen.add(mapSportsman.get(sportsman));
                }
                bestLapsSportsmen.sort((l1, l2) -> l1.compareTo(l2));
                Long resultTime = MAX_VALUE_TIME_LAP;
                if(bestLapsSportsmen.size() >= sumRound){
                    resultTime = bestLapsSportsmen.stream().limit(sumRound).mapToLong(Long::longValue).sum();
                }
                bestLapReportDatas.add(new BestLapReport(new Sportsman(sportsman), resultTime));
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return new ReportData<BestLapReport>(new Report(report), sortBestLap(bestLapReportDatas));
    }

    private List<BestLapReport> sortBestLap(List<BestLapReport> bestLapReportDatas){
        bestLapReportDatas.sort(Comparator.comparing(BestLapReport::getTimeLap));
        for (int i = 0; i < bestLapReportDatas.size(); i++){
            BestLapReport bestLapReportData = bestLapReportDatas.get(i);
            bestLapReportData.setPosition(i+1);
            if(i > 0){
                bestLapReportData.setRel(bestLapReportData.getTimeLap()- bestLapReportDatas.get(i-1).getTimeLap());
                bestLapReportData.setGap(bestLapReportData.getTimeLap()- bestLapReportDatas.get(0).getTimeLap());
            }
        }
        return bestLapReportDatas;
    }


    private ReportData<CountLapReport> makeCountLap(Report report) {
        List<CountLapReport> countLapReports = new ArrayList<>();
        int notCountedRounds = 0;
        try {
            notCountedRounds = Integer.parseInt(report.getParametrs().get("NOT_COUNTED_ROUNDS"));
        }catch (Exception e){}
        Map<Round, Map<Sportsman, Integer>> someCountLapsRound = new HashMap<>();
        Map<Sportsman, Integer> resulCountLaps = report.getCompetition()
                .getSportsmen()
                .stream()
                .filter(sportsman -> sportsman.getSelected())
                .collect(Collectors.toMap(
                        sportsman -> sportsman,
                        sportsman -> 0)
                );
        if(report.getCompetition().getRounds() != null) {
            report.getCompetition().getRounds().stream()
                    .filter(round -> {
                        return (round.getTypeRound()
                                .equals(TypeRound.valueOf(report.getParametrs().get(PARAMETR_TYPE_ROUND)))
                                || report.getParametrs().get(PARAMETR_TYPE_ROUND).equals("ALL"));
                    }).forEach(round -> {
                Map<Sportsman, Integer> someCountLaps = report.getCompetition()
                        .getSportsmen()
                        .stream()
                        .filter(sportsman -> sportsman.getSelected())
                        .collect(Collectors.toMap(
                                sportsman -> sportsman,
                                sportsman -> 0)
                        );
                if (round.getGroups() != null) {
                    round.getGroups().forEach(group -> {
                        group.getGroupSportsmen().forEach(groupSportsman -> {
                            Long count = groupSportsman.getLaps().stream().filter(lap -> lap.getTypeLap().equals(OK))
                                    .filter(lap -> lap.getTimeLap() != null)
                                    .filter(lap -> {
                                        return (lap.getRound().getTypeRound()
                                                .equals(TypeRound.valueOf(report.getParametrs().get(PARAMETR_TYPE_ROUND)))
                                                || report.getParametrs().get(PARAMETR_TYPE_ROUND).equals("ALL"));
                                    })
                                    .count();
//                            System.out.println(someCountLaps);
//                            System.out.println(groupSportsman);
//                            System.out.println(count);
                            if(someCountLaps.get(groupSportsman.getSportsman()) != null &&
                                    someCountLaps.get(groupSportsman.getSportsman()) < count.intValue())
                                someCountLaps.put(groupSportsman.getSportsman(), count.intValue());
                        });
                    });
                }
                someCountLapsRound.put(round, someCountLaps);
            });
        }
        for(Sportsman sportsman : resulCountLaps.keySet()){
            List<Integer> bestLapsSportsmen = new ArrayList<>();
            for(Map<Sportsman, Integer> mapSportsman : someCountLapsRound.values()) {
                bestLapsSportsmen.add(mapSportsman.get(sportsman));
            }
            bestLapsSportsmen.sort((l1, l2) -> l2.compareTo(l1));
            Integer resultCount = bestLapsSportsmen.stream().limit(bestLapsSportsmen.size()-notCountedRounds).mapToInt(Integer::intValue).sum();
            countLapReports.add(new CountLapReport(new Sportsman(sportsman), resultCount));
        }
        return new ReportData<CountLapReport>(new Report(report), sortCountLap(countLapReports));

    }

    private List<CountLapReport> sortCountLap(List<CountLapReport> countLapReportDatas){
        countLapReportDatas.sort(Comparator.comparing(CountLapReport::getCount).reversed());
        for (int i = 0; i < countLapReportDatas.size(); i++){
            CountLapReport countLapReportData = countLapReportDatas.get(i);
            countLapReportData.setPosition(i+1);
            if(i > 0){
                countLapReportData.setRel(countLapReportDatas.get(i-1).getCount() - countLapReportData.getCount());
                countLapReportData.setGap(countLapReportDatas.get(0).getCount() - countLapReportData.getCount());
            }
        }
        return countLapReportDatas;
    }


    private Comparator<Sportsman> comparatorPosition(){
        return new Comparator<Sportsman>() {
            @Override
            public int compare(Sportsman sportsman1, Sportsman sportsman2) {
                if(sportsman1.getPosition() != null && sportsman2.getPosition() != null) {
                    return sportsman1.getPosition().compareTo(sportsman2.getPosition());
                }
                else if(sportsman1.getPosition() == null) return 1;
                else return -1;
            }
        };
    }
}
