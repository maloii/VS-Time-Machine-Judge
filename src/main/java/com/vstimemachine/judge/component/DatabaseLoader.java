package com.vstimemachine.judge.component;

import com.vstimemachine.judge.dao.JudgeRepository;
import com.vstimemachine.judge.model.Judge;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseLoader implements CommandLineRunner {

    private final JudgeRepository judgeRepository;

    @Autowired
    public DatabaseLoader(JudgeRepository judgeRepository) {
        this.judgeRepository = judgeRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if(this.judgeRepository.findByName("admin") == null) {
            Judge demo = this.judgeRepository.save(new Judge("admin", "admin",
                    "ROLE_MAIN_JUDGE"));
        }
        /*Judge oliver = this.judgeRepository.save(new Judge("oliver", "gierke",
                "ROLE_JUDGE"));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("demo", "doesn't matter",
                        AuthorityUtils.createAuthorityList("ROLE_JUDGE")));

        this.pilotRepository.save(new Pilot("Aleksandr1", "Sorokin", "Vladimirovich", "", demo));
        this.pilotRepository.save(new Pilot("Aleksandr2", "Sorokin", "Vladimirovich", "", demo));
        this.pilotRepository.save(new Pilot("Aleksandr3", "Sorokin", "Vladimirovich", "", demo));
        this.pilotRepository.save(new Pilot("Aleksandr4", "Sorokin", "Vladimirovich", "", demo));
        this.pilotRepository.save(new Pilot("Aleksandr5", "Sorokin", "Vladimirovich", "", demo));


        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("oliver", "doesn't matter",
                        AuthorityUtils.createAuthorityList("ROLE_JUDGE")));

        this.pilotRepository.save(new Pilot("Elena1", "Gridneva", "Fltksandrovna", "", oliver));
        this.pilotRepository.save(new Pilot("Elena2", "Gridneva", "Fltksandrovna", "", oliver));
        this.pilotRepository.save(new Pilot("Elena3", "Gridneva", "Fltksandrovna", "", oliver));
        this.pilotRepository.save(new Pilot("Elena4", "Gridneva", "Fltksandrovna", "", oliver));
        this.pilotRepository.save(new Pilot("Elena5", "Gridneva", "Fltksandrovna", "", oliver));
        this.pilotRepository.save(new Pilot("Elena6", "Gridneva", "Fltksandrovna", "", oliver));
        this.pilotRepository.save(new Pilot("Elena7", "Gridneva", "Fltksandrovna", "", oliver));


        SecurityContextHolder.clearContext();
        */

    }
}
