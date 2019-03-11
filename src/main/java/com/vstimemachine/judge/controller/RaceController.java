package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.dao.GroupSportsmanRepository;
import com.vstimemachine.judge.dao.RoundRepository;
import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.race.RaceException;
import com.vstimemachine.judge.race.RaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController()
@RequestMapping(value = "/api/race")
@RequiredArgsConstructor
public class RaceController {

    private final RaceService raceService;
    private final GroupRepository groupRepository;
    private final RoundRepository roundRepository;
    private final GroupSportsmanRepository groupSportsmanRepository;

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
            return new ResponseEntity<>(new ResponseMessage("status", raceService.status().toString()), HttpStatus.OK);
        } catch (RaceException e) {
            return new ResponseEntity<>(new ResponseMessage("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }


    @RequestMapping(value = "/search", method = RequestMethod.POST)
    public ResponseEntity<ResponseMessage> search(@RequestBody Group group) {
        try {
            groupRepository.findById(group.getId()).ifPresent(raceService::search);
            return new ResponseEntity<>(new ResponseMessage("status", raceService.status().toString()), HttpStatus.OK);
        } catch (RaceException e) {
            return new ResponseEntity<>(new ResponseMessage("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping("/sort_group_sportsmen")
    public ResponseEntity<ResponseMessage> sortGroupSportsmen(@RequestBody Map<String, String> body) {
        groupSportsmanRepository.findById(Long.parseLong(body.get("id"))).ifPresent(groupSportsman->{
            groupSportsman.setSort(Integer.parseInt(body.get("sort")));
            groupSportsmanRepository.save(groupSportsman);
        });

        return new ResponseEntity<>(new ResponseMessage("status", "OK"), HttpStatus.OK);
    }

    @RequestMapping(value = "/delete_group", method = RequestMethod.POST)
    public ResponseEntity<ResponseMessage> deleteGroup(@RequestBody Map<String, String> body) {
        groupRepository.deleteById(Long.parseLong(body.get("id")));

        return new ResponseEntity<>(new ResponseMessage("status", "OK"), HttpStatus.OK);
    }
    @RequestMapping(value = "/delete_round", method = RequestMethod.POST)
    @Transactional(propagation= Propagation.REQUIRES_NEW)
    public ResponseEntity<ResponseMessage> deleteRound(@RequestBody Map<String, String> body) {
        roundRepository.deleteById(Long.parseLong(body.get("id")));

        return new ResponseEntity<>(new ResponseMessage("status", "OK"), HttpStatus.OK);
    }
}
