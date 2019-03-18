package com.vstimemachine.judge;

import com.vstimemachine.judge.controller.storage.StorageProperties;
import com.vstimemachine.judge.utils.OsUtils;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.EnableScheduling;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.net.*;
import java.util.Enumeration;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(StorageProperties.class)
public class JudgeApplication {

	static {
		try {
			if(OsUtils.isWindows()) {
				loadLibrary();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static final String APPLICATION_NAME = "VS Time Machine Judge";
	public static final String ICON_STR = "/static/images/logo_300.png";
	public static TrayIcon trayIcon;
	public static void main(String[] args) {

		SwingUtilities.invokeLater(new Runnable() {
			@Override
			public void run() {
				createGUI();
			}
		});
		ConfigurableApplicationContext ctx = new SpringApplicationBuilder(JudgeApplication.class)
				.headless(false).run(args);//SpringApplication.run(JudgeApplication.class, args);

		EventQueue.invokeLater(()-> {
			trayIcon.displayMessage(APPLICATION_NAME, "Application started!",
					TrayIcon.MessageType.INFO);
		});
	}

	private static void createGUI() {
//		JFrame frame = new JFrame(APPLICATION_NAME);
//		frame.setMinimumSize(new Dimension(300, 200));
//		frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
//		frame.pack();
//		frame.setVisible(true);

		setTrayIcon();
	}

	private static void setTrayIcon() {
		if(! SystemTray.isSupported() ) {
			return;
		}

		PopupMenu trayMenu = new PopupMenu();
		MenuItem itemOpen = new MenuItem("Open Web page judge panel");

		trayMenu.add(itemOpen);
		MenuItem itemExit = new MenuItem("Exit");
		itemExit.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				System.exit(0);
			}
		});
		trayMenu.add(itemExit);

		URL imageURL = JudgeApplication.class.getResource(ICON_STR);

		Image icon = Toolkit.getDefaultToolkit().getImage(imageURL);
		trayIcon = new TrayIcon(icon, APPLICATION_NAME, trayMenu);
		trayIcon.setImageAutoSize(true);

		SystemTray tray = SystemTray.getSystemTray();
		try {
			tray.add(trayIcon);
		} catch (AWTException e) {
			e.printStackTrace();
		}

		itemOpen.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				try {
					Desktop.getDesktop().browse(new URI("http://"+getIPV4()+":8080"));
				} catch (IOException e1) {
					e1.printStackTrace();
				} catch (URISyntaxException e1) {
					e1.printStackTrace();
				}
			}
		});
	}
	public static String getIPV4() {
		try {
			Enumeration<NetworkInterface> net = NetworkInterface.getNetworkInterfaces();
			while (net.hasMoreElements()) {
				NetworkInterface networkInterface = net.nextElement();
				Enumeration<InetAddress> add = networkInterface.getInetAddresses();
				while (add.hasMoreElements()) {
					InetAddress a = add.nextElement();
					if (!a.isLoopbackAddress()
							&& !a.getHostAddress().contains(":")) {
						return a.getHostAddress();
					}
				}
			}
		} catch (SocketException e) {
			e.printStackTrace();
		}
		return null;
	}


	public static boolean loadLibrary()
	{
		try
		{
			String libFile = System.getProperty("os.arch").equals("amd64") ? "jacob-1.19-x64.dll" : "/dll/jacob-1.19-x86.dll";
			InputStream inputStream = new ClassPathResource(libFile).getInputStream();
			File temporaryDll = File.createTempFile("jacob", ".dll");
			FileOutputStream outputStream = new FileOutputStream(temporaryDll);
			byte[] array = new byte[8192];
			for (int i = inputStream.read(array);
				 i != -1;
				 i = inputStream.read(array)) {
				outputStream.write(array, 0, i);
			}
			outputStream.close();
			temporaryDll.deleteOnExit();
			System.load(temporaryDll.getPath());
			System.setProperty(com.jacob.com.LibraryLoader.JACOB_DLL_PATH, temporaryDll.getPath());
			return true;
		}
		catch(Throwable e)
		{
			e.printStackTrace();
			return false;
		}
	}
}

