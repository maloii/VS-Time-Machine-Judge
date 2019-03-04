package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.dao.GroupSportsmanRepository;
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

import java.util.Map;

@RestController()
@RequestMapping(value = "/api/race")
@RequiredArgsConstructor
public class RaceController {

    private final RaceService raceService;
    private final GroupRepository groupRepository;
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
        } catch (RaceException e) {

        }
        return new ResponseEntity<>(new ResponseMessage("status", raceService.status().toString()), HttpStatus.OK);
    }

    @RequestMapping("/sort_group_sportsmen")
    public ResponseEntity<ResponseMessage> sortGroupSportsmen(@RequestBody Map<String, String> body) {
        groupSportsmanRepository.findById(Long.parseLong(body.get("id"))).ifPresent(groupSportsman->{
            groupSportsman.setSort(Integer.parseInt(body.get("sort")));
            groupSportsmanRepository.save(groupSportsman);
        });

        return new ResponseEntity<>(new ResponseMessage("status", "OK"), HttpStatus.OK);
    }

    @RequestMapping("/delete_group")
    public ResponseEntity<ResponseMessage> deleteGroup(@RequestBody Map<String, String> body) {
        groupRepository.deleteById(Long.parseLong(body.get("id")));

        return new ResponseEntity<>(new ResponseMessage("status", "OK"), HttpStatus.OK);
    }
}
