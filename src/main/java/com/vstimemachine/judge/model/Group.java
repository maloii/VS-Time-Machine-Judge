package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity(name = "GROUPS")
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
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
    private Set<Sportsman> sportsmen;

    public Group(String name, Integer sort, Round round) {
        this.name = name;
        this.round = round;
        this.sort = sort;
    }

    public void addSportsman(Sportsman sportsman){
        if(sportsmen == null) sportsmen = new HashSet<Sportsman>();
        sportsmen.add(sportsman);
    }
}
