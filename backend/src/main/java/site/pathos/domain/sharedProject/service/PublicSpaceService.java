package site.pathos.domain.sharedProject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.repository.ModelRepository;
import site.pathos.domain.sharedProject.dto.request.CreateSharedProjectDto;
import site.pathos.domain.sharedProject.entity.DataSet;
import site.pathos.domain.sharedProject.entity.SharedProject;
import site.pathos.domain.sharedProject.entity.Tag;
import site.pathos.domain.sharedProject.enums.DataType;
import site.pathos.domain.sharedProject.repository.DataSetRepository;
import site.pathos.domain.sharedProject.repository.SharedProjectRepository;
import site.pathos.domain.sharedProject.repository.TagRepository;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;
import site.pathos.global.security.util.SecurityUtil;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicSpaceService {

    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final SharedProjectRepository sharedProjectRepository;
    private final DataSetRepository dataSetRepository;
    private final ModelRepository modelRepository;
    private final TagRepository tagRepository;

    public void createSharedProject(CreateSharedProjectDto requestDto,
                                    List<MultipartFile> originalImages,
                                    List<MultipartFile> resultingImages) {

        Long userId = SecurityUtil.getCurrentUserId();

        User user = getUser(userId);

        Model model = getModel(requestDto.modelId());

        SharedProject sharedProject = SharedProject.builder()
                .user(user)
                .model(model)
                .title(requestDto.title())
                .description(requestDto.description())
                .build();
        sharedProjectRepository.save(sharedProject);

        for(String name : requestDto.tags()){
            Tag tag = Tag.builder()
                    .name(name)
                    .sharedProject(sharedProject)
                    .build();
            tagRepository.save(tag);
        }

        String thumbnailImagePath = getThumbnailImagePath(originalImages, resultingImages, sharedProject.getId());

        sharedProject.assignThumbnailPath(thumbnailImagePath);

        for(MultipartFile originalImage : originalImages){
            String key = "shared-project/" + sharedProject.getId() + "/original/" + originalImage.getOriginalFilename().replaceAll("\\s+", "_");

            s3Service.uploadFile(key, originalImage);

            DataSet dataSet = DataSet.builder()
                    .sharedProject(sharedProject)
                    .imagePath(key)
                    .dataType(DataType.ORIGINAL)
                    .build();
            dataSetRepository.save(dataSet);
        }

        for(MultipartFile resultImage : resultingImages){
            String key = "shared-project/" + sharedProject.getId() + "/result/" + resultImage.getOriginalFilename().replaceAll("\\s+", "_");

            s3Service.uploadFile(key, resultImage);

            DataSet dataSet = DataSet.builder()
                    .sharedProject(sharedProject)
                    .imagePath(key)
                    .dataType(DataType.RESULT)
                    .build();
            dataSetRepository.save(dataSet);
        }
    }

    private User getUser(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private String getThumbnailImagePath(List<MultipartFile> originalImages, List<MultipartFile> resultingImages,
                                         Long sharedProjectId){
        MultipartFile thumbnailImage = null;
        if (resultingImages != null && !resultingImages.isEmpty()) {
            thumbnailImage = resultingImages.get(0);
        } else if (originalImages != null && !originalImages.isEmpty()) {
            thumbnailImage = originalImages.get(0);
        }
        String thumbnailPath;
        if (thumbnailImage != null) {
            thumbnailPath = "shared-project/" + sharedProjectId + "/thumbnail/";
            s3Service.uploadFile(thumbnailPath, thumbnailImage);
        } else {
            thumbnailPath = "default/thumbnail.png";
        }
        return thumbnailPath;
    }

    private Model getModel(Long modelId){
        return modelRepository.findById(modelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MODEL_NOT_FOUND));
    }
}
