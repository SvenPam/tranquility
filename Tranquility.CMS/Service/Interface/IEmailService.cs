using System.Net.Mail;

namespace Tranquility.Service.Interface
{
    public interface IEmailService : IDependency
    {
        void SendEmail(MailMessage email);
    }
}
