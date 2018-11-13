using Umbraco.Core;
using Umbraco.Web.Routing;

namespace Tranquility.ContentFinder
{
    public class OldArticleFinder : IContentFinder
    {
        public bool TryFindContent(PublishedContentRequest contentRequest)
        {
            var path = contentRequest.Uri.GetAbsolutePathDecoded();
            path = path.Replace("/article", "");
            var contentCache = contentRequest.RoutingContext.UmbracoContext.ContentCache;
            var content = contentCache.GetByRoute(path);
            if (content == null)
            {
                return false;
            }
            else
            {
                contentRequest.PublishedContent = content;
                return true;
            };
        }
    }
}