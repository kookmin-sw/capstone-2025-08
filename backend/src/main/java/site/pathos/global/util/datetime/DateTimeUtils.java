package site.pathos.global.util.datetime;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class DateTimeUtils {
    public static String dateTimeToStringFormat(LocalDateTime createdAt) {
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(
                "yyyy. MM. dd (E) HH:mm", Locale.ENGLISH
        );
        return createdAt.format(dateTimeFormatter);
    }
}
