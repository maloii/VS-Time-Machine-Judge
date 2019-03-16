package com.vstimemachine.judge.hardware;

import com.vstimemachine.judge.hardware.vs.ComPortConnector;
import com.vstimemachine.judge.hardware.vs.ComPortUtils;
import com.vstimemachine.judge.hardware.vs.WlanConnector;
import com.vstimemachine.judge.hardware.vs.message.MessageService;
import com.vstimemachine.judge.race.RaceService;
import com.vstimemachine.judge.race.RaceStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class ConnectorService {


    public final static String STATUS_CONNECT = "STATUS_CONNECT";
    public final static String STATUS_DISCONNECT = "STATUS_DISCONNECT";

    private Boolean isConnect = false;

    private Boolean isSyncTime = false;
    private long sendSyncTime = 0L;

    private Connector connector;

    private TypeConnect type;

    private final SimpMessagingTemplate websocket;
    private final MessageService messageService;
    private final RaceService raceService;

    public boolean connect(TypeConnect type, Map<String, String> body) throws HardwareException {
        if (connector == null) {
            switch (type) {
                case WLAN:
                    connector = new WlanConnector(this);
                    break;
                case COM_PORT:
                    connector = new ComPortConnector(this);
                    break;
            }
        }
        if (connector != null) {
            connector.setMessageService(messageService);
            connector.setWebsocket(websocket);
            if (connector.connection(body)) {
                isConnect = true;
                this.type = type;
                this.websocket.convertAndSend(MESSAGE_PREFIX + "/vsConnectStatus", STATUS_CONNECT);
                return true;
            }
        }
        return false;
    }


    public boolean disconnect() throws HardwareException {
        if (connector.disconnect()) {
            connector = null;
            isConnect = false;
            type = null;
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/vsConnectStatus", STATUS_DISCONNECT);
            return true;
        }
        return false;
    }

    public void send(String message) throws HardwareException{
        if(isConnect){
            connector.send(message);
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/vsConsoleLog", String.format("<<== %s",message));
            log.info("VS => ".concat(message));
        }
    }

    @Scheduled(fixedRate = 1000)
    public void reportCurrentTime() {
        if (connector != null) {
            connector.scheduler();
        }

        /////////////////SCAN COM PORT/////////////
        String[] listComPorts = ComPortUtils.readComPorts();
        if (!Arrays.equals(ComPortUtils.lastComPorts, listComPorts)) {
            ComPortUtils.lastComPorts = listComPorts;
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/updateListComPorts", "");
            log.info("There have been changes on the com port. [{}]", String.join(",", listComPorts));
        }

        /////////////////SYNC TIME/////////////
        if((sendSyncTime+2000L) < System.currentTimeMillis()) {
            sendSyncTime();
        }
    }
    @Before("execution(* com.vstimemachine.judge.race.RaceService.start(..))")
    public void raceStart(JoinPoint joinPoint){
        isSyncTime = true;
        sendSyncTime();
    }

    private void sendSyncTime(){
        if(isConnect && isSyncTime && !raceService.status().equals(RaceStatus.RUN)) try {
            sendSyncTime = System.currentTimeMillis();
            send(String.format("settime:%d", sendSyncTime));
        } catch (HardwareException e) {
            log.error("Failed to send [settime] command. {}", e.getMessage());
        }
    }

    public void syncTimeSuccess(){
        isSyncTime = false;
    }

    public Boolean getStatusConnect() {
        return isConnect;
    }


    public String getStatusConnectMessage() {
        return isConnect?STATUS_CONNECT:STATUS_DISCONNECT;
    }

    public TypeConnect getType() {
        return type;
    }

    public long getSendSyncTime() {
        return sendSyncTime;
    }
}
