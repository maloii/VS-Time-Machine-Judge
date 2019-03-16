package com.vstimemachine.judge.report;

import com.vstimemachine.judge.model.Sportsman;
import lombok.Data;

@Data
public class CountLapReport implements ReportDataInterface {

    public CountLapReport() {
    }

    public CountLapReport(Sportsman sportsman, Integer count) {
        this.sportsman = sportsman;
        this.count = count;
    }

    public CountLapReport(Integer position, Sportsman sportsman, Integer count, Integer gap, Integer rel) {
        this.position = position;
        this.sportsman = sportsman;
        this.count = count;
        this.gap = gap;
        this.rel = rel;
    }


    private Integer position;
    private Sportsman sportsman;
    private Integer count;
    private Integer gap;
    private Integer rel;
}
