# XDTools - Readme

## About this project
XDTools is under development at the [Globis Group at ETH Zürich](https://globis.ethz.ch). The project is coordinated by [Maria Husmann](https://globis.ethz.ch/#!/person/maria-husmann/). Most of implemenation was done by Nina Heyder.

## Installation (Windows 7)

1. Install Node.js
2. Install rainbow-dns by typing "npm install -g rainbow-dns" in the command prompt
3. Look up the IP of your default DNS server: Type "ipconfig /all" into the command prompt
4. Set up Windows to use the rainbow-dns DNS server:
  1. Open the Control Panel.
  2. Open the Network and Sharing Center.
  3. Click on "Change adapter settings"
  4. Right-click on the adapter and select "Properties"
  5. Select Internet Protocol -> Properties
  6. Choose the option "Use the following DNS server addresses"
  7. Add 127.0.0.1 as preferred DNS server and your default DNS server as alternate DNS server
5. Modify the following lines in the api.js file of rainbow-dns:
  - Line 14, 25, 37: Append '.header("Access-Control-Allow-Origin", "*")' to the end of the line
  - Line 41: Add the following at the beginning of the function: 'var serverConfig = {cors: true};' and add 'serverConfig' as the last argument to the 'new Hapi.Server' call
6. Add the Chrome extension to Google Chrome. If you want to use a port other than 80 for XDTools, adjust line 16 in "devtools.js".  

## Starting XDTools

1. Start rainbow-dns by typing "rainbow-dns --fwdhost [enter IP of your default DNS server] --domain xdtest.com" in the command prompt
2. Navigate to the main folder of the application in the command prompt and type "node server.js"
3. Open "http://[hostname of your machine]" in Google Chrome. If you want to connect real devices, use a hostname that is reachable by those devices, e.g. the IP address of your machine. Do not use "127.0.0.1" or "localhost".
4. Insert "<script src='http://[hostname of your machine]/js/remote.js'></script>" at the beginning of the head tag in all HTML pages of the application you want to test
5. Change the URL at the top of XDTools to the IP address of the application you want to test. If you use the URL instead of the IP address, rainbow-dns will not work properly.
6. Update "getConnectionURL" in remote.js to your application. 

## Using XDTools

You can change the URL of all emulated and real devices by typing a new URL in the input field at the top of XDTools. You can refresh all devices at once by clicking on the button next to the URL input field.

You can open the settings of XDTools by clicking on the button in the top-right corner of XDTools. In the settings, you can disable individual features of XDTools, delete custom devices, delete device configurations and delete event sequences.

Devices can be activated or deactivated by clicking on their name/ID in the are above the shared JavaScript console and co.

### Emulating Devices

To add an emulated device, click on the "+"-button at the top of XDTools. If you want to add a device from the list of predefined devices, type into the input field labeled "Predefined Devices". 
If you want to create a custom device, fill out all the other input fields. If you click "Save device", the device will be created and saved to the list of predefined devices. 
If you click "Add device", the device will only be created.

Once the device is created, you can open the settings menu by clicking on the "settings" button at the top of the device. In the settings menu, you can:
- Change the URL of the device
- Scale the device (scaling the device does not change the resolution of the device)
- Inspect the HTML of the device
- Refresh the device
- Set the scaling of the device to 1
- Switch the orientation of the device
- Change the layer, i.e. the z-index of the device
- Connect the device to other devices


You can click in the bottom-right corner of the application shown in the emulated device to dynamically change the resolution of the device.
You can move the device around by clicking on its header and dragging it to the desired location.

You can save a configuration of emulated devices by typing its name into the input field at the top of XDTools and then clicking the "save"-button. You can enter its name into the same input field and click the "load"-button to load the same device configuration again.

You can click the "Clear"-button in the top-right corner of XDTools to remove all emulated devices.

### Connecting Real Devices

You can click on the "QR code" button on the top XDTools and scan the QR code that is shown with a real device. You can also just open the URL "http://[hostname of your machine]/remote.html" in Google Chrome on the real device.

Once the device is connected, it is represented by a proxy in XDTools. The proxy can also be moved around and has a settings menu.

### Connection Features

At the bottom of XDTools, a session area is shown. When the first device is added or connected, auto-connect is enabled by default.
If auto-connect is enabled, all newly created or connected devices are automatically connected to that session. Only one session can have auto-connect enabled at a time.
By clicking the refresh button shown with each session, all devices in a session can be refreshed. Resetting the session resets the IDs of the connected devices.

Devices can be manually connected to another device by opening the settings menu of the device and selecting the ID of the other device from the drop-down menu.

### Shared JavaScript Console

All active devices forward their logging messages and JavaScript errors to the shared console. If a stack trace is available for an error, it can be opened by clicking on the button next to the error message in the console.
If a command is typed into the console, it is sent to all active devices and executed on them. The return value of the command is shown in the console.

On the top of the console, the messages can be filtered by type and/or by text.

### Function Debugging

If you open Chrome DevTools, the function debugging area is shown at the bottom of XDTools. You can type a function name into the input field and add the function for debugging.
If a debugged function is called on an emulated device, the execution is interrupted and the function can be debugged in Chrome DevTools. The device on which the function is called is highlighted.

In some cases, the Chrome DevTools have to be re-opened for function debugging to work. In most cases, a warning will be shown in XDTools telling you to re-open the DevTools.
However, if function debugging does not work and no warning is shown, re-opening the DevTools might still fix the problem.

### HTML Inspection

If the DevTools are open, you can go into the settings menu of an emulated device and click the "Inspect HTMl" button to jump directly into the HTML of the device.

### Shared CSS Editor

The CSS rules in the shared CSS editor are added to all active devices. You can add, modify, and delete rules.

### Record and Replay

To start recording, click the button at the top of the device in the record/replay area. To stop recording, click the button again.
For adding a breakpoint, click in the empty column next to the timeline. To add a break of one seconds between events, drag the "1s"-button to the place where the break should be inserted.
For replaying on one device, click the play button at the top of the device in the record/replay area. To replay on all devices, click on the "Replay all" button at the top of the record/replay area.
If a breakpoint is reached, the "play"-button next to the timeline will be highlighted and you can click it to continue the replay.
