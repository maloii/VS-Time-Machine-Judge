package com.vstimemachine.judge.report;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.vstimemachine.judge.model.Report;
import lombok.Data;

import java.util.List;


@Data
public class ReportData<T> {

    public ReportData() {
    }

    public ReportData(Report report, List<T> data) {
        this.report = report;
        this.data = data;
    }

    private Report report;
    protected List<T> data;
}
