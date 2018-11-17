using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Umbraco.Core.Models;
using Umbraco.Web;
using Umbraco.Web.Models;
using Umbraco.Web.Mvc;
using X.Web.Sitemap;

namespace Tranquility.Controllers
{
    public class SitemapController : RenderMvcController
    {
        private readonly ITypedPublishedContentQuery typedPublishedContentQuery;

        public SitemapController(ITypedPublishedContentQuery typedPublishedContentQuery)
        {
            this.typedPublishedContentQuery = typedPublishedContentQuery;
        }

        //[OutputCache(Duration = 3600)]
        public ActionResult Sitemap(RenderModel model)
        {
            if (Request.Url.AbsolutePath.EndsWith(".xml"))
            {
                var sitemap = new Sitemap();

                var root = typedPublishedContentQuery.TypedContentAtRoot().FirstOrDefault();
                var contentItems = new List<IPublishedContent>();
                contentItems.Add(root);
                foreach (var child in root.Descendants())
                {
                    contentItems.Add(child);
                    if (child.Descendants().Any())
                    {
                    }
                    contentItems = contentItems.Concat(child.Descendants()).ToList();
                }

                foreach (var content in contentItems.Where(x => x.IsVisible()))
                {
                    sitemap.Add(new Url
                    {
                        ChangeFrequency = ChangeFrequency.Daily,
                        Location = content.UrlAbsolute(),
                        Priority = 0.5,
                        TimeStamp = content.CreateDate
                    });
                }
                return this.Content(sitemap.ToXml(), "text/xml");
            }
            else
            {
                return this.CurrentTemplate(model);
            }
        }
    }
}