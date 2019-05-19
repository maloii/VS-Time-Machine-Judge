package com.vstimemachine.judge.controller;

import com.vstimemachine.judge.dao.GroupRepository;
import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.race.RaceService;
import com.vstimemachine.judge.race.RaceStatus;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Optional;

import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class RaceControllerTest {

    @Mock
    private RaceService raceService;
    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private RaceController raceController;

    @Test
    public void startTest(){
        Group group = new Group();
        group.setId(1L);
        when(groupRepository.findById(group.getId())).thenReturn(Optional.of(group));
        when(raceService.status()).thenReturn(RaceStatus.RUN);
        raceController.start(group);
        verify(raceService, times(1)).start(group);
        verify(raceService, times(1)).selectGroupForBroadcast(group);
    }
}
