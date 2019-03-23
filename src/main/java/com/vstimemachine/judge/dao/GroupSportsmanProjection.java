package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.model.GroupSportsman;
import com.vstimemachine.judge.model.Lap;
import com.vstimemachine.judge.model.Sportsman;
import org.springframework.data.rest.core.config.Projection;

import java.util.Set;

@Projection(name = "groupSportsman" , types = GroupSportsman.class)
public interface GroupSportsmanProjection {

    Long getId();
    Integer getSort();
    Integer getPosition();
    Boolean getSearchTransponder();
    Sportsman getSportsman();
    Group getGroup();
    Set<Lap> getLaps();
}
