package com.vstimemachine.judge.hardware.vs;

import com.vstimemachine.judge.hardware.ConnectHardwareException;
import com.vstimemachine.judge.hardware.Connector;
import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;
import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.Map;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;
import static jssc.SerialPort.*;

@Slf4j
public class ComPortConnector extends Connector {

    public final static long RECONNECT_TIMEOUT = 3000L;
    private SerialPort serialPort;
    private Map<String, String> params;

    private long lastTimePackage = 0L;

    @Override
    public boolean connection(Map<String, String> params) throws ConnectHardwareException {
        this.params = params;
        try {
            disconnect();
        } catch (Exception e) {
        }
        try {
            String comPortName = params.get("port");
            serialPort = new SerialPort(comPortName);
            serialPort.openPort();
            serialPort.setParams(SerialPort.BAUDRATE_115200,
                    SerialPort.DATABITS_8,
                    SerialPort.STOPBITS_1,
                    SerialPort.PARITY_NONE, false, true);//Set params. Also you can set params by this string: serialPort.setParams(9600, 8, 1, 0,RTSEnable,DTSEnable);
            serialPort.setFlowControlMode(SerialPort.FLOWCONTROL_NONE);
            serialPort.addEventListener(new PortReader(), MASK_RXCHAR);
            log.info("Com port is connected to {}", comPortName);
            lastTimePackage = System.currentTimeMillis();
            return true;
        } catch (Exception e) {
            String error = String.format("Could not create connection to com port: %s", e.toString());
            log.info(error);
            throw new ConnectHardwareException(error);
        }
    }

    @Override
    public boolean disconnect() throws ConnectHardwareException {
        boolean result = false;
        try {
            result = serialPort.closePort();
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/disconnectComPorts", "");
        } catch (SerialPortException e) {
            String error = String.format("Could not close connection to com port: %s", e.toString());
            log.info(error);
            throw new ConnectHardwareException(error);
        }
        return result;
    }

    @Override
    public void scheduler() {
        try {
            if (serialPort.isOpened() &&
                    (lastTimePackage + RECONNECT_TIMEOUT) < System.currentTimeMillis() &&
                    Arrays.asList(ComPortUtils.readComPorts()).contains(params.get("port"))) {
                connection(params);
                log.info("Com port is restarted by timeout.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private class PortReader implements SerialPortEventListener {

        public void serialEvent(SerialPortEvent event) {
            if (event.isRXCHAR() && event.getEventValue() > 0) {
                try {
                    lastTimePackage = System.currentTimeMillis();
                    String message = serialPort.readString(event.getEventValue());
                    messageService.parseMessage(message);
                } catch (SerialPortException e) {
                    log.info("Error getting message by com port: {}", e.getMessage());
                }
            }
        }
    }

    public void send(String message) throws ConnectHardwareException {
        try {
            serialPort.writeString(message + "\r\n");
        } catch (SerialPortException e) {
            String error = String.format("Failed to send message to port com: %s", e.toString());
            log.info(error);
            throw new ConnectHardwareException(error);
        }
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        disconnect();
    }

}
