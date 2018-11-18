﻿using System;
using System.Configuration;
using System.Threading.Tasks;
using TweetSharp;

namespace Tranquility.Service
{
    public class TweetService
    {
        public async Task Tweet(string tweet)
        {
            try
            {
                TwitterService service = new TwitterService(ConfigurationManager.AppSettings["Twitter.ConsumerKey"], ConfigurationManager.AppSettings["Twitter.ConsumerSecret"]);
                service.AuthenticateWith(ConfigurationManager.AppSettings["Twitter.UserToken"], ConfigurationManager.AppSettings["Twitter.UserSecret"]);
                var result = await service.SendTweetAsync(new SendTweetOptions
                {
                    Status = tweet
                });
            }
            catch (Exception e)
            {
                Umbraco.Core.Logging.LogHelper.Error(this.GetType(), "Failed to send tweet.", e);
            }
        }

    }
}