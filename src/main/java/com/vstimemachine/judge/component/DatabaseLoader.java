package com.vstimemachine.judge.component;

import com.vstimemachine.judge.dao.JudgeRepository;
import com.vstimemachine.judge.dao.SettingsRepository;
import com.vstimemachine.judge.model.Judge;
import com.vstimemachine.judge.model.Settings;
import com.vstimemachine.judge.model.TypeSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import static com.vstimemachine.judge.model.TypeSettings.LANG_SPEECH;

@Component
@RequiredArgsConstructor
public class DatabaseLoader implements CommandLineRunner {

    private final JudgeRepository judgeRepository;
    private final SettingsRepository settingsRepository;


    @Override
    public void run(String... args) throws Exception {
        if(judgeRepository.findByName("admin") == null) {
            judgeRepository.save(new Judge("admin", "admin",
                    "ROLE_MAIN_JUDGE"));
        }
        if(settingsRepository.findByTypeSettings(LANG_SPEECH) == null){
            settingsRepository.save(new Settings(LANG_SPEECH, "en"));
        }

    }
}
