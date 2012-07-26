# Monitor the office coffee pot with nodejs 

### Todo:

* configure udev permissions on mouse input devices (/dev/input/event?) so node process has read permissions
* Detect mouse(s) and associate with sensors, possibly with a config file
* Serve the pots status via a http server
* Tweet coffee done
* Control X10 devices to indicate coffee done and age
* detect pot brew, heating and off states
* use events module such that mouse events are converted to coffee events
  such as brewing, heating, brew done, off, on and are forwared to socket.io listeners. event history should be kept even when there are not listeners and listeners receive recent coffee event history on socket.io connet


