package com.vstimemachine.judge.hardware.vs;

public class HardwareUtils {

    public static long crc8(byte[] buffer) {
        int crc = 0;

        for (byte b : buffer) {

            for (int j = 0; j < 8; j++) {
                int mix = (crc ^ b) & 0x01;
                crc >>= 1;
                if (mix == 1) crc ^= 0x8C;
                b >>= 1;
            }
            crc &= 0xFF;
        }

        return crc & 0xFF;
    }
}
