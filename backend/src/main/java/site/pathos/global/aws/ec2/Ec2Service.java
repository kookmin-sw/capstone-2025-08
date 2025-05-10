package site.pathos.global.aws.ec2;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import site.pathos.domain.subProject.dto.request.SubProjectTilingRequestDto;
import site.pathos.global.aws.config.AwsProperty;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class Ec2Service {

    private final Ec2Client ec2Client;
    private final AwsProperty awsProperty;

    @Async("tileExecutor")
    public void asyncLaunchTilingInstance(SubProjectTilingRequestDto tilingRequestDto) {
        String userDataScript = generateUserDataScript(tilingRequestDto.s3Path(), tilingRequestDto.subProjectId());

        InstanceMarketOptionsRequest marketOptions = InstanceMarketOptionsRequest.builder()
                .marketType(MarketType.SPOT)
                .spotOptions(SpotMarketOptions.builder()
                        .spotInstanceType(SpotInstanceType.ONE_TIME)
                        .build())
                .build();

        IamInstanceProfileSpecification profileSpecification = IamInstanceProfileSpecification.builder()
                .name("PathosTilingImage")
                .build();

        RunInstancesRequest request = RunInstancesRequest.builder()
                .imageId("ami-05a7f3469a7653972")
                .instanceType(InstanceType.C6_I_XLARGE)
                .instanceMarketOptions(marketOptions)
                .minCount(1)
                .maxCount(1)
                .iamInstanceProfile(profileSpecification)
                .userData(Base64.getEncoder().encodeToString(userDataScript.getBytes(StandardCharsets.UTF_8)))
                .blockDeviceMappings(getBlockDeviceMapping())
                .tagSpecifications(getTags(tilingRequestDto.subProjectId()))
                .build();

        try {
            ec2Client.runInstances(request);
            log.info("EC2 인스턴스 실행 완료 - SubProject {}", tilingRequestDto.subProjectId());
        } catch (Ec2Exception e) {
            log.error("EC2 실행 실패 (AWS 오류) - SubProject {} - {}",
                    tilingRequestDto.subProjectId(), e.awsErrorDetails().errorMessage(), e);

        } catch (Exception e) {
            log.error("EC2 실행 실패 (예상치 못한 오류) - SubProject {}",
                    tilingRequestDto.subProjectId(), e);
        }
    }

    private String generateUserDataScript(String s3Path, Long subProjectId) {
        String bucket = awsProperty.s3().bucket();
        String callback = awsProperty.callback().url();

        return """
        #!/bin/bash
        sudo apt update -y
        sudo apt install -y awscli libvips-tools

        mkdir -p /tmp/tiling
        cd /tmp/tiling

        aws s3 cp %s original.svs

        vips dzsave original.svs output_slide \\
            --tile-size=512 \\
            --overlap=1 \\
            --suffix .jpg[Q=85] \\
            --depth onepixel
        
        vips thumbnail original.svs thumbnail.jpg 600

        aws s3 cp output_slide.dzi s3://%s/sub-project/%d/tiles/output_slide.dzi
        aws s3 cp output_slide_files/ s3://%s/sub-project/%d/tiles/output_slide_files/ --recursive
        aws s3 cp thumbnail.jpg s3://%s/sub-project/%d/thumbnail/thumbnail.jpg
        
        curl -X POST %s/internal/tiling-complete -H "Content-Type: application/json" -d '{"subProjectId": %d}'
        
        shutdown -h now
        """.formatted(
                s3Path,
                bucket, subProjectId,
                bucket, subProjectId,
                bucket, subProjectId,
                callback, subProjectId
        );
    }

    private List<TagSpecification> getTags(Long subProjectId) {
        return List.of(TagSpecification.builder()
                .resourceType(ResourceType.INSTANCE)
                .tags(Tag.builder().key("Name").value("Tiling-" + subProjectId).build())
                .build());
    }

    private List<BlockDeviceMapping> getBlockDeviceMapping() {
        return List.of(BlockDeviceMapping.builder()
                .deviceName("/dev/xvda")
                .ebs(EbsBlockDevice.builder()
                        .volumeSize(32)
                        .volumeType(VolumeType.GP3)
                        .deleteOnTermination(true)
                        .build())
                .build());
    }
}
