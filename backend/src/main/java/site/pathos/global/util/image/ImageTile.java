package site.pathos.global.util.image;

import java.awt.image.BufferedImage;

public record ImageTile(int row, int col, BufferedImage image) {}