package site.pathos.domain.model.enums;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

public enum MetricType {
    ACCURACY {
        @Override
        public boolean matches(String line) {
            line = line.toLowerCase(Locale.ROOT);
            return line.startsWith("mean acc:");
        }

        @Override
        public double parseValue(String line) {
            return parseAfterColon(line);
        }
    },
    IOU {
        @Override
        public boolean matches(String line) {
            line = line.toLowerCase(Locale.ROOT);
            return line.startsWith("mean iou:");
        }

        @Override
        public double parseValue(String line) {
            return parseAfterColon(line);
        }
    },
    LOSS {
        @Override
        public boolean matches(String line) {
            line = line.toLowerCase(Locale.ROOT);
            return line.startsWith("epoch") && line.contains("loss=");
        }

        @Override
        public double parseValue(String line) {
            int index = line.toLowerCase(Locale.ROOT).indexOf("loss=");
            String valuePart = line.substring(index + 5).trim().split("\\s")[0];
            return Double.parseDouble(valuePart);
        }
    }
    ;

    public abstract boolean matches(String line);
    public abstract double parseValue(String line);

    public static Optional<MetricType> parseLine(String line) {
        return Arrays.stream(values())
                .filter(type -> type.matches(line))
                .findFirst();
    }

    private static double parseAfterColon(String line) {
        try {
            return Double.parseDouble(line.split(":")[1].trim());
        } catch (Exception e) {
            return -1;
        }
    }
}