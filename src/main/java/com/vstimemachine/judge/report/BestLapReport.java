package com.vstimemachine.judge.report;

import com.vstimemachine.judge.model.Sportsman;
import lombok.Data;

@Data
public class BestLapReport {
    public BestLapReport() {
    }

    public BestLapReport(Sportsman sportsman, Long timeLap) {
        this.sportsman = sportsman;
        this.timeLap = timeLap;
    }

    public BestLapReport(Integer position, Sportsman sportsman, Long timeLap, Long gap, Long rel) {
        this.position = position;
        this.sportsman = sportsman;
        this.timeLap = timeLap;
        this.gap = gap;
        this.rel = rel;
    }

    private Integer position;
    private Sportsman sportsman;
    private Long timeLap;
    private Long gap;
    private Long rel;
}
