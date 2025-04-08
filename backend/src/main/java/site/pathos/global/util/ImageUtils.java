package site.pathos.global.util;

import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ImageUtils {

    public static byte[] convertToByteArray(BufferedImage image) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("이미지 변환 실패", e);
        }
    }

    public static BufferedImage mergeTiles(List<MultipartFile> imageFiles, int width, int height) throws IOException {
        BufferedImage mergedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = mergedImage.createGraphics();

        for (MultipartFile file : imageFiles) {
            String[] parts = file.getOriginalFilename().replace(".png", "").split("_");
            int row = Integer.parseInt(parts[parts.length - 2]);
            int col = Integer.parseInt(parts[parts.length - 1]);

            BufferedImage tile = ImageIO.read(file.getInputStream());

            int tileWidth = tile.getWidth();
            int tileHeight = tile.getHeight();

            int x = col * tileWidth;
            int y = row * tileHeight;

            g2d.drawImage(tile, x, y, null);
        }

        g2d.dispose();
        return mergedImage;
    }

    public static int getDivisionCountDynamic(int dimension) {
        if (dimension <= 20000) return 1;
        else if (dimension <= 30000) return 2;
        else if (dimension <= 40000) return 3;
        else return 3 + (int) Math.ceil((dimension - 40000) / 10000.0);
    }

    // 이미지 자르기 메서드
    public static List<BufferedImage> sliceImageByROI(BufferedImage image, int roiX, int roiY, int roiWidth, int roiHeight) {
        List<BufferedImage> tiles = new ArrayList<>();

        int cols = getDivisionCountDynamic(roiWidth);
        int rows = getDivisionCountDynamic(roiHeight);

        int baseTileWidth = roiWidth / cols;
        int baseTileHeight = roiHeight / rows;

        int widthRemainder = roiWidth % cols;
        int heightRemainder = roiHeight % rows;

        int yOffset = roiY;

        for (int row = 0; row < rows; row++) {
            int tileHeight = baseTileHeight + (row < heightRemainder ? 1 : 0);
            int xOffset = roiX;

            for (int col = 0; col < cols; col++) {
                int tileWidth = baseTileWidth + (col < widthRemainder ? 1 : 0);

                BufferedImage tile = image.getSubimage(xOffset, yOffset, tileWidth, tileHeight);
                tiles.add(tile);

                xOffset += tileWidth;
            }

            yOffset += tileHeight;
        }

        return tiles;
    }
}
