package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.dao.CompetitionRepository;
import com.vstimemachine.judge.dao.PilotRepository;
import com.vstimemachine.judge.dao.SportsmanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class IndexController {

    @RequestMapping("/")
    public String index() {
        System.out.println(SecurityContextHolder.getContext().getAuthentication().getName());
        return "index";
    }
}
