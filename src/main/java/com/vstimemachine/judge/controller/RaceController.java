package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.race.RaceException;
import com.vstimemachine.judge.race.RaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping(value = "/api/race")
@RequiredArgsConstructor
public class RaceController {

    private final RaceService raceService;
    private final GroupRepository groupRepository;

    @RequestMapping("/status")
    public ResponseEntity<ResponseMessage> status() {
        return new ResponseEntity<>(new ResponseMessage("status", raceService.status().toString()), HttpStatus.OK);
    }

    @RequestMapping(value = "/start", method = RequestMethod.POST)
    public ResponseEntity<ResponseMessage> start(@RequestBody Group group) {
        try {
            groupRepository.findById(group.getId()).ifPresent(raceService::start);
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