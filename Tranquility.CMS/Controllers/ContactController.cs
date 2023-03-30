using System;
using System.Net.Mail;
using System.Web.Mvc;
using Tranquility.Service.Interface;
using Tranquility.ViewModel;
using Umbraco.Web.Mvc;

namespace Tranquility.Controllers
{
    public class ContactController : SurfaceController
    {
        private readonly INotificationService _notificationService;

        public ContactController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }
        [HttpGet]
        public ActionResult Contact()
        {
            return PartialView("Partials/_ContactForm", new ContactFormViewModel());
        }
    }
}