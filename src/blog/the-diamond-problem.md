---
title: "The Diamond Problem"
description: "An interesting problem that can arise in the use of multiple inheritance."
date: 2014-01-24T11:42:08
topic: Interesting
tags: []
---

Today I was refreshing my knowledge on classes – specifically Abstract Classes and Interfaces. One of the best descriptions of an interface I have read is when it is described as a “contract for classes”, whereby the subclass implementing the interface **must** implement **all** classes given in the interface.

Contrast to this is an abstract class, where only abstract methods in the abstract class are required. As an abstract class is extended, only one abstract class can be extended by a concrete class – multiple interfaces can, however be implemented. Similarly to an interface, neither can be instantiated and are used to create reuse of code.

I digress, the actual thing that I learnt from this was the **diamond problem**. This problem arises from ambiguity in inheritance of classes and occurs when classes B and C extend A. Then another class D inherits from B and C creating this diamond like effect.

<p><img style="margin: 0 auto; display: block;" src="/old/DiamondProblem.svg" alt="" width="200px"></p>

The problem that occurs from this multiple inheritance bonanza, is what happens to our functions in D that have not been overridden? Languages appear to deal with it in different ways, and you can read all about it in [this Wiki article.](https://en.wikipedia.org/wiki/Diamond_problem#The_diamond_problem)
