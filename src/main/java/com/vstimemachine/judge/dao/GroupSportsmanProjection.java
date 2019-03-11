package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.model.GroupSportsman;
import com.vstimemachine.judge.model.Sportsman;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "groupSportsman" , types = GroupSportsman.class)
public interface GroupSportsmanProjection {

    Long getId();
    Integer getSort();
    Boolean getSearchTransponder();
    Sportsman getSportsman();
    Group getGroup();
}
