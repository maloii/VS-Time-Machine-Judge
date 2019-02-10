package com.vstimemachine.judge.component;

import com.vstimemachine.judge.dao.JudgeRepository;
import com.vstimemachine.judge.model.Judge;
import com.vstimemachine.judge.model.Pilot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RepositoryEventHandler(Pilot.class)
public class SpringDataRestEventHandler {

    private final JudgeRepository judgeRepository;

    @Autowired
    public SpringDataRestEventHandler(JudgeRepository judgeRepository) {
        this.judgeRepository = judgeRepository;
    }

    @HandleBeforeCreate
    @HandleBeforeSave
    public void applyUserInformationUsingSecurityContext(Pilot pilot) {

        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        Judge judge = this.judgeRepository.findByName(name);
        if (judge == null) {
            Judge newJudge = new Judge();
            newJudge.setName(name);
            newJudge.setRoles(new String[]{"ROLE_MANAGER"});
            judge = this.judgeRepository.save(newJudge);
        }
        pilot.setJudge(judge);
    }
}
