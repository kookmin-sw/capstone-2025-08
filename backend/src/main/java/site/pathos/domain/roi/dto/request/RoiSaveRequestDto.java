package site.pathos.domain.roi.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RoiSaveRequestDto {

    private Long roiId;
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;

    private List<String> imageNames;
}