using System;
using System.Net.Mail;
using System.Web.Mvc;
using Tranquility.ViewModel;
using Umbraco.Web.Mvc;

namespace Tranquility.Controllers
{
    public class ContactController : SurfaceController
    {
        [HttpGet]
        public ActionResult Contact()
        {
            return PartialView("Partials/_ContactForm", new ContactFormViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Contact(ContactFormViewModel contactFormVM)
        {
            if (!ModelState.IsValid)
            {
                return CurrentUmbracoPage();
            }

                   

       
            return PartialView("Partials/_ContactForm");
        }
    }
}