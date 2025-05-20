package site.pathos.global.util.datetime;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
import org.ocpsoft.prettytime.PrettyTime;

public class DateTimeUtils {

    private static final DateTimeFormatter STRING_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy. MM. dd (E)", Locale.ENGLISH);
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final PrettyTime PRETTY_TIME = new PrettyTime(Locale.ENGLISH);

    /**
     * yyyy. MM. dd (E) 형식의 문자열로 변환 (영어 요일)
     */
    public static String dateTimeToStringFormat(LocalDateTime dateTime) {
        return dateTime.format(STRING_FORMATTER);
    }

    /**
     * yyyy-MM-dd 형식의 문자열로 변환
     */
    public static String dateTimeToDateFormat(LocalDateTime dateTime) {
        return dateTime.format(DATE_FORMATTER);
    }

    /**
     * 경과 시간을 "n minute(s)/hour(s)/day(s)/month(s)/year(s) ago" 형태로 반환
     */
    public static String dateTimeToAgoFormat(LocalDateTime dateTime) {
        Date date = Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
        return PRETTY_TIME.format(date);
    }
}
