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
public class Round {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;
    private LocalDateTime dateCreate = LocalDateTime.now();



    private String name;
    private TypeRound typeRound;
    private TypeGenerateRound typeGenerateRound;
    private Integer countSportsmen = 0;
    private Boolean selected = false;
    private Integer countLap = 0;
    private Integer sort = 0;
    private Boolean close = false;


    @ManyToOne
    @JoinColumn
    private Competition competition;

    @OneToMany(cascade = CascadeType.ALL,
            fetch = FetchType.EAGER,
            mappedBy = "round")
    private Set<Group> groups;
}
