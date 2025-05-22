package site.pathos.domain.sharedProject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.entity.ProjectModel;
import site.pathos.domain.model.entity.UserModel;
import site.pathos.domain.model.repository.ModelRepository;
import site.pathos.domain.model.repository.ProjectModelRepository;
import site.pathos.domain.model.repository.UserModelRepository;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.sharedProject.dto.request.CreateSharedProjectDto;
import site.pathos.domain.sharedProject.dto.response.GetProjectWithModelsResponseDto;
import site.pathos.domain.sharedProject.dto.response.GetSharedProjectDetailResponseDto;
import site.pathos.domain.sharedProject.dto.response.GetSharedProjectsResponseDto;
import site.pathos.domain.sharedProject.entity.DataSet;
import site.pathos.domain.sharedProject.entity.DownloadLog;
import site.pathos.domain.sharedProject.entity.SharedProject;
import site.pathos.domain.sharedProject.entity.Tag;
import site.pathos.domain.sharedProject.enums.DataType;
import site.pathos.domain.sharedProject.repository.DataSetRepository;
import site.pathos.domain.sharedProject.repository.DownloadLogRepository;
import site.pathos.domain.sharedProject.repository.SharedProjectRepository;
import site.pathos.domain.sharedProject.repository.TagRepository;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.common.PaginationResponse;
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
    private final ProjectRepository projectRepository;
    private final ProjectModelRepository projectModelRepository;
    private static final int SHARED_PROJECTS_PAGE_SIZE = 12;
    private final UserModelRepository userModelRepository;
    private final DownloadLogRepository downloadLogRepository;

    @Transactional
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

    public GetProjectWithModelsResponseDto getProjectWithModels(){
        Long userId = SecurityUtil.getCurrentUserId();

        List<Project> projects = projectRepository.findAllByUserId(userId);

        List<GetProjectWithModelsResponseDto.ProjectModelsDto> projectDtos = projects.stream()
                .map(project -> {
                    List<ProjectModel> projectModels = projectModelRepository.findByProjectIdOrderByCreatedAt(project.getId());

                    List<GetProjectWithModelsResponseDto.ProjectModelsDto.ModelsDto> modelDtos = projectModels.stream()
                            .map(pm -> new GetProjectWithModelsResponseDto.ProjectModelsDto.ModelsDto(
                                    pm.getModel().getId(),
                                    pm.getModel().getName()
                            ))
                            .toList();

                    return new GetProjectWithModelsResponseDto.ProjectModelsDto(
                            project.getId(),
                            project.getTitle(),
                            modelDtos
                    );
                })
                .toList();

        return new GetProjectWithModelsResponseDto(projectDtos);
    }

    public GetSharedProjectDetailResponseDto getSharedProjectDetail(Long sharedProjectId){
        SharedProject sharedProject = getSharedProject(sharedProjectId);

        User author = userRepository.findById(sharedProject.getUser().getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Model model = getModel(sharedProject.getModel().getId());

        GetSharedProjectDetailResponseDto.ModelInfo modelInfo
                = new GetSharedProjectDetailResponseDto.ModelInfo(model.getId(), model.getName());

        return new GetSharedProjectDetailResponseDto(
                sharedProject.getId(),
                sharedProject.getTitle(),
                sharedProject.getDescription(),
                sharedProject.getCreatedAt(),
                author.getName(),
                modelInfo,
                getTags(sharedProjectId),
                getDataSets(sharedProjectId, DataType.ORIGINAL),
                getDataSets(sharedProjectId, DataType.RESULT)
        );
    }

    private List<String> getTags(Long sharedProjectId){
        List<Tag> tags = tagRepository.findAllBySharedProjectId(sharedProjectId);

        return tags.stream()
                .map(Tag::getName)
                .toList();
    }

    private SharedProject getSharedProject(Long sharedProject){
        return sharedProjectRepository.findById(sharedProject)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHARED_PROJECT_NOT_FOUND));
    }

    private List<String> getDataSets(Long sharedProjectId, DataType dataType){
        return dataSetRepository.findAllBySharedProjectIdAndDataType(sharedProjectId, dataType)
                .stream()
                .map(DataSet::getImagePath)
                .toList();
    }

    public GetSharedProjectsResponseDto getSharedProjects(String search, int page){
        Page<SharedProject> sharedProjectPage = getSharedProjectPage(search, page);
        List<GetSharedProjectsResponseDto.GetSharedProjectsResponseDetailDto> sharedProjects = getSharedProjectDetails(sharedProjectPage);

        PaginationResponse<GetSharedProjectsResponseDto.GetSharedProjectsResponseDetailDto> sharedProjectPages =
                new PaginationResponse<>(
                      sharedProjects,
                      SHARED_PROJECTS_PAGE_SIZE,
                        sharedProjectPage.getNumber() + 1,
                        sharedProjectPage.getTotalPages(),
                        sharedProjectPage.getTotalElements()
                );

        List<GetSharedProjectsResponseDto.BestProjectDto> bestProjects = sharedProjectRepository
                .findTop3ByOrderByDownloadCountDesc()
                .stream()
                .map(sp -> {
                    String presignedUrl = s3Service.getPresignedUrl(sp.getUser().getProfileImagePath());

                    return new GetSharedProjectsResponseDto.BestProjectDto(
                            sp.getId(),
                            sp.getTitle(),
                            sp.getUser().getName(),
                            presignedUrl,
                            sp.getDownloadCount()
                    );
                })
                .toList();

        return new GetSharedProjectsResponseDto(
                sharedProjectPages,
                bestProjects
                );
    }

    private Page<SharedProject> getSharedProjectPage(String search, int page) {
        Pageable pageable = PageRequest.of(page - 1, SHARED_PROJECTS_PAGE_SIZE, Sort.by(Sort.Direction.DESC, "createdAt"));

            Page<SharedProject> sharedProjectPage;
            if (search != null && !search.isBlank()) {
                sharedProjectPage = sharedProjectRepository.searchByTitleOrTag(search, pageable);
            } else {
                sharedProjectPage = sharedProjectRepository.findAll(pageable);
            }

        return sharedProjectPage;
    }

    private List<GetSharedProjectsResponseDto.GetSharedProjectsResponseDetailDto> getSharedProjectDetails(Page<SharedProject> sharedProjectPage) {
        return sharedProjectPage.stream()
                .map(sharedProject -> new GetSharedProjectsResponseDto.GetSharedProjectsResponseDetailDto(
                        sharedProject.getId(),
                        sharedProject.getTitle(),
                        getAuthor(sharedProject).getName(),
                        sharedProject.getThumbnailImagePath(),
                        getTags(sharedProject.getId()),
                        sharedProject.getDownloadCount()
                ))
                .toList();
    }

    private User getAuthor(SharedProject sharedProject){
        return userRepository.findById(sharedProject.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional
    public void downloadModel(Long sharedProjectId, Long modelId){
        Long userId = SecurityUtil.getCurrentUserId();
        User user = getUser(userId);
        SharedProject sharedProject = getSharedProject(sharedProjectId);
        Model model = getModel(modelId);

        boolean alreadyExists = userModelRepository.existsByUserAndModel(user, model);
        if(alreadyExists) {
            throw new BusinessException(ErrorCode.ALREADY_DOWNLOADED_MODEL);
        }

        UserModel userModel = UserModel.builder()
                .user(user)
                .model(model)
                .build();
        userModelRepository.save(userModel);

        DownloadLog downloadLog = DownloadLog.builder()
                .user(user)
                .sharedProject(sharedProject)
                .build();
        downloadLogRepository.save(downloadLog);

        sharedProject.incrementDownloadCount();
        sharedProjectRepository.save(sharedProject);
    }
}
