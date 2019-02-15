package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Competition {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    private String name;
    private String map;
    private String logo;
    private LocalDateTime dateCreate = LocalDateTime.now();
    private Boolean selected = false;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Gate> gates;

    @ManyToMany(cascade = CascadeType.ALL)
    private Set<Sportsman> sportsmens;

    @OneToMany(cascade = CascadeType.ALL,
            fetch = FetchType.EAGER,
            mappedBy = "competition")
    private Set<Group> groups;

    @OneToMany(cascade = CascadeType.ALL,
            fetch = FetchType.EAGER,
            mappedBy = "competition")
    private Set<League> leagues;
}
