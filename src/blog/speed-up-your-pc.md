---
title: "Speed Up Your PC"
description: "Speed Up a Slow PC - A guide for computer literate relatives and \"not so computer-y\" people."
date: 2014-05-09T22:55:36
topic: Guide
tags: []
---

Often I am tasked with solving the "can you speed my computer up?" problem. I thought I would make a guide on the simplest things to do to get the greatest gains from the least work. This guide assumes you're at least a little competent with computers, some of it will require your initiative. If you're not sure about it, don't do it. Each step will get progressively harder, so bear that in mind. I **accept no responsibility if it goes wrong,** best thing to do is make a [system restore](http://windows.microsoft.com/en-gb/windows/system-restore-faq#1TC=windows-7) and/or a [back-up](https://www.wikihow.com/Back-up-a-Computer) beforehand!

The guide also heavily relies on other people's guides, so thanks to them! I have appended letters (a) &amp; (b) at the end for reference.

## 1\. Empty Recycle Bin

Simplest thing, empty your overflowing recycle bin. If you don't know how to do this, it's best you don't continue with this guide.

## 2\.  Uninstall All That _Crap_

A heck of a lot of people buy their machines pre-built. Often, device manufacturers will jam your storage drive full of [bloatware](https://en.wikipedia.org/wiki/Software_bloat), so that right from the get go - your PC is trying to juggle junk. **Deleting** icons is **not** removing software! All too often I have seen this happen, you must manually uninstall each bit of software to get rid of it.

To do this, go to your control panel, find programs, then click "Uninstall a program".

You'll be presented with a list of all your installed programs. If you don't know what it is, you mustn't use it; with exception to Windows or Microsoft named applications and anything in (a), blitz it. It will take a while, but this is a major source of slowness.

## 3\. Scan Your PC for Malware

You have likely already run a virus scan, but did you get it all? Aside from adjusting your settings to max (deep, slow, full priority scan), I absolutely recommend [SuperAntiSpyware](http://www.superantispyware.com/). It's totally free, and the only thing you really lose in the free version is automation and real-time detection. Keep your existing anti-virus, and just run this at max settings once a month or so. It really does find stuff that anti-viruses do not.

## 4\. CC Clean

Likely there will be other system cleaners out there, but I recommend the free to use [CCCleaner](http://www.piriform.com/ccleaner/download). When you install it, be sure to uncheck the additional software it tries to install, else you're back at step 1.

Dead easy to use, simply hit "Run Cleaner". Beware, it will empty your recycle bin, it will also clean out your cookies and browser data - which means having to log back into any sites you checked "remember me" when logging in - see (b) to get round this.

Next select the "Registry" tab down the left. Hit "Scan for Selected Issues", CCCleaner will then scan your [registry](https://en.wikipedia.org/wiki/Windows_Registry) \- this is vital to your operating system, it's essentially an address book. A list will appear, your next task is to fix all the issues in the list. To do this hit "Fix selected issues" on the right hand side. **Important:** Save your registry to your desktop, if it all goes Pete Tong, you at least have a backup. _Seriously_ if your registry gets screwed, Windows will too. [This guide](http://support.microsoft.com/kb/322756), will help you out of a dive, providing you took a backup!

Once you're ready, hit "Fix All Selected issues", if you're having to read this guide, you're not going to know what each issue means I assure you.

## 5\. Disk Cleanup and Defrag

### Disk Cleanup

Disk clean, really just deletes unnecessary files from your PC. CCCleaner will have got most/all of it, but to be sure let's run disk cleaner. Simply enter "Disk Cleanup" then run that app. Check all the boxes, then click "Clean up system files". Easy squeezy!

### Defrag

If you don't have [SSD](https://en.wikipedia.org/wiki/Solid-state_drive) (and if you don't know, you probably don't) or you have Windows 8, 8.1, then doing a classic defrag of your PC could really speed things up. In your start bar simply type "Defragment" and select something along the lines of "Defragment" or "Defragment and Optimize" (Windows 8, 8.1), then run it by hitting "defragment" or "optimize".

Fragmentation is a phenomenon that occurs in file systems, it's quite [interesting to read about](https://en.wikipedia.org/wiki/Defragmentation).

## 6\. Start Up Settings

### Programs

One of the reasons for slow start-up times - loading windows etc. is to do with applications automagically starting when you log into Windows. This is like you clicking on 10 applications as fast as possible, which is why your PC will be slow. To do this, open run (Windows Key + R) then type in "msconfig" then go to the "startup" tab. Windows 8, 8.1 users will be directed to task manager so open that.

Sort the list by status (click the column heading), you will then see all applications enabled to start when you log in. Disable all of it with exception to anything in (a). This will result in a faster start-up time, and an overall faster machine because there isn't random stuff running in the background. However, the flip side to this, is some applications that were in the list, will take a little longer to start. If it causes a problem, simply go back, and enable it.

To give you an idea, here is my set up:

### Boot Settings

Whilst you have _msconfig_ open, go to the "Boot" tab then set the "Timeout" to "3". 

### Services

**Beware**, this is getting deep now. The danger is further compounded by the fact no machine will have the same services running for various reasons. It will need some common sense applied. Again if you're unsure, **stop here.**

[Services](https://en.wikipedia.org/wiki/Windows_service) are special background processes that will not show up in your task manager. A lot of them you don't need running, unless you're a developer/server admin/DBA. I am going to show you how to stop them starting up like the applications above. Go to run again (Windows Key + R), then type in "services.msc", you will then be taken to a special services manager. Sort the list by "Startup Type". This is a bit of a minefield, many of the services are vital to the smooth operation of Windows. Best thing to do is follow [this bad-ass looking guy's service](http://www.blackviper.com/) configurations for your operating system. Anything not in his list, just set to "manual".

Again, this is **deep stuff**, that may not necessarily make a big difference, apart from breaking features on your machine.

## 7\. Hardware

Really you need to know someone to help you with this if you're reading this guide. It's tough to say what your hardware should be, as that in itself is a guide. Let's give it a go, if you know someone who is _actually_ good with computers, now might be a time to drag them into helping you out. I guarantee they will be happy to help, because you have already done all the leg work!

If you want to blast one, fair enough! We need to check your spec first, press Windows Key + Pause.

### RAM

Anything less than 2/3GB is probably making a difference. I would advise getting some more. I am not going to attempt to tell you how to do this, it is _easier_ than you might think. This guide will help, but I advise you get a knowledgeable/qualified helper to order the RAM and do it for you. Once they show you, it will be _**dead easy**_ to do it again.

### Storage Drive

Ultimately before buying a new PC there is one last thing you can do, buy a Solid State Drive and put all your data (at least your OS) on that. I'm afraid you're going to have to Google around for this one, and get some help.

SSD is rapid. You could be looking at cold to ready to word process in 8-14 seconds.

## References 

### (a) Important Software/Applications

-   Your Anti-Virus
-   Any back-up/recovery software
-   Any cloud storage applications - OneDrive (SkyDrive), Google Drive, Dropbox etc.
-   Anything with AMD, NVidia, Intel or Realtek in the name.

### (b) CC Cleaner - Exclude cookies

Go to the "Options" tab along the left. Select "Cookies", then just select cookies you recognise the name of a site you have logged into, and hit the arrow pointing to the right.

Common ones will be facebook.com, outlook.com, reddit.com etc...

