---
title: "MVC5 Authentication"
description: "The simplicity of setting up authentication for a .NET MVC web app."
date: 2017-04-23T15:33:29
topic: Guide
tags: []
---

Recently I took on a new project to work on in my spare time, one of the features I've been playing around with has been MVC Authentication. It's possibly something you may have come across when creating a new ASP.NET in Visual Studio 2012+. Creating a new project almost has that same feeling as being the first person to step in fresh snow, and Visual Studio is like some kind of Winter Spirit helping you along the way.

> A lot of what I have learnt comes [from this tutorial](https://www.asp.net/mvc/tutorials/mvc-5/create-an-aspnet-mvc-5-app-with-facebook-and-google-oauth2-and-openid-sign-on), you should check it out!

By default the MVC5 template is set to individual authentication. That is, when created Visual Studio will create a template with models, controllers and views all set and ready for registration and login of users. Unfortunately, the downsides to such help is a lack of documentation, so it's quite hard to work out what is actually going on. Rest assured though, Visual Studio will conduct is spirity magic whenever you build.

## Custom Database

Initially, I had no idea what to do with the database. Sure, I could create an empty database - but would it not be missing vital tables and DB objects required by this omnipotent authentication library? Well apparently not!

First things first - you will need to modify the connection string to point to your data source:

<div style="background: #eee; border: 1px solid #ccc; padding: 5px 10px;">&lt;add name="DefaultConnection" connectionString="Data Source=[Domain\ServerName]; Initial Catalog=[DatabaseName];Integrated Security=True"&nbsp;providerName="System.Data.SqlClient" /&gt;</div>

This will point your app way from the local database that will have been created - which you will be able to find inside you app data folder. By running the building your app again, tables will be **automatically scripted to you database**. 

## Custom User Models

Your quite likely to want to make a few changes to the user models, you may want to let your users specify a user name (instead of defaulting to their email address), you may want their location. The former is very easy to do - just make some changes to your controller and views.

### User Name

In AccountViewModel.cs add a user name property to the RegisterViewModel class like so:

<div style="background: #eee; border: 1px solid #ccc; padding: 5px 10px;">&nbsp; public class RegisterViewModel<br> &nbsp; &nbsp; {<br> &nbsp; &nbsp; &nbsp; &nbsp; [Required]<br> &nbsp; &nbsp; &nbsp; &nbsp; [Display(Name = "User Name")]<br> &nbsp; &nbsp; &nbsp; &nbsp; public string UserName { get; set; }</div>

<div style="background: #eee; border: 1px solid #ccc; padding: 5px 10px;">&nbsp; &nbsp; &nbsp; &nbsp; ...</div>

<div style="background: #eee; border: 1px solid #ccc; padding: 5px 10px;">&nbsp; &nbsp; }</div>

Update your view with this new field, then it is just a simple matter of changing the Account Controller. 

<div style="background: #eee; border: 1px solid #ccc; padding: 5px 10px;">&nbsp; public async Task&lt;ActionResult&gt; Register(RegisterViewModel model)<br> &nbsp; &nbsp; &nbsp; &nbsp; {<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; if (ModelState.IsValid)<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; var user = new ApplicationUser() {&nbsp;<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <strong>UserName = model.UserName</strong>,&nbsp;<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Email = model.Email<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }</div>

### Additional User Attributes - Code Migration

Everything that just happened can be replicated for additional fields, however because the database does not already have the fields that might need to be added, it must be updated. Fair enough, you could update the User table in SQL _**or**_ you could make use of some of the _code first_ tools that come with Visual Studio. This means that the changes you make make to your models, can also be made to your storage side. Out of the box, this will not happen, and you will find the lovely tan yellow and red ASP server error page. But with a few crafty commands bashed into you package manager, you will be winning!

Once you have added all the attributes you need - could be things like date of birth, location etc. - run these commands in the package console:

<div style="background: #eee; border: 1px solid #ccc; padding: 5px 10px;">Enable-Migrations</div>

<div style="background: #eee; border: 1px solid #ccc; padding: 5px 10px;">Add-Migration</div>

<div style="background: #eee; border: 1px solid #ccc; padding: 5px 10px;">Update-Database</div>

Build the project, and done! The fields will now be viewable in your storage table. For a full tutorial check this [MSDN Blog post](http://msdn.microsoft.com/en-gb/data/jj591621.aspx) out.

## Customizing Authentication

I'll not go into to much depth, as I am only just playing around with it now but you should really take a look at IdentityConfig.cs. It's full of easy to adjust settings that makes customization dead easy - things like password complexity and email confirmation. I'm currently working on the email confirmation stuff, so I may write about that.
