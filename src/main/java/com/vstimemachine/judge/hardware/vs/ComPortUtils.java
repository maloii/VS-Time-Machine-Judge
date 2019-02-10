package com.vstimemachine.judge.hardware.vs;

import jssc.*;
import lombok.extern.slf4j.Slf4j;

import java.util.regex.Pattern;

@Slf4j
public class ComPortUtils {


    public static String[] lastComPorts = new String[]{};

    public static String[] readComPorts() {
        Pattern pattern = Pattern.compile("");
        if (SerialNativeInterface.getOsType() == SerialNativeInterface.OS_MAC_OS_X) {
            pattern = Pattern.compile("tty.*USB*");
        }
        return SerialPortList.getPortNames(pattern);
    }
}
