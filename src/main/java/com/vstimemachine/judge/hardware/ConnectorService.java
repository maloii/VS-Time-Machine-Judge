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

    private Boolean isConnect = false;

    private Connector connector;

    @Autowired
    private SimpMessagingTemplate websocket;

    @Autowired
    private MessageService messageService;

    public boolean connect(TypeConnect type,  Map<String, String> body) throws ConnectHardwareException {
        switch (type){
            case WLAN:
                connector = new WlanConnector();
                break;
            case COM_PORT:
                connector = new ComPortConnector();
                break;
        }
        if(connector != null) {
            connector.setMessageService(messageService);
            connector.setWebsocket(websocket);
            if (connector.connection(body)) {
                isConnect = true;
                return true;
            }
        }
        return false;
    }


    public boolean disconnect() throws ConnectHardwareException{
        if(connector.disconnect()){
            isConnect = false;
            return true;
        }
        return false;
    }


    @Scheduled(fixedRate = 1000)
    private void reportCurrentTime() {
        if(connector != null) {
            connector.scheduler();
        }

        String[] listComPorts =  ComPortUtils.readComPorts();
        if(!Arrays.equals(ComPortUtils.lastComPorts, listComPorts)){
            ComPortUtils.lastComPorts = listComPorts;
            this.websocket.convertAndSend(MESSAGE_PREFIX + "/updateListComPorts", "");
            log.info("There have been changes on the com port. [{}]", String.join(",", listComPorts));
        }
    }

    public Boolean getStatusConnect() {
        return isConnect;
    }
}
