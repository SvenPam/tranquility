using System;
using System.Net.Mail;
using Tranquility.Service.Interface;
using Umbraco.Core.Logging;

namespace Tranquility.Service
{
    public class EmailService : IEmailService
    {
        public void SendEmail(MailMessage email)
        {
            try
            {
                SmtpClient client = new SmtpClient();
                client.Send(email);
            }
            catch (Exception ex)
            {
                LogHelper.Error(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType, $"Tried to send email, but failed. Email was, to: {email.To}, from: {email.From}, with the subject: {email.Subject}. The body was: {email.Body}", ex);
            }
        }
    }
}