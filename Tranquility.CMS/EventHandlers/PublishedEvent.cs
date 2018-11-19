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
                var blogArticle = umbracoHelper.TypedContent(content.Id) as BlogArticle;
                var tweetService = new TweetService();
                var hashtags = "";
                if (blogArticle.Tags != null && blogArticle.Tags.Any())
                {
                    hashtags = string.Join(" ", blogArticle.Tags.Select(x => $"#{x}"));
                }

                Task.Run(() => tweetService.Tweet($"{blogArticle.Description} {hashtags} {blogArticle.UrlWithDomain()}").GetAwaiter().GetResult());

                content.SetValue("hasBeenTweeted", true);
                ApplicationContext.Current.Services.ContentService.SaveAndPublishWithStatus(content, raiseEvents: false);
            }
        }
    }
}