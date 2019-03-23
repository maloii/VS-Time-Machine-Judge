package com.vstimemachine.judge.configuration;

import com.vstimemachine.judge.component.SpringDataJpaUserDetailsService;
import com.vstimemachine.judge.model.Judge;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration  extends WebSecurityConfigurerAdapter {

    @Autowired
    private SpringDataJpaUserDetailsService userDetailsService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
                .userDetailsService(this.userDetailsService)
                .passwordEncoder(Judge.PASSWORD_ENCODER);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                .antMatchers("/built/**",
                        "/screen/**",
                        "/api/data/**",///////////<<<< ЭТО НАДО ПОФИКСИТЬ, ДЫРЕНЬ!!!!
                        "/api/report/**",////////////<<<< ЭТО НАДО ПОФИКСИТЬ, ДЫРЕНЬ!!!!
                        "/payroll/**",////////////<<<< ЭТО НАДО ПОФИКСИТЬ, ДЫРЕНЬ!!!!
                        "/broadcast.css",
                        "/upload/**",
                        "/main.css",
                        "/bootstrap.min.css",
                        "/signin.css",
                        "/images/**")
                        .permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .loginPage("/login")
                .defaultSuccessUrl("/", true)
                .permitAll()
                .and()
                .httpBasic()
                .and()
                .csrf().disable()
                .logout()
                .logoutSuccessUrl("/");
    }

}