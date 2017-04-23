using System;

namespace Tranquility.Helpers
{
    public static class DateTimeExtension
    {
        public static string Friendly(this DateTime date)
        {
            if (date.Date == DateTime.Now.Date)
            {
                return "Today at " + date.ToString("HH:MM");
            }
            else if (date.Date > DateTime.Now.AddDays(-6))
            {
                return date.DayOfWeek.ToString();
            }

            return date.ToString("dd-MMM-yy");
        }
    }
}