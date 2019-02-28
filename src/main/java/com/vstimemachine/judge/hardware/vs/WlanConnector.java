package com.vstimemachine.judge.hardware.vs;

import com.vstimemachine.judge.hardware.ConnectorService;
import com.vstimemachine.judge.hardware.HardwareException;
import com.vstimemachine.judge.hardware.Connector;
import lombok.extern.slf4j.Slf4j;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Map;

@Slf4j
public class WlanConnector extends Connector {



    private final ConnectorService connectorService;

    //private Thread UDPBroadcastThread;
    private boolean isRunning = false;


    private String subnet;
    private String potrReceive;
    private String potrSend;

    public WlanConnector(ConnectorService connectorService) {
        this.connectorService = connectorService;
    }

    @Override
    public boolean connection(Map<String, String> params) throws HardwareException {
        try {
            subnet = params.get("subnet");
            potrReceive = params.get("potr_receive");
            potrSend = params.get("potr_send");

            disconnect();
            Thread UDPBroadcastThread = new Thread(new Runnable() {
                public void run() {
                    DatagramSocket socket = null;
                    try {
                        InetAddress broadcastIP = InetAddress.getByName(subnet + ".255");
                        log.info("WLAN is connected. subnet:{} potr receive:{} potr send:{}", subnet, potrReceive, potrSend);
                        socket = new DatagramSocket(Integer.parseInt(potrReceive), broadcastIP);
                        //socket.setBroadcast(true);
                        byte[] buffer = new byte[2048];
                        DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                        while (isRunning) {
                            try {
                                socket.receive(packet);
                                String message = new String(buffer, 0, packet.getLength());
                                packet.setLength(buffer.length);
                                if(!message.isEmpty())
                                    messageService.parseMessage(message, connectorService);
                            } catch (Exception e){
                                e.printStackTrace();
                            }
                        }
                    } catch (Exception e) {
                        log.error("no longer listening for UDP broadcasts cause of error {} ", e.getMessage());
                    }finally {
                        if (socket != null || !socket.isClosed()) {
                            socket.close();
                        }
                    }
                }
            });
            isRunning = true;
            UDPBroadcastThread.start();
        } catch (Exception e) {
            String error = String.format("Could not create connection to WLAN: %s", e.toString());
            log.error(error);
            throw new HardwareException(error);
        }
        return true;
    }


    @Override
    public boolean disconnect() throws HardwareException {
        isRunning = false;
        return true;
    }

    @Override
    public void send(String message) throws HardwareException {
        try {
            message = message.concat("\n");
            DatagramSocket ds = new DatagramSocket();
            InetAddress serverAddr = InetAddress.getByName(subnet + ".255");
            DatagramPacket dp;
            dp = new DatagramPacket(message.getBytes(), message.length(), serverAddr, Integer.parseInt(potrSend));
            ds.setBroadcast(true);
            ds.send(dp);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
