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
	// Mixin content Type 1050 with alias "page"
	/// <summary>_Page</summary>
	public partial interface IPage : IPublishedContent
	{
		/// <summary>altTitle</summary>
		string AltTitle { get; }

		/// <summary>Description</summary>
		string Description { get; }

		/// <summary>Image</summary>
		Umbraco.Web.Models.ImageCropDataSet Image { get; }

		/// <summary>SEO</summary>
		Epiphany.SeoMetadata.SeoMetadata SEO { get; }

		/// <summary>Subtitle</summary>
		string Subtitle { get; }

		/// <summary>Theme</summary>
		object Theme { get; }
	}

	/// <summary>_Page</summary>
	[PublishedContentModel("page")]
	public partial class Page : PublishedContentModel, IPage
	{
#pragma warning disable 0109 // new is redundant
		public new const string ModelTypeAlias = "page";
		public new const PublishedItemType ModelItemType = PublishedItemType.Content;
#pragma warning restore 0109

		public Page(IPublishedContent content)
			: base(content)
		{ }

#pragma warning disable 0109 // new is redundant
		public new static PublishedContentType GetModelContentType()
		{
			return PublishedContentType.Get(ModelItemType, ModelTypeAlias);
		}
#pragma warning restore 0109

		public static PublishedPropertyType GetModelPropertyType<TValue>(Expression<Func<Page, TValue>> selector)
		{
			return PublishedContentModelUtility.GetModelPropertyType(GetModelContentType(), selector);
		}

		///<summary>
		/// altTitle: A title used on the page which overrides the name of this content.
		///</summary>
		[ImplementPropertyType("altTitle")]
		public string AltTitle
		{
			get { return GetAltTitle(this); }
		}

		/// <summary>Static getter for altTitle</summary>
		public static string GetAltTitle(IPage that) { return that.GetPropertyValue<string>("altTitle"); }

		///<summary>
		/// Description: A short paragraph to describe the contents of this page.
		///</summary>
		[ImplementPropertyType("description")]
		public string Description
		{
			get { return GetDescription(this); }
		}

		/// <summary>Static getter for Description</summary>
		public static string GetDescription(IPage that) { return that.GetPropertyValue<string>("description"); }

		///<summary>
		/// Image: An image to define the content of this page.
		///</summary>
		[ImplementPropertyType("image")]
		public Umbraco.Web.Models.ImageCropDataSet Image
		{
			get { return GetImage(this); }
		}

		/// <summary>Static getter for Image</summary>
		public static Umbraco.Web.Models.ImageCropDataSet GetImage(IPage that) { return that.GetPropertyValue<Umbraco.Web.Models.ImageCropDataSet>("image"); }

		///<summary>
		/// SEO: SEO information for this page.
		///</summary>
		[ImplementPropertyType("sEO")]
		public Epiphany.SeoMetadata.SeoMetadata SEO
		{
			get { return GetSEO(this); }
		}

		/// <summary>Static getter for SEO</summary>
		public static Epiphany.SeoMetadata.SeoMetadata GetSEO(IPage that) { return that.GetPropertyValue<Epiphany.SeoMetadata.SeoMetadata>("sEO"); }

		///<summary>
		/// Subtitle
		///</summary>
		[ImplementPropertyType("subtitle")]
		public string Subtitle
		{
			get { return GetSubtitle(this); }
		}

		/// <summary>Static getter for Subtitle</summary>
		public static string GetSubtitle(IPage that) { return that.GetPropertyValue<string>("subtitle"); }

		///<summary>
		/// Theme
		///</summary>
		[ImplementPropertyType("theme")]
		public object Theme
		{
			get { return GetTheme(this); }
		}

		/// <summary>Static getter for Theme</summary>
		public static object GetTheme(IPage that) { return that.GetPropertyValue("theme"); }
	}
}
