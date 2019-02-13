package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.dao.CompetitionRepository;
import com.vstimemachine.judge.dao.PilotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class IndexController {


    @Autowired
    private PilotRepository pilotRepository;

    @Autowired
    private CompetitionRepository competitionRepository;

    @RequestMapping("/")
    public String index() {
        System.out.println(SecurityContextHolder.getContext().getAuthentication().getName());
        return "index";
    }
}
