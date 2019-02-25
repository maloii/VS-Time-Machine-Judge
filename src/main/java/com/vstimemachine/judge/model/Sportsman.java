package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Sportsman {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;
    private LocalDateTime dateCreate = LocalDateTime.now();

    private String firstName;
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

    private Boolean selected = false;

    @OneToMany(cascade = CascadeType.ALL,
            mappedBy = "sportsman")
    private Set<Transponder> transponders;

    @ManyToOne
    @JoinColumn(name="competition_id")
    private Competition competition;

    @ManyToMany
    @JsonIgnore
    private Set<Group> groups;

    public void addGroup(Group group){
        if(groups == null) groups = new HashSet<Group>();
        groups.add(group);
    }
}
