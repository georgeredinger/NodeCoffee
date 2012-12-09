#!/bin/bash
d=`date`
twurl -d "status=$d Fresh Pot" /1/statuses/update.xml > /dev/null
echo "Tweeted"
#mpg123 bell.mp3

