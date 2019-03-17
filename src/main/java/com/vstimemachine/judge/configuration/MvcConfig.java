package com.vstimemachine.judge.configuration;

import com.vstimemachine.judge.controller.storage.StorageProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/login").setViewName("login");
        registry.setOrder(Ordered.HIGHEST_PRECEDENCE);
    }

}
