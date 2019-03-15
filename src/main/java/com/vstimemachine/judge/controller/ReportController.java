package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.report.BestLapReportTable;
import com.vstimemachine.judge.report.ReportService;
import com.vstimemachine.judge.report.ReportTable;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController()
@RequestMapping(value = "/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @RequestMapping("/report")
    public List<BestLapReportTable> report(@RequestParam("id") Long id) {

        return reportService.report(id);
    }
}
