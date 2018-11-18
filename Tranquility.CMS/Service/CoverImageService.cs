using System.Configuration;
using System.Net;
using Tranquility.Models.Content;

namespace Tranquility.Service
{
    public class CoverImageService
    {
        public string GetCoverImage(IPage page) {
            byte[] result;
            string html = $"<div class=\"hero\"> <div class=\"hero__container\"><h1 class=\"lead\">{ (string.IsNullOrWhiteSpace(page.AltTitle) ? page.Name : page.AltTitle) }</h1><p class=\"hero__description\">{page.Description}</p><div class=\"hero__meta\"> <span>Ste Pammenter <span class=\"hero__description\">//</span> <a href=\"https://twitter.com/svenpam\">@SvenPam</a></span><time>{page.CreateDate.ToString("dd-MMM-yyyy")}</time></div></div></div>";
            string css = "a{color:#29b8b9;text-decoration:none}.hero{height:630px;width:1200px;background-image:url(https://ste-pam.com/a/dist/img/generic/2-100.jpg);background-size:100%;background-repeat:no-repeat;display:flex;justify-content:center;align-items:center;font-family:SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace;color:#FFF}.hero__container{padding:30px;width:70%;background-color:#343a40;box-shadow:#292d32 4px 4px 0 0;text-align:center}.hero__meta{display:flex;justify-content:space-between}.hero__description{color:#868E96}";
            using (var client = new WebClient())
            {
                client.Credentials = new NetworkCredential(ConfigurationManager.AppSettings["HTML2CSS.UserId"], ConfigurationManager.AppSettings["HTML2CSS.Key"]);
                result = client.UploadValues(
                    "https://hcti.io/v1/image",
                    "POST",
                    new System.Collections.Specialized.NameValueCollection()
                    {
                        { "html", html }, { "css", css }
                    }
                    );
            }
            return Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(System.Text.Encoding.UTF8.GetString(result)).url;
        } 
    }
}