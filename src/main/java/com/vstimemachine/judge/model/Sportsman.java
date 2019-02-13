package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Sportsman {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;
    private LocalDateTime dateCreate = LocalDateTime.now();

    private String firstName;

    @NotNull
    private String lastName;
    private String middleName;
    private String nick;
    private String photo;
    private String city;
    private Integer age;
    private String team;
    private String phone;
    private String email;
    private String country;

    @OneToMany(cascade = CascadeType.ALL,
            fetch = FetchType.EAGER,
            mappedBy = "sportsman")
    private Set<Transponder> transponders;

    @ManyToMany
    private Set<Competition> competitions;

    @ManyToMany
    private Set<Group> groups;
}
