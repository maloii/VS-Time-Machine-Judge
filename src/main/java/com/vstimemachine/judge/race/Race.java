package com.vstimemachine.judge.race;

public interface Race {

    void start() throws RaceException;

    void stop() throws RaceException;

    void search() throws RaceException;

    RaceStatus status();
}
