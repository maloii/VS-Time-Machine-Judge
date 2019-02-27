package com.vstimemachine.judge.race.speech;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechService {

    private final MessageSource messageSource;
    private MessageSourceAccessor accessor;

    public static final String FOCUS_ON_START = "focus-on-start";
    public static final String RACE_IS_OVER = "race-is-over";


    @PostConstruct
    private void init() {
        accessor = new MessageSourceAccessor(messageSource, Locale.ENGLISH);
    }

    public void say(String text){
        String focusOnStart  = accessor.getMessage(text, new Locale("ru"));
        try {
            Runtime.getRuntime().exec(String.format("say %s", focusOnStart));
            log.info("Speech:{}", focusOnStart);
        } catch (IOException e) {
            log.error("Error speech:{} {}", focusOnStart, e.getMessage());
        }
    }
}
