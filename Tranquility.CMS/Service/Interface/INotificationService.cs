namespace Tranquility.Service.Interface
{
    public interface INotificationService : IDependency
    {
        void SendEnquiry(Tranquility.ViewModel.ContactFormViewModel contactVM);
    }
}
    