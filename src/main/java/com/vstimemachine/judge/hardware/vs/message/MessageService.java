package com.vstimemachine.judge.hardware.vs.message;

import com.vstimemachine.judge.hardware.vs.HardwareUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Service
@Slf4j
public class MessageService {


    @Autowired
    private SimpMessagingTemplate websocket;


    public void parseMessage(String message) {
        if (message == null || message.length() < 3 || message.indexOf(":") < 0 || message.indexOf(",") < 0) return;
        //log.info("#### VS API message: {}",message);
        this.websocket.convertAndSend(MESSAGE_PREFIX + "/vsConsoleLog", message);
        String[] arrMessage = message.split(":");

        if (arrMessage.length > 1) {
            String[] arrDataMessage = arrMessage[1].split(",");
            if (String.valueOf(HardwareUtils.crc8(message.substring(0, message.lastIndexOf(",")).getBytes()))
                    .equals(arrDataMessage[arrDataMessage.length - 1].trim())) {
                if (arrMessage[0].equals("lap")) {
                    new LapMessage(arrDataMessage).parse();
                } else if (arrMessage[0].equals("ping")) {
                    new PingMessage(arrDataMessage).parse();
                }

            }
        }
    }
}
