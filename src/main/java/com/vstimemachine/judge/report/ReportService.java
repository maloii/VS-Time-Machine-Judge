package com.vstimemachine.judge.report;

import com.vstimemachine.judge.dao.LapRepository;
import com.vstimemachine.judge.dao.ReportRepository;
import com.vstimemachine.judge.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import static com.vstimemachine.judge.model.TypeLap.OK;
import static com.vstimemachine.judge.model.TypeReport.BEST_LAP;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    final private ReportRepository reportRepository;
    final private LapRepository lapRepository;

    public List<BestLapReportTable> report(Long reportId){
        Optional<Report> optionalReport = reportRepository.findById(reportId);
        if(optionalReport.isPresent()){
            return make(optionalReport.get());
        }else{
            return new ArrayList<BestLapReportTable>();
        }
    }

    private List<BestLapReportTable> make(Report report){
        if(report.getTypeReport() == BEST_LAP){
            return makeBestLap(report);
        }
        return new ArrayList<BestLapReportTable>();
    }

    private List<BestLapReportTable> makeBestLap(Report report){
        List<BestLapReportTable> bestLapReportTables = new ArrayList<BestLapReportTable>();
        report.getCompetition().getSportsmen().forEach(sportsman -> {
            sportsman.getLaps()
                    .stream()
                    .filter(lap -> lap.getTypeLap().equals(OK))
                    .filter(lap -> lap.getTimeLap() != null)
                    .min((l1, l2)->l1.getTimeLap().compareTo(l2.getTimeLap()))
                    .ifPresent(lap -> {
                        Sportsman sp = new Sportsman();
                        sp.setFirstName(sportsman.getFirstName());
                        sp.setLastName(sportsman.getLastName());
                        sp.setNick(sportsman.getNick());


                        bestLapReportTables.add(new BestLapReportTable(sp, lap.getTimeLap()));
                    });
        });
        bestLapReportTables.sort((bl1, bl2)->bl1.getTimeLap().compareTo(bl2.getTimeLap()));
        for (int i = 0; i < bestLapReportTables.size(); i++){
            BestLapReportTable bestLapReportTable = bestLapReportTables.get(i);
            bestLapReportTable.setPosition(i+1);
            if(i > 0)bestLapReportTable.setGap(bestLapReportTable.getTimeLap()-bestLapReportTables.get(i-1).getTimeLap());

        }
//        report.getCompetition().getRounds().forEach(round -> {
//            round.getGroups().forEach(group -> {
//                group.getGroupSportsmen().forEach(groupSportsman -> {
//                    groupSportsman.getLaps().forEach(lap -> {
//
//                    });
//                });
//            });
//        });
        return bestLapReportTables;
    }
}
