package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.race.Race;
import com.vstimemachine.judge.race.RaceException;
import com.vstimemachine.judge.race.RaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;

@RestController()
@RequestMapping(value = "/api/race")
@RequiredArgsConstructor
public class RaceController {

    private final Race raceService;

    @RequestMapping("/status")
    public ResponseEntity<ResponseMessage> status() {
        return new ResponseEntity<>(new ResponseMessage("status", raceService.status().toString()), HttpStatus.OK);
    }

    @RequestMapping("/start")
    public ResponseEntity<ResponseMessage> start() {
        try {
            raceService.start();
            return new ResponseEntity<>(new ResponseMessage("status", raceService.status().toString()), HttpStatus.OK);
        } catch (RaceException e) {
            return new ResponseEntity<>(new ResponseMessage("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping("/stop")
    public ResponseEntity<ResponseMessage> stop() {
        try {
            raceService.stop();
        } catch (RaceException e) {

        }
        return new ResponseEntity<>(new ResponseMessage("status", raceService.status().toString()), HttpStatus.OK);
    }
}
