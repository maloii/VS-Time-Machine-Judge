package com.vstimemachine.judge.controller.storage;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.img")
public class StorageProperties {

    private String uploadDir;
    private String[] extensionImg;
}