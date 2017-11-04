using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Core.Models;

namespace Tranquility.Helpers
{
    public class Pagination
    {
        public readonly IEnumerable<IPublishedContent> PagedList;
        public readonly IEnumerable<int> Paging;
        public readonly int CurrentPage;

        public Pagination(IEnumerable<IPublishedContent> list, int page, int size = 10)
        {
            CurrentPage = page;
            var totalItems = list.Count();
            if (page > 1)
            {
                list = list.Skip(CurrentPage * size);
            }

            PagedList = list.Take(size);

            var paging = new List<int>();
            var maxPage = Math.Ceiling(((decimal)totalItems / (decimal)size));
            for (int i = CurrentPage - 3; i < CurrentPage + 3; i++)
            {
                if (i > 0 && i < maxPage)
                {
                    paging.Add(i);
                }
            }
            Paging = paging;
        }
    }
}