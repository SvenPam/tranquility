using System;
using System.Linq;
using Tranquility.Models.Content;
using Tranquility.Service;
using Umbraco.Core;
using Umbraco.Core.Events;
using Umbraco.Core.Services;
using Umbraco.Web;

namespace Tranquility.EventHandlers
{
    public class SavingEvent : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            ContentService.Saving += ContentServicePublished;
        }

        void ContentServicePublished(IContentService contentService, SaveEventArgs<Umbraco.Core.Models.IContent> e)
        {
            try
            {
                var content = e.SavedEntities.FirstOrDefault();
                var umbracoHelper = new UmbracoHelper(UmbracoContext.Current);
                var publishedDoc = umbracoHelper.TypedContent(content.Id) as IPage;
                var coverImageService = new CoverImageService();
                var coverImageUrl = coverImageService.GetCoverImage(publishedDoc);
                content.SetValue("coverImageURL", coverImageUrl);
            }
            catch (Exception ex)
            {
                Umbraco.Core.Logging.LogHelper.Error(this.GetType(), "Failed to set cover image", ex);
            }
        }
    }
}