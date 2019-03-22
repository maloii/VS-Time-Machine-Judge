package com.vstimemachine.judge.component;

import com.vstimemachine.judge.model.*;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.stereotype.Component;

@Component
public class SpringDataRestCustomization implements RepositoryRestConfigurer {
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {

        config.exposeIdsFor(
                Group.class,
                GroupSportsman.class,
                Round.class,
                Competition.class,
                Sportsman.class,
                Transponder.class,
                Lap.class,
                Report.class,
                Settings.class,
                Broadcast.class);
    }
}
