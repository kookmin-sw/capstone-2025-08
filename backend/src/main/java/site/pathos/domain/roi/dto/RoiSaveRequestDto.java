package site.pathos.domain.roi.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RoiSaveRequestDto {

    private Long roiId; // 기존 ROI면 존재, 없으면 null
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;

    private List<String> imageNames;
}