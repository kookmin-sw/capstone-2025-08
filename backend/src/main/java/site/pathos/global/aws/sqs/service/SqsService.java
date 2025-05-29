package site.pathos.global.aws.sqs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Log4j 대신 Slf4j로 변경 (Spring Boot에서 선호)
import org.springframework.stereotype.Service;
import site.pathos.domain.model.dto.InferenceRequestMessageDto;
import site.pathos.global.aws.config.AwsProperty;
import site.pathos.domain.model.dto.TrainingRequestMessageDto;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class SqsService {

    private final SqsClient sqsClient;
    private final AwsProperty awsProperty;
    private final ObjectMapper objectMapper;

    public void sendTrainingRequest(TrainingRequestMessageDto message) {
        try {
            String messageBody = objectMapper.writeValueAsString(message);
            sendMessage(messageBody);
        } catch (Exception e) {
            throw new RuntimeException("SQS 메시지 변환 실패", e);
        }
    }

    public void sendInferenceRequest(InferenceRequestMessageDto message) {
        try {
            String messageBody = objectMapper.writeValueAsString(message);
            sendMessage(messageBody);
        } catch (Exception e) {
            throw new RuntimeException("SQS 메시지 변환 실패", e);
        }
    }

    public void sendMessage(String messageBody) {
        SendMessageRequest request = SendMessageRequest.builder()
                .queueUrl(awsProperty.sqs().queueUrl())
                .messageBody(messageBody)
                .messageGroupId("default")
                .messageDeduplicationId(String.valueOf(System.currentTimeMillis()))
                .build();

        log.info("SQS 메시지 전송 요청: QueueUrl={}, GroupId=default", awsProperty.sqs().queueUrl());

        SendMessageResponse response = sqsClient.sendMessage(request);

        log.info("SQS 메시지 전송 완료. MessageId={}, StatusCode={}",
                response.messageId(), response.sdkHttpResponse().statusCode());
    }
}