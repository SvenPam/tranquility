---
title: "Google Maps API Authorization Error - Getting Round It"
description: "Stuck with Google Maps on Android? Look no further, here is a guide on how to win the war against the ARM EABI v7a System Image and Google API’s!"
date: 2013-12-12T20:24:09
topic: Guide
tags: []
---

Okay, so this took me forever to figure out – not helping is the fact I am a total newb when it comes to Android development… I don’t even have an Android phone!

So before I begin with this guide let me lay down some scope: it should be able to get Google Maps working in the GenyMotion emulator – I gave up using the ADT emulators as they were far too slow. For this guide, I am going to use the Google Map API demo, they have code that works and this is all about the setup. Furthermore, I have done this in Windows 8, so if you have another OS, you’ll have to do some smart thinkin’. You’re going to need a google account too, if you haven’t already got one. Without further ado, let us step boldly into the unknowns of Android cartography – ironic eh?

<div class="dvNumber">1.</div>

<div class="item">
<p>Android SDK, I am going to assume you have this on your machine and have done some vagaries of android development. If you don’t, fear not! Here is the <a href="https://developer.android.com/sdk/index.html">whole package</a>, it has Eclipse too.</p>
</div>

<div class="dvNumber">2.</div>

<div class="item">
<p>Next up, we’re going to want to get the GooglePlay API setup. It comes part and parcel with the Android SDK, the only thing you need to do is install its package. Google have a <a href="https://developer.android.com/google/play-services/setup.html">guide</a> if you get stuck, but the gist is:</p>
<ol>
<li>
<p>In Eclipse, Window&gt;Android SDK Manager</p>
</li>
<li>
<p>You’re going to want to check Android #.# (API #)&gt; SDK Platform, ARM EABI v7a System Image and Google API’s. That is three packages in the version you want to use – the demo is for Android 4.4 (API 19).</p>
</li>
<li>
<p>You also need to check Extras &gt; Google Play Services and Google Repository.</p>
</li>
</ol>
</div>

<div class="dvNumber">3.</div>

<div class="item">
<p>Taming the beast that is an API Key is next on our to-do list, and we’re going to use CMD to do it. Open command prompt: Windows Key + R&gt;"cmd"&gt;Hit enter.</p>
<ol>
<li>
<p>You’re going to want to navigate to where your JDK has been installed eg. In CMD type: “cd “<span class="code">C:\Program Files\Java\jdk1.7.0_45\bin</span>" “ then press enter.</p>
</li>
<li>
<p>Here we will use the Java keytool.exe to extract our API key. To do this, you will need to know where your debug.keystore file is. You will most likely find this here: %userprofile%\.android\debug.keystore</p>
</li>
<li>
<p>When you know that enter this into CMD: “<span class="code">keytool -v -list -alias androiddebugkey –keystore "%userprofile%\.android\debug.keystore" -storepass android -keypass android</span>"</p>
</li>
<li>
<p>You’re looking to get a load of info back, specifically the certificate finger print, SHA1. When you find that, you will need to copy it.</p>
</li>
<li>
<p>Next you need to go to the <a href="https://cloud.google.com/console">Google API Console</a>.</p>
</li>
<li>
<p>Create a new project, call it whatever you like.</p>
</li>
<li>
<p>Register your app, choose Android as the platform, then enter its package name. For this demo it will be “com.example.mapdemo", then paste in the SHA1 key you copied earlier.</p>
</li>
<li>
<p>This will return you an API key. Take a note of this.</p>
</li>
</ol>
<p>If you have any problems with this step, you can get the google guide <a href="https://developers.google.com/maps/documentation/android/start#obtain_a_google_maps_api_key">here</a>.</p>
</div>

<div class="dvNumber">4.</div>

<div class="item">
<p>Before we go any further let’s get the map demo source. You can find it in the ADT package: \sdk\extras\google\google_play_services\samples\maps</p>
</div>

<div class="dvNumber">5.</div>

<div class="item">
<p>We’re going to want to modify the manifest of the map demo with our API key. Around line 33 in the Manifest of the demo you will find meta-tag with a value. Replace that value with your key – you can’t use the key that is already there.</p>
</div>

<div class="dvNumber">6.</div>

<div class="item">
<p>Here is where Google support stops, and you find that stuff isn’t quite working still? Alas, I have done the research and googling for you! Firstly, you need to hit up the <a href="https://cloud.google.com/console">Google API Console</a> again, and you’re going to want to turn on the “Google Maps Android API v2".</p>
</div>

<div class="dvNumber">7.</div>

<div class="item">
<p>Next, you will need double check that your project.propeties has the following line (it should): <span class="code">android.library.reference.1=google-play-services_lib</span></p>
</div>

<div class="dvNumber">8.</div>

<div class="item">
<p>Next, a setting in proguard-project.txt needs to be appended:</p>
<span class="code">-keep class * extends java.util.ListResourceBundle {</span> <br> <span class="code">protected Object[][] getContents();</span> <br> <span class="code">}</span>
<p>Stackoverflow user <a href="http://stackoverflow.com/users/422654/rusfearuth">Rusfearuth</a> explains this point (with pics) for this <a href="http://stackoverflow.com/questions/13696620/google-maps-android-api-v2-authorization-failure">question</a>.</p>
</div>

<div class="dvNumber">9.</div>

<div class="item">
<p>Finally, we need to fix up your emulator. Like I said earlier, I used GenyMotion, you can download it free (for personal use) when you <a>register</a>. They have an easy to follow guide, which will walk you through all the steps for setup and use <a href="https://cloud.genymotion.com/page/doc/">here</a>.</p>
</div>

<div class="dvNumber">10.</div>

<div class="item">
<p>For the Maps API to work with GenyMotion you need to add/install two files.</p>
<ol>
<li>
<p>Open a GenyMotion Emulator.</p>
</li>
<li>
<p>Download <a href="https://goo.gl/JBQmPa">ARM Translation Installer v.1.1</a>.</p>
</li>
<li>
<p>Download <a href="http://goo.im/gapps/gapps-jb-20130813-signed.zip">Google Apps for Android 4.3.</a></p>
</li>
<li>
<p>Drag and drop each file onto the Emulator, when it asks you about flash click Ok, after it finishes reboot. Then rinse repeat for the 2nd file. Stackoverflow user <a href="http://stackoverflow.com/users/1760502/japzone">japzone</a> answers this <a href="http://stackoverflow.com/questions/17831990/how-do-you-install-google-frameworks-play-accounts-etc-on-a-genymotion-virtu">question</a> with detailed steps for this.</p>
</li>
<li>
<p>Download <a href="https://goo.gl/JBQmPa">ARM Translation Installer v.1.1</a>.</p>
</li>
</ol>
</div>

<div class="dvNumber">11.</div>

<div class="item">
<p>To test that Google Play is working, run the emulator, find it in the installed apps, and search for any android app – like SnapChat, if it works, you’re spot on.</p>
</div>

Once all these steps have been completed it should work, if it dosen’t it could be because you need to uninstall your app to clear out the cache. As far as I am aware, this won't work in the ADT Emulator, at least there is another step involved somewhere.
