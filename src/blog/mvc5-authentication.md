---
title: "MVC5 Authentication"
description: "The simplicity of setting up authentication for a .NET MVC web app."
date: 2017-04-23T15:33:29
topic: Guide
tags: []
---

Recently I took on a new project to work on in my spare time, one of the features I've been playing around with has been MVC Authentication. It's possibly something you may have come across when creating a new ASP.NET project in Visual Studio 2012+. Creating a new project almost has that same feeling as being the first person to step in fresh snow, and Visual Studio is like some kind of Winter Spirit helping you along the way.

> A lot of what I have learnt comes [from this tutorial](https://www.asp.net/mvc/tutorials/mvc-5/create-an-aspnet-mvc-5-app-with-facebook-and-google-oauth2-and-openid-sign-on), you should check it out!

By default the MVC5 template is set to individual authentication. That is, when created Visual Studio will create a template with models, controllers and views all set and ready for registration and login of users. Unfortunately, the downsides to such help are a lack of documentation, so it's quite hard to work out what is actually going on. Rest assured though, Visual Studio will conduct its spirity magic whenever you build.

## Custom Database

Initially, I had no idea what to do with the database. Sure, I could create an empty database - but would it not be missing vital tables and DB objects required by this omnipotent authentication library? Well apparently not!

First things first - you will need to modify the connection string to point to your data source:

```xml
<add name="DefaultConnection" connectionString="Data Source=[Domain\ServerName]; Initial Catalog=[DatabaseName];Integrated Security=True" providerName="System.Data.SqlClient" />
```

This will point your app away from the local database that will have been created - which you will be able to find inside your app data folder. By running and building your app again, tables will be **automatically scripted to your database**. 

## Custom User Models

You're quite likely to want to make a few changes to the user models, you may want to let your users specify a user name (instead of defaulting to their email address), you may want their location. The former is very easy to do - just make some changes to your controller and views.

### User Name

In `AccountViewModel.cs` add a user name property to the `RegisterViewModel` class like so:

```csharp
public class RegisterViewModel
{
    [Required]
    [Display(Name = "User Name")]
    public string UserName { get; set; }

    ...
}
```

Update your view with this new field, then it is just a simple matter of changing the Account Controller. 

```csharp
public async Task<ActionResult> Register(RegisterViewModel model)
{
    if (ModelState.IsValid)
    {
        var user = new ApplicationUser() {
            UserName = model.UserName,
            Email = model.Email
    }
```

### Additional User Attributes - Code Migration

Everything that just happened can be replicated for additional fields, however because the database does not already have the fields that might need to be added, it must be updated. Fair enough, you could update the User table in SQL _**or**_ you could make use of some of the _code first_ tools that come with Visual Studio. This means that the changes you make to your models, can also be made to your storage side. Out of the box, this will not happen, and you will find the lovely tan yellow and red ASP server error page. But with a few crafty commands bashed into your package manager, you will be winning!

Once you have added all the attributes you need - could be things like date of birth, location etc. - run these commands in the package console:

```powershell
Enable-Migrations
Add-Migration
Update-Database
```

Build the project, and done! The fields will now be viewable in your storage table. For a full tutorial check this [MSDN Blog post](http://msdn.microsoft.com/en-gb/data/jj591621.aspx) out.

## Customising Authentication

I'll not go into too much depth, as I am only just playing around with it now but you should really take a look at `IdentityConfig.cs`. It's full of easy to adjust settings that make customisation dead easy - things like password complexity and email confirmation. I'm currently working on the email confirmation stuff, so I may write about that.
