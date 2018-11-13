using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Tranquility.ContentFinder;
using Umbraco.Core;
using Umbraco.Web.Routing;

namespace Tranquility
{
    public class GlobalEventHandler : ApplicationEventHandler
    {

        protected override void ApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            base.ApplicationStarting(umbracoApplication, applicationContext);
            ContentFinderResolver.Current.InsertTypeBefore<ContentFinderByNotFoundHandlers, OldArticleFinder>();
        }

        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            DependencyRegistrar.Register(applicationContext);
        }
    }
}