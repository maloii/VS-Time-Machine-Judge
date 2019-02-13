package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Entity(name = "GROUPS")
@AllArgsConstructor
@NoArgsConstructor
public class Group {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    private LocalDateTime dateCreate = LocalDateTime.now();
    private String name;
    private Integer sort;
    private Boolean selected = false;
    private Boolean close = false;
    private Long timeSatart;


    @ManyToOne
    @JoinColumn
    private Competition competition;

    @ManyToOne
    @JoinColumn
    private League league;

    @ManyToOne
    @JoinColumn
    private Round round;

    @ManyToMany
    private Set<Sportsman> sportsmens;
}
