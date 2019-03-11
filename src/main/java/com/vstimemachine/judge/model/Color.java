package com.vstimemachine.judge.model;

public enum Color {
    BLUE(1),
    GREEN(2),
    CYAN(3),
    RED(4),
    MAGENTA(5),
    YELLOW(6),
    WHITE(7),
    BLACK(0);

    private int vsCode;

    Color(int vsCode) {
        this.vsCode = vsCode;
    }

    public int getVsCode() {
        return vsCode;
    }
}