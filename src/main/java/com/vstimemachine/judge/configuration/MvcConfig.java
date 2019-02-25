package com.vstimemachine.judge.configuration;

import com.vstimemachine.judge.controller.storage.StorageProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Autowired
    private StorageProperties storageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/"+storageProperties.getUploadDir()+"/**")
                .addResourceLocations("file:"+storageProperties.getUploadDir()+"/");
        registry.addResourceHandler("/"+storageProperties.getUploadDir()+"/**").
						addResourceLocations("file:"+storageProperties.getUploadDir()+"/");
    }

}
