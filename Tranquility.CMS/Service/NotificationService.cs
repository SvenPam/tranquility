using System.Collections.Generic;
using System.Net.Mail;
using Tranquility.Service.Interface;
using Tranquility.ViewModel;
using Umbraco.Core.Services;

namespace Tranquility.Service
{
    public class NotificationService : Interface.INotificationService
    {
        private readonly IEmailService _emailService;
        private readonly IUserService _userService;

        public NotificationService(IEmailService emailService, IUserService userService)
        {
            _emailService = emailService;
            _userService = userService;
        }

        public void SendEnquiry(ContactFormViewModel contactVM)
        {
            int totalRecords;
            var users = _userService.GetAll(0, 20, out totalRecords);
            var recipients = string.Empty;

            foreach (var user in users)
            {
                recipients += $"{user.Email};";
            }

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