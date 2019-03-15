package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.report.ReportData;
import com.vstimemachine.judge.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController()
@RequestMapping(value = "/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @RequestMapping(value = "/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ReportData report(@PathVariable("id") Long id) {
        return reportService.report(id);
    }
}
