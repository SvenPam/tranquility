using System;
using System.Linq;
using System.Threading.Tasks;
using Tranquility.Models.Content;
using Tranquility.Service;
using Umbraco.Core;
using Umbraco.Core.Events;
using Umbraco.Core.Publishing;
using Umbraco.Core.Services;
using Umbraco.Web;

namespace Tranquility.EventHandlers
{
    public class PublishedEvent : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            ContentService.Published += ContentServicePublished;
        }

        void ContentServicePublished(IPublishingStrategy contentService, PublishEventArgs<Umbraco.Core.Models.IContent> e)
        {
            var content = e.PublishedEntities.FirstOrDefault();
            if (content != null && content.ContentType.Alias.InvariantEquals("blogarticle") && !content.GetValue<bool>("hasBeenTweeted"))
            {
                var umbracoHelper = new UmbracoHelper(UmbracoContext.Current);
                var publishedDoc = umbracoHelper.TypedContent(content.Id) as IPage;
                var tweetService = new TweetService();
                Task.Run(() => tweetService.Tweet($"{publishedDoc.Description} {publishedDoc.UrlWithDomain()}").GetAwaiter().GetResult());

                content.SetValue("hasBeenTweeted", true);
                ApplicationContext.Current.Services.ContentService.SaveAndPublishWithStatus(content, raiseEvents: false);
            }
        }
    }
}