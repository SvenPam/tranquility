using System.Net.Mail;

namespace Tranquility.Service.Interface
{
    public interface IEmailService
    {
        void SendEmail(MailMessage email);
    }
}
