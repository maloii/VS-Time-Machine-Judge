package com.vstimemachine.judge.hardware.vs.message;

import com.vstimemachine.judge.dao.LapRepository;
import com.vstimemachine.judge.hardware.Connector;
import com.vstimemachine.judge.hardware.vs.HardwareUtils;
import com.vstimemachine.judge.race.RaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final SimpMessagingTemplate websocket;
    private final LapRepository lapRepository;
    private final RaceService raceService;

    public void parseMessage(String message, Connector connector) {
        if (message == null || message.length() < 3 || message.indexOf(":") < 0 || message.indexOf(",") < 0) return;
        this.websocket.convertAndSend(MESSAGE_PREFIX + "/vsConsoleLog", message);
        String[] arrMessage = message.split(":");

        if (arrMessage.length > 1) {
            String[] arrDataMessage = arrMessage[1].split(",");
            if (String.valueOf(HardwareUtils.crc8(message.substring(0, message.lastIndexOf(",")).getBytes()))
                    .equals(arrDataMessage[arrDataMessage.length - 1].trim())) {
                if (arrMessage[0].equals("lap")) {
                    new LapMessage(arrDataMessage, lapRepository, raceService, connector).parse();
                } else if (arrMessage[0].equals("ping")) {
                    new PingMessage(arrDataMessage).parse();
                }
                //"systime:%lld,%d,%d,%s,%d,%d,%d,%d",getRealTime(), sensitivity, gate, VERSION, frequencyIndex, capacitorCalbr, frequencyOffset1, frequencyOffset2)
                //"timesynchok:%d,%lld",gate,time)
                //"info:%lld,%d,%d,%s,%d,,,,,,",time, sensitivity, gate, VERSION,frequencyIndex)
                //"gate:%d,%d,%d,%lld", gate, colorGate, idTransponder, lapTime);
                //"echotrans:%d", idTransponder)
                //"echotrans:%d,%d", idTransponder, versionTrans)
                //"bootflashok:%d\r\n", idTransponder)
                //"bootflasherror:%d\r\n", idTransponder)
                //"infocalibrtrans:%d,%d,%d", idTransponder, rssi, calbr)
                //"ping:%lld,%d",time, idGate)
            }
        }
    }
}
