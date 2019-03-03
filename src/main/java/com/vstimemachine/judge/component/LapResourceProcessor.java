package com.vstimemachine.judge.component;

import com.vstimemachine.judge.model.Lap;
import com.vstimemachine.judge.model.Sportsman;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityLinks;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;
import org.springframework.stereotype.Component;

@Component
public class LapResourceProcessor implements ResourceProcessor<Resource<Lap>> {

    @Autowired
    private EntityLinks entityLinks;

    @Override
    public Resource<Lap> process(Resource<Lap> resource) {
        Lap lap = resource.getContent();
        if (lap.getSportsman() != null) {
            resource.add(entityLinks.linkForSingleResource(Sportsman.class, lap.getSportsman().getId())
            .withRel("sportsmanSelf"));
            resource.add(entityLinks.linkForSingleResource(Sportsman.class, lap.getSportsman().getId())
                    .withRel("sportsmanId").withHref(lap.getSportsman().getId().toString()));
        }
        return resource;
    }

}
