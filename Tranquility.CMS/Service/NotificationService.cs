using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Web;
using Tranquility.Service.Interface;
using Tranquility.ViewModel;

namespace Tranquility.Service
{
    public class NotificationService : INotificationService
    {
        private readonly IEmailService _emailService;

        public NotificationService(IEmailService emailService)
        {
            _emailService = emailService;
        }

        public void SendEnquiry(ContactFormViewModel contactVM)
        {
            //Generate an email message object to send
            MailMessage email = new MailMessage("no-reply@ste-pam.com", "spammenter@live.com");
            email.Subject = "Contact Form Request";
            email.Body = contactVM.Message;

            email.Body = "Test";
            email.Priority = MailPriority.Normal;
            email.IsBodyHtml = true;

            _emailService.SendEmail(email);
        }
    }
}