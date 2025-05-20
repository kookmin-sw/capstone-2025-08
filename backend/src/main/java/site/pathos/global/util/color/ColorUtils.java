package site.pathos.global.util.color;

import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;

public class ColorUtils {

    public static int[] hexToRgb(String hex) {
        if (hex == null || !hex.matches("^#?[0-9a-fA-F]{6}$")) {
            throw new BusinessException(ErrorCode.HEX_COLOR_INVALID);
        }

        hex = hex.substring(1);

        int r = Integer.parseInt(hex.substring(0, 2), 16);
        int g = Integer.parseInt(hex.substring(2, 4), 16);
        int b = Integer.parseInt(hex.substring(4, 6), 16);

        return new int[] { r, g, b };
    }
}
