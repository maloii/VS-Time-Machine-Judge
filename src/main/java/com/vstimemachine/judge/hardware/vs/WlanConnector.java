package com.vstimemachine.judge.hardware.vs;

import com.vstimemachine.judge.hardware.ConnectHardwareException;
import com.vstimemachine.judge.hardware.Connector;
import lombok.extern.slf4j.Slf4j;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Map;

@Slf4j
public class WlanConnector extends Connector {


    private Thread UDPBroadcastThread;
    private boolean isRunning = false;


    private String subnet;
    private String potrReceive;
    private String potrSend;

    @Override
    public boolean connection(Map<String, String> params) throws ConnectHardwareException {
        try {
            subnet = params.get("subnet");
            potrReceive = params.get("potr_receive");
            potrSend = params.get("potr_send");

            disconnect();
            UDPBroadcastThread = new Thread(new Runnable() {
                public void run() {
                    try {
                        InetAddress broadcastIP = InetAddress.getByName(subnet + ".255");
                        log.info("WLAN is connected. subnet:{} potr receive:{} potr send:{}", subnet, potrReceive, potrSend);
                        while (isRunning) {
                            try {
                                listenAndWaitAndThrowIntent(broadcastIP, Integer.parseInt(potrReceive));
                            } catch (Exception e) {
                                log.error(e.getMessage());
                            }
                        }
                    } catch (Exception e) {
                        System.out.println("no longer listening for UDP broadcasts cause of error " + e.getMessage());
                    }
                }
            });
            isRunning = true;
            UDPBroadcastThread.start();
        } catch (Exception e) {
            String error = String.format("Could not create connection to WLAN: %s", e.toString());
            log.error(error);
            throw new ConnectHardwareException(error);
        }
        return true;
    }


    @Override
    public boolean disconnect() throws ConnectHardwareException {
        isRunning = false;
        return true;
    }

    @Override
    public void send(String message) throws ConnectHardwareException {
        try {
            DatagramSocket ds = new DatagramSocket();
            InetAddress serverAddr = InetAddress.getByName(subnet + ".255");
            DatagramPacket dp;
            dp = new DatagramPacket(message.getBytes(), message.length(), serverAddr, Integer.parseInt(potrSend));
            ds.setBroadcast(true);
            ds.send(dp);
        } catch (Exception e) {
        }
    }

    private void listenAndWaitAndThrowIntent(InetAddress broadcastIP, Integer port) throws Exception {
        byte[] recvBuf = new byte[15000];
        DatagramSocket socket = null;
        try {
            socket = new DatagramSocket(port, broadcastIP);
            socket.setBroadcast(true);

            DatagramPacket packet = new DatagramPacket(recvBuf, recvBuf.length);
            socket.receive(packet);
            String message = new String(packet.getData()).trim();
            messageService.parseMessage(message);
        } finally {
            if (socket != null || !socket.isClosed()) {
                socket.close();
            }
        }

    }
}
