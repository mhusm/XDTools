Installation
-------------
1. Install Node.js
2. Install rainbow-dns by typing "npm install -g rainbow-dns" in the console
3. Look up the IP of your default DNS server: type "ipconfig /all" into the console
4. Set up Window to use the rainbow-dns DNS server:
    4.1. Control Panel
    4.2. Network and Sharing Center
    4.3. Change adapter settings
    4.4. Right click -> Properties
    4.5. Select Internet Protocol Version 4 -> Properties
    4.6. Choose option "Use the following DNS server addresses"
    4.7. Add 127.0.0.1 as primary DNS server and your default DNS server as alternate DNS server
5. Modify the following lines in the api.js file of the rainbow-dns folder:
    Line 13, 24, 35: append .header("Access-Control-Allow-Origin", "*") to the end of the line
    Line 41: Add the following at the beginning of the function:
                 var serverConfig = {cors:  true};
             Add serverConfig as the last argument of the "new Hapi.Server" call


Starting the application
-----------------------
1. Start rainbow-dns by typing "rainbow-dns --fwdhost [enter IP of your default DNS server] --domain xdtest.com" in the console
2. Type "node server.js" in the main folder of the application
3. Open "http://[hostname]" in Google Chrome. If you want to connect other devices, use a hostname that is reachable by those devices (do not use 127.0.0.1 or localhost)
4. Insert "<script src='http://hostname/js/remote.js'></script>" in the beginning of the head tag of all pages that you want to test


Using the application
----------------------
- To connect remote devices, click the QR code button on the top right of the page and scan the QR code with all remote devices that you want to connect.
- Events can only be recorded on emulated device. After recording an event sequence on an emulated device, you can save it and select it in the timeline of a remote device.
- Devices can be dragged and dropped at desired locations.
- The event sequences in the timeline can be dragged and dropped to configure timing
- The "1s" button can be dragged and dropped between two elements in the event sequence to add a 1 second pause between the elements
- Breakpoints can be added by clicking in the area on the left of the timeline
- Breakpoints can be removed by dragging them and then dropping them into the trash button
- Debugging functions: To debug a function in your application, open the Chrome developer tools and add the function to the list of debugging functions. If the function is called, execution will be paused and the function can be debugged in the developer tools.
- Inspecting HTML: To inspect the HTML of an emulated device, click its "Inspect HTML" button with open developer tools, the body of the iframe will then be opened in the developer tools.
- Debugging functions/inspecting HTML will only work if the developer tools are opened AFTER creating emulated devices/after the URL of an emulated device has changed.
- If you use any port other from 80, line 16 in devtools.js in the Chrome Extension must be adjusted.