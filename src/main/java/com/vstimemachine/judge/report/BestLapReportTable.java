package com.vstimemachine.judge.report;

import com.vstimemachine.judge.model.Sportsman;
import lombok.Data;

@Data
public class BestLapReportTable implements ReportTable {
    public BestLapReportTable() {
    }

    public BestLapReportTable(Sportsman sportsman, Long timeLap) {
        this.sportsman = sportsman;
        this.timeLap = timeLap;
    }

    public BestLapReportTable(Integer position, Sportsman sportsman, Long timeLap, Long gap) {
        this.position = position;
        this.sportsman = sportsman;
        this.timeLap = timeLap;
        this.gap = gap;
    }

    private Integer position;
    private Sportsman sportsman;
    private Long timeLap;
    private Long gap;
}
