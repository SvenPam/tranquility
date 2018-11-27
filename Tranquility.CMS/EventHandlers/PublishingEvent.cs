using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tranquility.Service;
using Umbraco.Core;
using Umbraco.Core.Events;
using Umbraco.Core.Publishing;
using Umbraco.Core.Services;
using Umbraco.Web;

namespace Tranquility.EventHandlers
{
    public class PublishingEvent : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            ContentService.Publishing += ContentServicePublished;
        }

        void ContentServicePublished(IPublishingStrategy contentService, PublishEventArgs<Umbraco.Core.Models.IContent> e)
        {
            var content = e.PublishedEntities.FirstOrDefault();
            if (content != null && content.ContentType.Alias.InvariantEquals("blogarticle") && !content.GetValue<bool>("hasBeenTweeted"))
            {
                var tags = content.GetValue<string>("tags");
                var tweetService = new TweetService();
                var hashtags = "";
                if (!string.IsNullOrWhiteSpace(tags))
                {
                    hashtags = string.Join(" ", tags.Split(',').Select(x => $"#{x.Replace("-", string.Empty)}"));
                }
                Task.Run(() => tweetService.Tweet($"{content.GetValue<string>("description")} {hashtags} {"https://ste-pam.com/blog/" + content.Name.ToUrlSegment()}"));

                content.SetValue("hasBeenTweeted", true);
                ApplicationContext.Current.Services.ContentService.Save(content, raiseEvents: false);
            }
        }
    }
}