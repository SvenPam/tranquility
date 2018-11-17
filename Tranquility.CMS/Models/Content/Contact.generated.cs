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
	/// <summary>Contact</summary>
	[PublishedContentModel("contact")]
	public partial class Contact : PublishedContentModel, IPage
	{
#pragma warning disable 0109 // new is redundant
		public new const string ModelTypeAlias = "contact";
		public new const PublishedItemType ModelItemType = PublishedItemType.Content;
#pragma warning restore 0109

		public Contact(IPublishedContent content)
			: base(content)
		{ }

#pragma warning disable 0109 // new is redundant
		public new static PublishedContentType GetModelContentType()
		{
			return PublishedContentType.Get(ModelItemType, ModelTypeAlias);
		}
#pragma warning restore 0109

		public static PublishedPropertyType GetModelPropertyType<TValue>(Expression<Func<Contact, TValue>> selector)
		{
			return PublishedContentModelUtility.GetModelPropertyType(GetModelContentType(), selector);
		}

		///<summary>
		/// Content
		///</summary>
		[ImplementPropertyType("content")]
		public Newtonsoft.Json.Linq.JToken Content
		{
			get { return this.GetPropertyValue<Newtonsoft.Json.Linq.JToken>("content"); }
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
	}
}