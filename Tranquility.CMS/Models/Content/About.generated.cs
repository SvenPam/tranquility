//------------------------------------------------------------------------------
// <auto-generated>
//   This code was generated by a tool.
//
//    Umbraco.ModelsBuilder v3.0.10.102
//
//   Changes to this file will be lost if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Web;
using Umbraco.Core.Models;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Web;
using Umbraco.ModelsBuilder;
using Umbraco.ModelsBuilder.Umbraco;

namespace Tranquility.Models.Content
{
	/// <summary>About</summary>
	[PublishedContentModel("about")]
	public partial class About : PublishedContentModel, IPage
	{
#pragma warning disable 0109 // new is redundant
		public new const string ModelTypeAlias = "about";
		public new const PublishedItemType ModelItemType = PublishedItemType.Content;
#pragma warning restore 0109

		public About(IPublishedContent content)
			: base(content)
		{ }

#pragma warning disable 0109 // new is redundant
		public new static PublishedContentType GetModelContentType()
		{
			return PublishedContentType.Get(ModelItemType, ModelTypeAlias);
		}
#pragma warning restore 0109

		public static PublishedPropertyType GetModelPropertyType<TValue>(Expression<Func<About, TValue>> selector)
		{
			return PublishedContentModelUtility.GetModelPropertyType(GetModelContentType(), selector);
		}

		///<summary>
		/// altTitle: A title used on the page which overrides the name of this content.
		///</summary>
		[ImplementPropertyType("altTitle")]
		public string AltTitle
		{
			get { return Tranquility.Models.Content.Page.GetAltTitle(this); }
		}

		///<summary>
		/// Cover Image URL: Image to use for Twitter & OG.
		///</summary>
		[ImplementPropertyType("coverImageURL")]
		public string CoverImageUrl
		{
			get { return Tranquility.Models.Content.Page.GetCoverImageUrl(this); }
		}

		///<summary>
		/// Description: A short paragraph to describe the contents of this page.
		///</summary>
		[ImplementPropertyType("description")]
		public string Description
		{
			get { return Tranquility.Models.Content.Page.GetDescription(this); }
		}

		///<summary>
		/// Image: An image to define the content of this page.
		///</summary>
		[ImplementPropertyType("image")]
		public Umbraco.Web.Models.ImageCropDataSet Image
		{
			get { return Tranquility.Models.Content.Page.GetImage(this); }
		}

		///<summary>
		/// SEO: SEO information for this page.
		///</summary>
		[ImplementPropertyType("sEO")]
		public Epiphany.SeoMetadata.SeoMetadata SEO
		{
			get { return Tranquility.Models.Content.Page.GetSEO(this); }
		}

		///<summary>
		/// Subtitle
		///</summary>
		[ImplementPropertyType("subtitle")]
		public string Subtitle
		{
			get { return Tranquility.Models.Content.Page.GetSubtitle(this); }
		}

		///<summary>
		/// Theme
		///</summary>
		[ImplementPropertyType("theme")]
		public string Theme
		{
			get { return Tranquility.Models.Content.Page.GetTheme(this); }
		}
	}
}
