using System.ComponentModel.DataAnnotations;

namespace Tranquility.ViewModel
{
    public class ContactFormViewModel
    {
            [Required]
            [MaxLength(100)]
            public string Name { get; set; }
            [Required]
            [EmailAddress]
            public string Email { get; set; }
            [Phone]
            public string Phone { get; set; }
            [Required]
            public string Message { get; set; }
            //public Group Group { get; set; }
            //public int GroupID { get; set; }
            //public SelectList GroupsDropDown { get; set; }
    }
}