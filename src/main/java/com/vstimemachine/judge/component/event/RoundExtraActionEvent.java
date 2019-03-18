package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.model.Round;
import lombok.Value;

@Value
public class RoundExtraActionEvent {
    private Round model;
    private String path;
}
