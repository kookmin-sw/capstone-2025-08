package site.pathos.global.util.datetime;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class DateTimeUtils {
    public static String dateTimeToStringFormat(LocalDateTime dateTime) {
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(
                "yyyy. MM. dd (E)", Locale.ENGLISH
        );
        return dateTime.format(dateTimeFormatter);
    }

    public static String dateTimeToDateFormat(LocalDateTime dateTime) {
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return dateTime.format(dateTimeFormatter);
    }
}
