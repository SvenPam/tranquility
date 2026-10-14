---
title: "String to Enum - .NET 4.0+"
description: "Get an Enum value from a string - the easy way."
date: 2014-06-26T15:09:06
topic: Guide
tags: []
---

## Context

Recently I have been doing some work with enums - a data type that I rarely have need to use. One such task has been to convert an enum to string and vice-versa through query strings and a controller.

Intellisense in VS 2013 shows to very useful method - one I have used with Integers before was [TryParse](http://msdn.microsoft.com/en-us/library/dd783499\(v=vs.110\).aspx). if you Google for help on string conversion, you are likely to come across outdated .NET 3.0 solutions -- as it turns out TryParse is new to .NET 4.0.

## Solution

Here is a dead easy solution, which uses TryParse as mentioned above.

    public class MyClass  
    {

        public enum SortOptions  
        {

            Name = 1,  
            NameDesc = 2,  
            Price = 3,  
            PriceDesc = 4  
        }

        private SortOptions SortProperty { get; set; }

        public MyClass(string sortOption)  
        {  
            SortOptions sortEnum;  
            //Try to parse string, failure means default to ProductOptions.Name.            
            if (!Enum.TryParse(sortOption, out sortEnum))  
            {

                sortEnum = SortOptions.Name;  
            }

            this.SortProperty = sortEnum;  
        }  
    }

This makes life much simpler, removes the need for exception handling, and is very clean to look at.
