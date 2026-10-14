---
title: "Class Design"
description: "Thinking design patterns."
date: 2013-11-24T17:14:20
topic: Project
tags: []
---

This week I have taken a slightly different tack on my design by thinking more towards the future of the system in regards to maintenance and improvements.

The first idea that I have been throwing around has been increasing interoperability of the system from the ground up. The concept I have would make use of the Adapter pattern as defined by the original Gang of Four. By providing the system with an adapter class, it would be possible to enable other systems to “hook-in”, and make use of some publicly visible functions. This would be especially useful if we take into consideration of systems like Sabisu Actions.

I have hit a small bump in the project, and I am struggling to come up with a suitable class diagram. It would be easy enough to build the system in one class, but I feel this would be difficult to maintain; and could easily open a can of worms. “Objectifying” parts of the systems has been my first attempt at getting some possible classes together. So far I have a conceptual idea of defining a plant system such as a tank or pipe, then defining a property for each. For example, a tank can have a content – so can a pipe – but a tank will not have a flow. Step up, Decorator Pattern:

<p><img src="/old/Class1.jpg" alt="Preliminary class diagram." title=" Preliminary class diagram." width="90%"></p>

There are certainly still some modifications to make to this, and of course the addition of more classes. I reading over some of the other classic patterns; one may be more applicable.

Watch this space!
