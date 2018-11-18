using System.Linq;
using System.Threading.Tasks;
using Tranquility.Models.Content;
using Tranquility.Service;
using Umbraco.Core;
using Umbraco.Core.Events;
using Umbraco.Core.Publishing;
using Umbraco.Web;

namespace Tranquility.EventHandlers
{
    public class TweetWhenPublished : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            Umbraco.Core.Services.ContentService.Published += ContentServicePublished;
        }

        void ContentServicePublished(IPublishingStrategy sender, PublishEventArgs<Umbraco.Core.Models.IContent> e)
        {
            var tweetService = new TweetService();

            var content = e.PublishedEntities.FirstOrDefault();

            // IContent
            var id = content.Id;
            var doc = ApplicationContext.Current.Services.ContentService.GetById(id);
            if (doc.ContentType.Alias.InvariantEquals("blogarticle") && !doc.GetValue<bool>("hasBeenTweeted"))
            {
                // IPublishedContent
                var umbracoHelper = new UmbracoHelper(UmbracoContext.Current);
                var page = umbracoHelper.TypedContent(id) as BlogArticle;

                Task.Run(() => tweetService.Tweet($"{page.Description} {page.UrlWithDomain()}").GetAwaiter().GetResult());

                doc.SetValue("hasBeenTweeted", true);
                ApplicationContext.Current.Services.ContentService.Save(doc);

            }
        }
    }
}