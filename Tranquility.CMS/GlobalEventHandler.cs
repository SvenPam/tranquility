using Umbraco.Core;

namespace Tranquility
{
    public class GlobalEventHandler : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            DependencyRegistrar.Register(applicationContext);
        }
    }
}