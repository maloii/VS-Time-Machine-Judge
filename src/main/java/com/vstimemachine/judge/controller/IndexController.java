package com.vstimemachine.judge.controller;

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
