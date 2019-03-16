package com.vstimemachine.judge.race.speech;

import com.vstimemachine.judge.dao.SettingsRepository;
import com.vstimemachine.judge.model.Settings;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Locale;

import static com.vstimemachine.judge.model.TypeSettings.LANG_SPEECH;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechService {

    private final MessageSource messageSource;
    private final SettingsRepository settingsRepository;
    private MessageSourceAccessor accessor;

    public static final String FOCUS_ON_START = "focus-on-start";
    public static final String RACE_IS_OVER = "race-is-over";
    public static final String SECONDS_15 = "seconds-15";


    @PostConstruct
    private void init() {
        accessor = new MessageSourceAccessor(messageSource, Locale.ENGLISH);
    }

    public void say(String text){
        String lang = "en";
        Settings settingsLang = settingsRepository.findByTypeSettings(LANG_SPEECH);
        if(settingsLang != null){
            lang = settingsLang.getValue();
        }
        String sayText  = accessor.getMessage(text, new Locale(lang));
        try {
            Runtime.getRuntime().exec(String.format("say %s", sayText));
            log.info("Speech:{}", sayText);
        } catch (IOException e) {
            log.error("Error speech:{} {}", sayText, e.getMessage());
        }
    }
}
