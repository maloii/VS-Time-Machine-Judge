package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.ToString;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Data
@ToString(exclude = "password")
@Entity
public class Judge  {

    public static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    private @Id @GeneratedValue Long id;

    private String name;

    private @JsonIgnore String password;

    private String[] roles;

    public void setPassword(String password) {
        this.password = PASSWORD_ENCODER.encode(password);
    }

    public Judge() {}

    public Judge(String name, String password, String... roles) {

        this.name = name;
        this.setPassword(password);
        this.roles = roles;
    }

}