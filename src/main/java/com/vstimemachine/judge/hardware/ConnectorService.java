package com.vstimemachine.judge.hardware;

import com.vstimemachine.judge.hardware.vs.ComPortConnector;
import com.vstimemachine.judge.hardware.vs.ComPortUtils;
import com.vstimemachine.judge.hardware.vs.WlanConnector;
import com.vstimemachine.judge.hardware.vs.message.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
@Slf4j
public class ConnectorService {


    public final static String STATUS_CONNECT = "STATUS_CONNECT";
    public final static String STATUS_DISCONNECT = "STATUS_DISCONNECT";

    private Boolean isConnect = false;

    private Connector connector;

    private TypeConnect type;

    @Autowired
    private SimpMessagingTemplate websocket;

    @Autowired
    private MessageService messageService;

    public boolean connect(TypeConnect type, Map<String, String> body) throws ConnectHardwareException {
        if (connector == null) {
            switch (type) {
                case WLAN:
                    connector = new WlanConnector();
                    break;
                case COM_PORT:
                    connector = new ComPortConnector();
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


    public boolean disconnect() throws ConnectHardwareException {
        if (connector.disconnect()) {
            connector = null;
            isConnect = false;
            type = null;
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/vsConnectStatus", STATUS_DISCONNECT);
            return true;
        }
        return false;
    }


    @Scheduled(fixedRate = 1000)
    private void reportCurrentTime() {
        if (connector != null) {
            connector.scheduler();
        }

        String[] listComPorts = ComPortUtils.readComPorts();
        if (!Arrays.equals(ComPortUtils.lastComPorts, listComPorts)) {
            ComPortUtils.lastComPorts = listComPorts;
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/updateListComPorts", "");
            log.info("There have been changes on the com port. [{}]", String.join(",", listComPorts));
        }
    }

    public Boolean getStatusConnect() {
        return isConnect;
    }


    public String getStatusConnectMessage() {
        return isConnect?STATUS_CONNECT:STATUS_DISCONNECT;
    }
}
