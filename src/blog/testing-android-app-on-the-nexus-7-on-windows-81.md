---
title: "Testing Android App on the Nexus 7 - On Windows 8.1"
description: "Began Testing on Android hardware, and ran across some problems."
date: 2014-02-20T12:24:46
topic: Guide
tags: []
---

I managed to acquire a Nexus 7 from my friend so that I could test Miru on an actual device. Unfortunately I came across a few problems trying to get the device recognised my my PC, then to have it recognised in the ADT.

Firstly (and embarrassingly), if your PC keeps finding and losing the device it is **not a compatibility issue**. I had originally thought that it was, because the [Android Dev help implies Windows 8.1 is not supported](https://developer.android.com/tools/extras/oem-usb.html). Take my advice... check the cable first.

After that botch, it was a matter of getting the ADT to pick up the device. You might need to install the [Nexus 7 driver](http://support.asus.com/Download.aspx?SLanguage=en&m=Nexus%207&p=28&s=2) first. Next you need to turn USB debugging on. On your device go to Settings>About tablet, and tap the build number seven times.

If like for me, your ADT cannot see the device; here is a neat trick I came across. Go to Settings>Storage>Menu>USB computer connection, then check Camera (PTP). Not sure how this is a fix, but it seemed to get the physical hardware into the ADT.
